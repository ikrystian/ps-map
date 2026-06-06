<?php
require_once __DIR__ . '/helpers.php';

// ════════════════════════════════════════════════════════════════════════════════
// HELPERS LOKALNE
// ════════════════════════════════════════════════════════════════════════════════

function jsonResponse(array $data, int $status = 200): void
{
  http_response_code($status);
  header('Content-Type: application/json');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function getIntParam(string $key, array $source = []): int
{
  $source = $source ?: $_GET;
  return isset($source[$key]) ? (int) $source[$key] : 0;
}

function getStats(PDO $db): array
{
  return [
    'total' => $db->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
    'pending' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'pending'")->fetchColumn(),
    'sent' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'sent'")->fetchColumn(),
    'error' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'error'")->fetchColumn(),
  ];
}

function getAllMessages(PDO $db): array
{
  return $db->query("SELECT * FROM messages ORDER BY id DESC")->fetchAll();
}

function insertMessage(PDO $db, string $type, array $parsed, string $originalData, string $rawPayload): int
{
  $stmt = $db->prepare("
        INSERT INTO messages (type, original_data, raw_payload, ai_response, trello_time, trello_name, trello_desc, status)
        VALUES (:type, :original_data, :raw_payload, :ai_response, :trello_time, :trello_name, :trello_desc, 'pending')
    ");
  $stmt->execute([
    'type' => $type,
    'original_data' => $originalData,
    'raw_payload' => $rawPayload,
    'ai_response' => $parsed['slack'],
    'trello_time' => $parsed['trello_time'],
    'trello_name' => $parsed['trello_name'],
    'trello_desc' => $parsed['trello_desc'],
  ]);
  return (int) $db->lastInsertId();
}

// ════════════════════════════════════════════════════════════════════════════════
// ROUTING
// ════════════════════════════════════════════════════════════════════════════════

$isCli = php_sapi_name() === 'cli' || empty($_SERVER['REQUEST_METHOD']);
$isGet = $_SERVER['REQUEST_METHOD'] === 'GET' || !empty($_GET['action']);
$isPost = $_SERVER['REQUEST_METHOD'] === 'POST';

// ── CLI / CRON ────────────────────────────────────────────────────────────────
if ($isCli) {
  $db = getDbConnection();
  echo json_encode(runCronJobs($db), JSON_UNESCAPED_UNICODE) . "\n";
  exit;
}

// ── GET / AJAX ACTIONS ────────────────────────────────────────────────────────
if ($isGet) {
  handleGetRequest();
}

// ── POST (webhooks) ───────────────────────────────────────────────────────────
if ($isPost) {
  handlePostRequest();
}

jsonResponse(['ok' => false, 'error' => 'Nieprawidłowe zapytanie.'], 400);

// ════════════════════════════════════════════════════════════════════════════════
// OBSŁUGA GET / AJAX
// ════════════════════════════════════════════════════════════════════════════════

function handleGetRequest(): void
{
  $db = getDbConnection();
  $action = $_GET['action'] ?? '';
  $id = getIntParam('id');

  match (true) {
    // Wysyłka natychmiastowa
    in_array($action, ['send_now', 'send_slack']) && $id > 0
    => jsonResponse(sendMessageFromDb($db, $id)),

    // Wysyłka do Trello
    $action === 'send_trello' && $id > 0
    => jsonResponse(sendTrelloTaskFromDb($db, $id)),

    // Wysyłka do obu
    $action === 'send_all' && $id > 0
    => handleSendAll($db, $id),

    // Planowanie wysyłki
    $action === 'schedule' && $id > 0
    => handleSchedule($db, $id),

    // Aktualizacja treści
    $action === 'update' && $id > 0
    => handleUpdate($db, $id),

    // Usunięcie wiadomości
    $action === 'delete' && $id > 0
    => handleDelete($db, $id),

    // Uruchomienie crona
    $action === 'cron' || isset($_GET['cron'])
    => jsonResponse(runCronJobs($db)),

    // Widok panelu (domyślny)
    default
    => renderPanel($db),
  };
}

function handleSendAll(PDO $db, int $id): void
{
  $slackResult = sendMessageFromDb($db, $id);
  $trelloResult = sendTrelloTaskFromDb($db, $id);

  if ($slackResult['ok'] && $trelloResult['ok']) {
    jsonResponse(['ok' => true]);
  }

  $errors = [];
  if (!$slackResult['ok'])
    $errors[] = 'Slack: ' . ($slackResult['error'] ?? 'błąd');
  if (!$trelloResult['ok'])
    $errors[] = 'Trello: ' . ($trelloResult['error'] ?? 'błąd');

  jsonResponse(['ok' => false, 'error' => implode(' | ', $errors)]);
}

function handleSchedule(PDO $db, int $id): void
{
  $time = $_POST['scheduled_at'] ?? $_GET['scheduled_at'] ?? '';

  if (!$time) {
    jsonResponse(['ok' => false, 'error' => 'Brak podanej daty i godziny.']);
  }

  $formatted = date('Y-m-d H:i:s', strtotime($time));
  $stmt = $db->prepare("UPDATE messages SET scheduled_at = :time, status = 'pending', error = NULL WHERE id = :id");
  $stmt->execute(['time' => $formatted, 'id' => $id]);

  jsonResponse(['ok' => true, 'scheduled_at' => $formatted]);
}

function handleUpdate(PDO $db, int $id): void
{
  $content = $_POST['ai_response'] ?? '';

  if ($content === '') {
    jsonResponse(['ok' => false, 'error' => 'Treść wiadomości nie może być pusta.']);
  }

  $trelloName = $_POST['trello_name'] ?? null;
  $trelloDesc = $_POST['trello_desc'] ?? null;
  $trelloTime = isset($_POST['trello_time']) && $_POST['trello_time'] !== ''
    ? (int) $_POST['trello_time']
    : null;

  $stmt = $db->prepare("
    UPDATE messages
    SET ai_response  = :ai_response,
        trello_name  = COALESCE(:trello_name,  trello_name),
        trello_desc  = COALESCE(:trello_desc,  trello_desc),
        trello_time  = COALESCE(:trello_time,  trello_time)
    WHERE id = :id
  ");
  $stmt->execute([
    'ai_response' => $content,
    'trello_name' => $trelloName,
    'trello_desc' => $trelloDesc,
    'trello_time' => $trelloTime,
    'id' => $id,
  ]);

  jsonResponse(['ok' => true, 'ai_response' => $content, 'trello_name' => $trelloName, 'trello_desc' => $trelloDesc, 'trello_time' => $trelloTime]);
}

function handleDelete(PDO $db, int $id): void
{
  $stmt = $db->prepare("DELETE FROM messages WHERE id = :id");
  $stmt->execute(['id' => $id]);

  jsonResponse(['ok' => true]);
}

// ════════════════════════════════════════════════════════════════════════════════
// OBSŁUGA POST (WEBHOOKS)
// ════════════════════════════════════════════════════════════════════════════════

function handlePostRequest(): void
{
  $db = getDbConnection();
  $rawPayload = file_get_contents('php://input');
  $data = json_decode($rawPayload, true) ?? [];

  // Webhook: slack_response
  if (isset($data['slack_response'])) {
    logDebug("Obsługa webhooka slack_response...");
    $parsed = parseAiResponse(getAiResponseForSlackResponse($data));
    $id = insertMessage($db, 'slack_response', $parsed, json_encode($data, JSON_UNESCAPED_UNICODE), $rawPayload);
    logDebug("Zapisano slack_response, ID: $id");
    jsonResponse(['ok' => true, 'message' => 'Otrzymano odpowiedź z AI i zapisano w bazie.', 'id' => $id, 'ai_response' => $parsed['slack']]);
  }

  // Webhook: commits
  if (isset($data['commits'])) {
    logDebug("Obsługa webhooka commits...");
    $parsed = parseAiResponse(getAiSummary($data));
    $id = insertMessage($db, 'commits', $parsed, json_encode($data, JSON_UNESCAPED_UNICODE), $rawPayload);
    logDebug("Zapisano commits, ID: $id");
    jsonResponse(['ok' => true, 'message' => 'Podsumowanie commits wygenerowane i zapisane.', 'id' => $id, 'ai_response' => $parsed['slack']]);
  }

  // Webhook / POST: opis wdrożenia
  $description = trim($data['description'] ?? $_POST['description'] ?? '');
  $url = trim($data['url'] ?? $_POST['url'] ?? '');

  if ($description !== '') {
    logDebug("Obsługa POST z opisem...");

    if ($url && !filter_var($url, FILTER_VALIDATE_URL)) {
      jsonResponse(['ok' => false, 'error' => 'Podaj prawidłowy adres URL (np. https://przykład.pl).'], 422);
    }

    $parsed = parseAiResponse(getAiResponseForPost($description, $url));
    $originalData = json_encode(array_merge($data, $_POST), JSON_UNESCAPED_UNICODE);
    $rawForDb = $rawPayload ?: json_encode($_POST, JSON_UNESCAPED_UNICODE);
    $id = insertMessage($db, 'general_post', $parsed, $originalData, $rawForDb);

    logDebug("Zapisano general_post, ID: $id");
    jsonResponse(['ok' => true, 'message' => 'Opis wdrożenia przetworzony i zapisany.', 'id' => $id, 'ai_response' => $parsed['slack']]);
  }

  jsonResponse(['ok' => false, 'error' => 'Nieprawidłowe zapytanie POST (brak wymaganych danych).'], 400);
}

// ════════════════════════════════════════════════════════════════════════════════
// WIDOK PANELU (HTML)
// ════════════════════════════════════════════════════════════════════════════════

function renderPanel(PDO $db): void
{
  $stats = getStats($db);
  $messages = getAllMessages($db);
  ?>
  <!DOCTYPE html>
  <html lang="pl">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Synchronizacji Slack</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap"
      rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="main.js"></script>

  </head>

  <body>

    <header>
      <div>
        <h1>Slack Sync</h1>
        <p style="color:var(--text-muted);font-size:.95rem;margin-top:.2rem;">Kolejka wiadomości AI do wdrożeń i
          powiadomień</p>
      </div>
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
        <div class="refresh-indicator" id="auto-refresh-container">
          <span class="refresh-dot active" id="auto-refresh-dot"></span>
          <span>Autoodświeżanie: <strong id="auto-refresh-timer"
              style="color:white;font-family:'DM Mono',monospace;">60s</strong></span>
          <button onclick="toggleAutoRefresh()" class="btn-refresh-control" id="btn-auto-refresh-toggle">⏸️ Pauza</button>
        </div>
        <button id="btn-cron" class="btn btn-secondary" onclick="triggerCron()">⚙️ Uruchom Cron</button>
      </div>
    </header>

    <div class="container">

      <!-- STATYSTYKI -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value"><?= $stats['total'] ?></div>
          <div class="stat-label">Wszystkie</div>
        </div>
        <div class="stat-card pending">
          <div class="stat-value" id="stat-pending"><?= $stats['pending'] ?></div>
          <div class="stat-label">Oczekujące</div>
        </div>
        <div class="stat-card sent">
          <div class="stat-value"><?= $stats['sent'] ?></div>
          <div class="stat-label">Wysłane</div>
        </div>
        <div class="stat-card error">
          <div class="stat-value"><?= $stats['error'] ?></div>
          <div class="stat-label">Błędy</div>
        </div>
      </div>

      <!-- LISTA WIADOMOŚCI -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">📝 Ostatnio wygenerowane powiadomienia</div>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Utworzono</th>
                <th>Treść wygenerowana przez AI</th>
                <th>Zadanie Trello</th>
                <th>Status</th>
                <th>wysyłka</th>
                <th>Wysłano o</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <?php if (empty($messages)): ?>
                <tr>
                  <td colspan="8" style="text-align:center;color:var(--text-muted);padding:3rem;">
                    Brak wiadomości w bazie danych. Przetestuj webhooki za pomocą poleceń cURL!
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($messages as $msg): ?>
                  <?php renderMessageRow($msg); ?>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <?php renderEditModal(); ?>
    <?php renderPayloadModal(); ?>

    <div id="toast-container"></div>
  </body>

  </html>
  <?php
  exit;
}

// ── Wiersz tabeli ─────────────────────────────────────────────────────────────

function renderMessageRow(array $msg): void
{
  $id = $msg['id'];
  $status = esc($msg['status']);
  $trelloStatus = esc($msg['trello_status'] ?? 'pending');
  $statusLabel = fn(string $s) => match ($s) { 'sent' => 'Wysłano', 'error' => 'Błąd', default => 'Oczekuje'};
  ?>
  <?php
  $createdAt = $msg['created_at'] ?? '';
  $displayTime = '—';
  if ($createdAt) {
    try {
      $date = new DateTime($createdAt, new DateTimeZone('UTC'));
      $date->setTimezone(new DateTimeZone('Europe/Warsaw'));
      $displayTime = $date->format('Y-m-d H:i:s');
    } catch (Exception $e) {
      $displayTime = $createdAt;
    }
  }
  ?>
  <tr id="row-<?= $id ?>" data-type="<?= esc($msg['type']) ?>" data-status="<?= $status ?>"
    data-payload="<?= esc($msg['raw_payload'] ?: $msg['original_data']) ?>"
    data-trello-name="<?= esc($msg['trello_name'] ?? '') ?>" data-trello-desc="<?= esc($msg['trello_desc'] ?? '') ?>"
    data-trello-time="<?= (int) ($msg['trello_time'] ?? 0) ?>" data-created-at="<?= esc($displayTime) ?>">

    <td><?= $id ?></td>

    <td><span class="badge badge-type"
        style="font-family:'DM Mono',monospace;font-weight:normal;letter-spacing:0;"><?= esc($displayTime) ?></span></td>

    <td class="response-cell">
      <div class="response-content" id="content-<?= $id ?>" data-raw="<?= esc($msg['ai_response']) ?>">
        <?= esc($msg['ai_response']) ?>
        <div class="response-fade"></div>
      </div>
    </td>

    <td class="trello-cell">
      <?php if (!empty($msg['trello_name'])): ?>
        <div class="trello-task">
          <span class="trello-name"><?= esc($msg['trello_name']) ?></span>
          <span class="trello-time">⏱️ <?= esc(formatMinutesToTrelloTime((int) $msg['trello_time'])) ?></span>
          <?php if (!empty($msg['trello_desc'])): ?>
            <div class="trello-desc-wrapper">
              <details class="trello-desc-details">
                <summary class="trello-desc-summary">Opis zadania</summary>
                <div class="trello-desc-content"><?= esc($msg['trello_desc']) ?></div>
              </details>
            </div>
          <?php endif; ?>
        </div>
      <?php else: ?>
        <span style="color:var(--text-muted);font-size:.85rem;">—</span>
      <?php endif; ?>
    </td>

    <td>
      <div style="display:flex;flex-direction:column;gap:.35rem;">
        <span class="badge badge-<?= $status ?>" id="badge-status-slack-<?= $id ?>" style="white-space:nowrap;">
          Slack: <?= $statusLabel($status) ?>
        </span>
        <span class="badge badge-<?= $trelloStatus ?>" id="badge-status-trello-<?= $id ?>" style="white-space:nowrap;">
          Trello: <?= $statusLabel($trelloStatus) ?>
        </span>
      </div>
    </td>

    <td style="font-size:.85rem;" id="scheduled-at-<?= $id ?>">
      <?= $msg['scheduled_at'] ? esc($msg['scheduled_at']) : '<span style="color:var(--text-muted);">Brak</span>' ?>
    </td>

    <td style="font-size:.8rem;line-height:1.4;">
      <div id="sent-at-slack-<?= $id ?>">
        Slack: <?= $msg['sent_at'] ? esc($msg['sent_at']) : '<span style="color:var(--text-muted);">—</span>' ?>
      </div>
      <div id="sent-at-trello-<?= $id ?>" style="margin-top:.25rem;">
        Trello:
        <?= !empty($msg['trello_sent_at']) ? esc($msg['trello_sent_at']) : '<span style="color:var(--text-muted);">—</span>' ?>
      </div>
    </td>

    <td>
      <div class="action-group" style="justify-content:flex-end;">
        <button class="btn btn-secondary" style="padding:.4rem .6rem;font-size:.8rem;" onclick="showPayload(<?= $id ?>)"
          title="Pokaż surowe zapytanie JSON">🔍</button>

        <div class="schedule-form" <?= ($status === 'sent' && $trelloStatus === 'sent') ? 'style="display:none;"' : '' ?>>
          <input type="datetime-local" class="input-date" id="schedule-time-<?= $id ?>"
            value="<?= $msg['scheduled_at'] ? date('Y-m-d\TH:i', strtotime($msg['scheduled_at'])) : '' ?>">
          <button class="btn btn-secondary" style="padding:.4rem .6rem;font-size:.8rem;"
            onclick="scheduleMessage(<?= $id ?>)" id="btn-sched-<?= $id ?>" title="Zaplanuj wysyłkę">⏰</button>
        </div>

        <button class="btn btn-secondary" style="padding:.4rem .6rem;font-size:.8rem;" onclick="openEditModal(<?= $id ?>)"
          id="btn-edit-<?= $id ?>" title="Edytuj treść" <?= ($status === 'sent' && $trelloStatus === 'sent') ? 'style="display:none;"' : '' ?>>✏️</button>

        <button class="btn btn-slack" style="padding:.4rem .6rem;font-size:.8rem;" onclick="sendSlack(<?= $id ?>)"
          id="btn-slack-<?= $id ?>" title="Wyślij do Slacka" <?= ($status === 'sent') ? 'style="display:none;"' : '' ?>>💬</button>

        <button class="btn btn-trello" style="padding:.4rem .6rem;font-size:.8rem;" onclick="sendTrello(<?= $id ?>)"
          id="btn-trello-<?= $id ?>" title="Wyślij do Trello" <?= ($trelloStatus === 'sent') ? 'style="display:none;"' : '' ?>>📋</button>

        <button class="btn" style="padding:.4rem .8rem;font-size:.8rem;" onclick="sendAll(<?= $id ?>)"
          id="btn-all-<?= $id ?>" title="Wyślij do Slacka i Trello" <?= ($status === 'sent' && $trelloStatus === 'sent') ? 'style="display:none;"' : '' ?>>🚀</button>

        <button class="btn btn-danger" style="padding:.4rem .6rem;font-size:.8rem;"
          onclick="deleteMessage(<?= $id ?>)">🗑️</button>
      </div>
    </td>
  </tr>
  <?php
}

// ── Modale ────────────────────────────────────────────────────────────────────

function renderEditModal(): void
{ ?>
  <div id="edit-modal" class="modal">
    <div class="modal-content" style="max-width:760px;">
      <div class="modal-header">
        <h3 style="font-family:'Syne',sans-serif;display:flex;align-items:center;gap:.5rem;color:white;">
          ✏️ Edytuj wiadomość <span id="modal-msg-id" style="color:var(--primary);"></span>
        </h3>
        <button class="modal-close" onclick="closeEditModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-info-bar">
          <span>Typ: <strong id="modal-msg-type" class="badge badge-type"></strong></span>
          <span>Status: <strong id="modal-msg-status" class="badge"></strong></span>
        </div>
        <div id="modal-warning-sent"
          style="display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;padding:.8rem;border-radius:8px;font-size:.85rem;align-items:center;gap:.5rem;">
          ⚠️ Ta wiadomość została już wysłana. Edycja zmieni tylko treść lokalnej kopii w bazie danych.
        </div>

        <!-- Slack -->
        <div style="display:flex;flex-direction:column;gap:.4rem;">
          <label for="edit-textarea" style="font-size:.9rem;color:var(--text-muted);font-weight:500;">
            💬 Treść wiadomości Slack (obsługuje Markdown Slacka):
          </label>
          <textarea id="edit-textarea" placeholder="Wpisz treść wiadomości..."></textarea>
        </div>

        <!-- Trello -->
        <div
          style="margin-top:1.25rem;padding-top:1.25rem;border-top:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:.85rem;">
          <div
            style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);font-weight:600;">
            📋 Zadanie Trello</div>

          <div style="display:flex;flex-direction:column;gap:.35rem;">
            <label for="edit-trello-name" style="font-size:.9rem;color:var(--text-muted);font-weight:500;">Nazwa
              zadania:</label>
            <input type="text" id="edit-trello-name" class="input-date" style="width:100%;"
              placeholder="Nazwa zadania Trello...">
          </div>

          <div style="display:flex;flex-direction:column;gap:.35rem;">
            <label for="edit-trello-desc" style="font-size:.9rem;color:var(--text-muted);font-weight:500;">Opis
              zadania:</label>
            <textarea id="edit-trello-desc" style="min-height:90px;" placeholder="Opis zadania Trello..."></textarea>
          </div>

          <div style="display:flex;flex-direction:column;gap:.35rem;">
            <label for="edit-trello-time" style="font-size:.9rem;color:var(--text-muted);font-weight:500;">Czas pracy
              (minuty):</label>
            <input type="number" id="edit-trello-time" class="input-date" style="width:160px;" placeholder="np. 90"
              min="0">
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeEditModal()">Anuluj</button>
        <button id="btn-modal-save" class="btn" onclick="saveEditedMessage()">💾 Zapisz zmiany</button>
      </div>
    </div>
  </div>
<?php }

function renderPayloadModal(): void
{ ?>
  <div id="payload-modal" class="modal">
    <div class="modal-content" style="max-width:800px;">
      <div class="modal-header">
        <h3 style="font-family:'Syne',sans-serif;display:flex;align-items:center;gap:.5rem;color:white;">
          🔍 Surowe zapytanie JSON <span id="modal-payload-id" style="color:var(--primary);"></span>
        </h3>
        <button class="modal-close" onclick="closePayloadModal()">&times;</button>
      </div>
      <div class="modal-body">
        <pre id="payload-content"
          style="background:#1e293b;padding:1rem;border-radius:8px;overflow-x:auto;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:.85rem;max-height:60vh;border:1px solid rgba(255,255,255,.1);"></pre>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closePayloadModal()">Zamknij</button>
        <button class="btn" onclick="copyPayload()">📋 Kopiuj JSON</button>
      </div>
    </div>
  </div>
<?php }