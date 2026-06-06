<?php
require_once __DIR__ . '/helpers.php';


// ─── OBSŁUGA ZAPYTANIA Z LINII POLECEŃ (CLI / CRON NAZWA.PL) ──────────────────
if (php_sapi_name() === 'cli' || empty($_SERVER['REQUEST_METHOD'])) {
  $db = getDbConnection();
  $res = runCronJobs($db);
  echo json_encode($res, JSON_UNESCAPED_UNICODE) . "\n";
  exit;
}

// ─── OBSŁUGA ZAPYTAŃ GET ORAZ AKCJI AJAX ──────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET' || !empty($_GET['action'])) {
  $db = getDbConnection();
  $action = $_GET['action'] ?? '';
  $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

  // 1. AJAX: Wyślij do Slacka
  if (($action === 'send_now' || $action === 'send_slack') && $id > 0) {
    $res = sendMessageFromDb($db, $id);
    header('Content-Type: application/json');
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
    exit;
  }

  // 1b. AJAX: Wyślij do Trello
  if ($action === 'send_trello' && $id > 0) {
    $res = sendTrelloTaskFromDb($db, $id);
    header('Content-Type: application/json');
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
    exit;
  }

  // 1c. AJAX: Wyślij do obu (Slack i Trello)
  if ($action === 'send_all' && $id > 0) {
    $slackRes = sendMessageFromDb($db, $id);
    $trelloRes = sendTrelloTaskFromDb($db, $id);

    header('Content-Type: application/json');
    if ($slackRes['ok'] && $trelloRes['ok']) {
      echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    } else {
      $errors = [];
      if (!$slackRes['ok'])
        $errors[] = 'Slack: ' . ($slackRes['error'] ?? 'błąd');
      if (!$trelloRes['ok'])
        $errors[] = 'Trello: ' . ($trelloRes['error'] ?? 'błąd');
      echo json_encode(['ok' => false, 'error' => implode(' | ', $errors)], JSON_UNESCAPED_UNICODE);
    }
    exit;
  }

  // 2. AJAX: Zaplanuj wysyłkę
  if ($action === 'schedule' && $id > 0) {
    $time = $_POST['scheduled_at'] ?? $_GET['scheduled_at'] ?? '';
    if ($time) {
      $formattedTime = date('Y-m-d H:i:s', strtotime($time));
      $stmt = $db->prepare("UPDATE messages SET scheduled_at = :time, status = 'pending', error = NULL WHERE id = :id");
      $stmt->execute(['time' => $formattedTime, 'id' => $id]);
      header('Content-Type: application/json');
      echo json_encode(['ok' => true, 'scheduled_at' => $formattedTime], JSON_UNESCAPED_UNICODE);
      exit;
    } else {
      header('Content-Type: application/json');
      echo json_encode(['ok' => false, 'error' => 'Brak podanej daty i godziny.'], JSON_UNESCAPED_UNICODE);
      exit;
    }
  }

  // 3. AJAX: Aktualizacja wiadomości
  if ($action === 'update' && $id > 0) {
    $content = $_POST['ai_response'] ?? '';
    if ($content !== '') {
      $stmt = $db->prepare("UPDATE messages SET ai_response = :ai_response WHERE id = :id");
      $stmt->execute(['ai_response' => $content, 'id' => $id]);
      header('Content-Type: application/json');
      echo json_encode(['ok' => true, 'ai_response' => $content], JSON_UNESCAPED_UNICODE);
      exit;
    } else {
      header('Content-Type: application/json');
      echo json_encode(['ok' => false, 'error' => 'Treść wiadomości nie może być pusta.'], JSON_UNESCAPED_UNICODE);
      exit;
    }
  }

  // 4. AJAX: Usuń wiadomość
  if ($action === 'delete' && $id > 0) {
    $stmt = $db->prepare("DELETE FROM messages WHERE id = :id");
    $stmt->execute(['id' => $id]);
    header('Content-Type: application/json');
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
  }

  // 4. AJAX / URL: Uruchom Cron
  if ($action === 'cron' || isset($_GET['cron'])) {
    $res = runCronJobs($db);
    if (isset($_GET['cron'])) {
      // Dla wywołania np. przez systemowy Cron / curl:
      header('Content-Type: application/json');
      echo json_encode($res, JSON_UNESCAPED_UNICODE);
      exit;
    }
    header('Content-Type: application/json');
    echo json_encode($res, JSON_UNESCAPED_UNICODE);
    exit;
  }

  // Pobranie statystyk i listy wiadomości na potrzeby interfejsu panelu
  $stats = [
    'total' => $db->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
    'pending' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'pending'")->fetchColumn(),
    'sent' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'sent'")->fetchColumn(),
    'error' => $db->query("SELECT COUNT(*) FROM messages WHERE status = 'error'")->fetchColumn(),
  ];

  $stmt = $db->query("SELECT * FROM messages ORDER BY id DESC");
  $messages = $stmt->fetchAll();
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
  </head>

  <body>

    <header>
      <div>
        <h1>Slack Sync</h1>
        <p style="color: var(--text-muted); font-size: 0.95rem; margin-top: 0.2rem;">Kolejka wiadomości AI do wdrożeń i
          powiadomień</p>
      </div>
      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div class="refresh-indicator" id="auto-refresh-container">
          <span class="refresh-dot active" id="auto-refresh-dot"></span>
          <span>Autoodświeżanie: <strong id="auto-refresh-timer"
              style="color: white; font-family: 'DM Mono', monospace;">60s</strong></span>
          <button onclick="toggleAutoRefresh()" class="btn-refresh-control" id="btn-auto-refresh-toggle">
            ⏸️ Pauza
          </button>
        </div>
        <button id="btn-cron" class="btn btn-secondary" onclick="triggerCron()">
          ⚙️ Uruchom Cron
        </button>
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

      <!-- KARTA GŁÓWNA - LISTA -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">
            📝 Ostatnio wygenerowane powiadomienia
          </div>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 60px;">ID</th>
                <th style="width: 120px;">Typ</th>
                <th>Treść wygenerowana przez AI</th>
                <th style="width: 250px;">Zadanie Trello</th>
                <th style="width: 150px;">Status</th>
                <th style="width: 160px;">Planowana wysyłka</th>
                <th style="width: 180px;">Wysłano o</th>
                <th style="width: 320px; text-align: right;">Akcje</th>
              </tr>
            </thead>
            <tbody>
              <?php if (empty($messages)): ?>
                <tr>
                  <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    Brak wiadomości w bazie danych. Przetestuj webhooki za pomocą poniższych poleceń cURL!
                  </td>
                </tr>
              <?php else: ?>
                <?php foreach ($messages as $msg): ?>
                  <tr id="row-<?= $msg['id'] ?>" data-type="<?= esc($msg['type']) ?>" data-status="<?= esc($msg['status']) ?>"
                    data-payload="<?= esc($msg['raw_payload'] ?: $msg['original_data']) ?>">
                    <td><?= $msg['id'] ?></td>
                    <td>
                      <span class="badge badge-type"><?= esc($msg['type']) ?></span>
                    </td>
                    <td class="response-cell">
                      <div class="response-content" id="content-<?= $msg['id'] ?>" data-raw="<?= esc($msg['ai_response']) ?>">
                        <?= esc($msg['ai_response']) ?>
                        <div class="response-fade"></div>
                      </div>
                      <span class="toggle-expand" onclick="toggleExpand(<?= $msg['id'] ?>)"
                        id="toggle-<?= $msg['id'] ?>">Rozwiń</span>
                    </td>
                    <td class="trello-cell">
                      <?php if (!empty($msg['trello_name'])): ?>
                        <div class="trello-task">
                          <span class="trello-name"><?= esc($msg['trello_name']) ?></span>
                          <span class="trello-time">
                            ⏱️ <?= esc(formatMinutesToTrelloTime((int) $msg['trello_time'])) ?>
                          </span>
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
                        <span style="color: var(--text-muted); font-size: 0.85rem;">—</span>
                      <?php endif; ?>
                    </td>
                    <td>
                      <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                        <span class="badge badge-<?= $msg['status'] ?>" id="badge-status-slack-<?= $msg['id'] ?>"
                          style="white-space: nowrap;">
                          Slack:
                          <?= $msg['status'] === 'pending' ? 'Oczekuje' : ($msg['status'] === 'sent' ? 'Wysłano' : 'Błąd') ?>
                        </span>
                        <span class="badge badge-<?= $msg['trello_status'] ?? 'pending' ?>"
                          id="badge-status-trello-<?= $msg['id'] ?>" style="white-space: nowrap;">
                          Trello:
                          <?= ($msg['trello_status'] ?? 'pending') === 'pending' ? 'Oczekuje' : (($msg['trello_status'] ?? 'pending') === 'sent' ? 'Wysłano' : 'Błąd') ?>
                        </span>
                      </div>
                    </td>
                    <td style="font-size: 0.85rem;" id="scheduled-at-<?= $msg['id'] ?>">
                      <?= $msg['scheduled_at'] ? esc($msg['scheduled_at']) : '<span style="color:var(--text-muted);">Brak</span>' ?>
                    </td>
                    <td style="font-size: 0.8rem; line-height: 1.4;">
                      <div id="sent-at-slack-<?= $msg['id'] ?>">
                        Slack:
                        <?= $msg['sent_at'] ? esc($msg['sent_at']) : '<span style="color:var(--text-muted);">—</span>' ?>
                      </div>
                      <div id="sent-at-trello-<?= $msg['id'] ?>" style="margin-top: 0.25rem;">
                        Trello:
                        <?= !empty($msg['trello_sent_at']) ? esc($msg['trello_sent_at']) : '<span style="color:var(--text-muted);">—</span>' ?>
                      </div>
                    </td>
                    <td>
                      <div class="action-group" style="justify-content: flex-end;">
                        <!-- Podgląd JSON -->
                        <button class="btn btn-secondary" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                          onclick="showPayload(<?= $msg['id'] ?>)" title="Pokaż surowe zapytanie JSON">
                          🔍 JSON
                        </button>

                        <!-- Planowanie -->
                        <div class="schedule-form">
                          <input type="datetime-local" class="input-date" id="schedule-time-<?= $msg['id'] ?>"
                            value="<?= $msg['scheduled_at'] ? date('Y-m-d\TH:i', strtotime($msg['scheduled_at'])) : '' ?>">
                          <button class="btn btn-secondary" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                            onclick="scheduleMessage(<?= $msg['id'] ?>)" id="btn-sched-<?= $msg['id'] ?>"
                            title="Zaplanuj wysyłkę">
                            ⏰ Zapisz
                          </button>
                        </div>

                        <!-- Edytuj treść -->
                        <button class="btn btn-secondary" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                          onclick="openEditModal(<?= $msg['id'] ?>)" id="btn-edit-<?= $msg['id'] ?>"
                          title="Edytuj treść wiadomości">
                          ✏️ Edytuj
                        </button>

                        <!-- Wyślij do Slacka -->
                        <button class="btn btn-slack" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                          onclick="sendSlack(<?= $msg['id'] ?>)" id="btn-slack-<?= $msg['id'] ?>" title="Wyślij do Slacka">
                          💬 Slack
                        </button>

                        <!-- Wyślij do Trello -->
                        <button class="btn btn-trello" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                          onclick="sendTrello(<?= $msg['id'] ?>)" id="btn-trello-<?= $msg['id'] ?>" title="Wyślij do Trello">
                          📋 Trello
                        </button>

                        <!-- Wyślij do obu -->
                        <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"
                          onclick="sendAll(<?= $msg['id'] ?>)" id="btn-all-<?= $msg['id'] ?>"
                          title="Wyślij do Slacka i Trello">
                          🚀 Wyślij
                        </button>

                        <!-- Usuń -->
                        <button class="btn btn-danger" style="padding: 0.4rem 0.6rem; font-size: 0.8rem;"
                          onclick="deleteMessage(<?= $msg['id'] ?>)">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                <?php endforeach; ?>
              <?php endif; ?>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DOKUMENTACJA / CURL -->
      <div class="panel-card curl-tab">
        <div class="curl-title">
          🔌 Przykładowe zapytania do testów (np. z GitHub Actions)
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
          Poniższe polecenia cURL symulują zapytania, które przychodzą bezpośrednio z akcji GitHub Actions. Uruchom je w
          terminalu, aby dodać testowe powiadomienia do bazy.
        </p>

        <h4 style="margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 600;">1. Webhook: Deployment / Slack Response
          (`slack_response`)</h4>
        <div class="code-block">
          <button class="btn-copy" onclick="copyCode(this)">Kopiuj</button>
          <pre>curl -X POST http://localhost:8000/index.php \
        -H "Content-Type: application/json" \
        -d '{
          "slack_response": {
            "channel": "<?= esc(SLACK_CHANNEL_ID) ?>"
          },
          "deployment": {
            "env": "production",
            "status": "success",
            "version": "v2.0.4",
            "actor": "krystian-k",
            "repository": "my-awesome-slack-app",
            "workflow": "Production Deploy",
            "commit_sha": "7f9c8d32b5b3a4a112233445566778899aabbcc"
          }
        }'</pre>
        </div>

        <h4 style="margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 600;">2. Webhook: Zmiany w kodzie / Commity
          (`commits`)</h4>
        <div class="code-block">
          <button class="btn-copy" onclick="copyCode(this)">Kopiuj</button>
          <pre>curl -X POST http://localhost:8000/index.php \
        -H "Content-Type: application/json" \
        -d '{
          "repository": "slack-bot-integration",
          "commits": [
            {
              "message": "fix: resolve SQLite connection issue in production"
            },
            {
              "message": "feat: add beautiful dashboard for scheduled messages"
            },
            {
              "message": "docs: update API testing commands"
            }
          ]
        }'</pre>
        </div>

        <h4 style="margin-bottom: 0.5rem; color: #cbd5e1; font-weight: 600;">3. Zwykłe zapytanie POST z opisem i
          opcjonalnym URL (np. standardowy formularz)</h4>
        <div class="code-block">
          <button class="btn-copy" onclick="copyCode(this)">Kopiuj</button>
          <pre>curl -X POST http://localhost:8000/index.php \
        -d "description=Naprawiono krytyczny blad w module platnosci oraz zoptymalizowano zapytania SQL." \
        -d "url=https://github.com/krystian-k/slack/commit/123456"</pre>
        </div>
      </div>
    </div>

    <!-- Modal edycji wiadomości -->
    <div id="edit-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 style="font-family: 'Syne', sans-serif; display: flex; align-items: center; gap: 0.5rem; color: white;">
            ✏️ Edytuj wiadomość <span id="modal-msg-id" style="color: var(--primary);"></span>
          </h3>
          <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-info-bar">
            <span>Typ: <strong id="modal-msg-type" class="badge badge-type"></strong></span>
            <span>Status: <strong id="modal-msg-status" class="badge"></strong></span>
          </div>

          <div id="modal-warning-sent"
            style="display: none; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: #f87171; padding: 0.8rem; border-radius: 8px; font-size: 0.85rem; align-items: center; gap: 0.5rem;">
            ⚠️ Ta wiadomość została już wysłana. Edycja zmieni tylko treść lokalnej kopii w bazie danych.
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <label for="edit-textarea" style="font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">
              Treść wiadomości (obsługuje Markdown Slacka):
            </label>
            <textarea id="edit-textarea" placeholder="Wpisz treść wiadomości..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeEditModal()">Anuluj</button>
          <button id="btn-modal-save" class="btn" onclick="saveEditedMessage()">
            💾 Zapisz zmiany
          </button>
        </div>
      </div>
    </div>

    <!-- Modal podglądu JSON -->
    <div id="payload-modal" class="modal">
      <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
          <h3 style="font-family: 'Syne', sans-serif; display: flex; align-items: center; gap: 0.5rem; color: white;">
            🔍 Surowe zapytanie JSON <span id="modal-payload-id" style="color: var(--primary);"></span>
          </h3>
          <button class="modal-close" onclick="closePayloadModal()">&times;</button>
        </div>
        <div class="modal-body">
          <pre id="payload-content"
            style="background: #1e293b; padding: 1rem; border-radius: 8px; overflow-x: auto; color: #e2e8f0; font-family: 'DM Mono', monospace; font-size: 0.85rem; max-height: 60vh; border: 1px solid rgba(255,255,255,0.1);"></pre>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closePayloadModal()">Zamknij</button>
          <button class="btn" onclick="copyPayload()">
            📋 Kopiuj JSON
          </button>
        </div>
      </div>
    </div>

    <div id="toast-container"></div>

    <script>
      function toggleExpand(id) {
        const content = document.getElementById(`content-${id}`);
        const toggle = document.getElementById(`toggle-${id}`);
        if (content.classList.contains('expanded')) {
          content.classList.remove('expanded');
          toggle.innerText = 'Rozwiń';
        } else {
          content.classList.add('expanded');
          toggle.innerText = 'Zwiń';
        }
      }

      // Modal edycji wiadomości
      let currentEditId = null;

      function openEditModal(id) {
        currentEditId = id;
        const row = document.getElementById(`row-${id}`);
        const contentEl = document.getElementById(`content-${id}`);

        const rawText = contentEl.getAttribute('data-raw') || '';
        const type = row.getAttribute('data-type') || '';
        const status = row.getAttribute('data-status') || '';

        document.getElementById('modal-msg-id').innerText = `#${id}`;
        document.getElementById('modal-msg-type').innerText = type;

        const statusEl = document.getElementById('modal-msg-status');
        statusEl.innerText = status === 'pending' ? 'Oczekuje' : (status === 'sent' ? 'Wysłano' : 'Błąd');
        statusEl.className = `badge badge-${status}`;

        const warningSent = document.getElementById('modal-warning-sent');
        if (status === 'sent') {
          warningSent.style.display = 'flex';
          warningSent.style.marginBottom = '0.5rem';
        } else {
          warningSent.style.display = 'none';
          warningSent.style.marginBottom = '0';
        }

        const textarea = document.getElementById('edit-textarea');
        textarea.value = rawText;

        // Pokazanie modala z animacją
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'flex';
        setTimeout(() => {
          modal.classList.add('show');
          textarea.focus();
        }, 10);

        // Resetowanie timera autoodświeżania, aby nie przerwać edycji
        if (!isAutoRefreshPaused) {
          refreshTimeLeft = 60;
        }
      }

      function closeEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }

      async function saveEditedMessage() {
        if (!currentEditId) return;
        const id = currentEditId;
        const textarea = document.getElementById('edit-textarea');
        const newValue = textarea.value.trim();

        if (newValue === '') {
          showToast('Treść wiadomości nie może być pusta!', 'warning');
          return;
        }

        const btn = document.getElementById('btn-modal-save');
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Zapisywanie...`;

        try {
          const formData = new FormData();
          formData.append('ai_response', newValue);

          const res = await fetch(`index.php?action=update&id=${id}`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();

          if (data.ok) {
            showToast('Wiadomość została zaktualizowana!', 'success');

            // Aktualizacja DOM
            const contentEl = document.getElementById(`content-${id}`);
            contentEl.setAttribute('data-raw', newValue);

            // Bezpieczne wstrzyknięcie tekstu w DOM (zabezpieczenie XSS)
            const escapedText = newValue
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
            contentEl.innerHTML = escapedText + '<div class="response-fade"></div>';

            closeEditModal();
          } else {
            showToast(`Błąd: ${data.error}`, 'error');
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      // Modal podglądu JSON
      function showPayload(id) {
        const row = document.getElementById(`row-${id}`);
        const rawPayload = row.getAttribute('data-payload') || '';
        const modal = document.getElementById('payload-modal');
        const contentEl = document.getElementById('payload-content');
        const idEl = document.getElementById('modal-payload-id');

        idEl.innerText = `#${id}`;

        try {
          // Próba sformatowania JSON
          const jsonObj = JSON.parse(rawPayload);
          contentEl.innerText = JSON.stringify(jsonObj, null, 2);
        } catch (e) {
          // Jeśli to nie JSON, pokaż jako zwykły tekst
          contentEl.innerText = rawPayload;
        }

        modal.style.display = 'flex';
        setTimeout(() => {
          modal.classList.add('show');
        }, 10);
      }

      function closePayloadModal() {
        const modal = document.getElementById('payload-modal');
        modal.classList.remove('show');
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }

      function copyPayload() {
        const content = document.getElementById('payload-content').innerText;
        navigator.clipboard.writeText(content).then(() => {
          showToast('JSON skopiowany do schowka!', 'success');
        }).catch(err => {
          showToast('Nie udało się skopiować JSON.', 'error');
        });
      }

      // Zamknięcie modala po kliknięciu poza obszarem zawartości
      window.addEventListener('click', (e) => {
        const editModal = document.getElementById('edit-modal');
        const payloadModal = document.getElementById('payload-modal');
        if (e.target === editModal) {
          closeEditModal();
        }
        if (e.target === payloadModal) {
          closePayloadModal();
        }
      });

      function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 300);
        }, 4000);
      }

      function formatDateTime(date) {
        return date.getFullYear() + '-' +
          String(date.getMonth() + 1).padStart(2, '0') + '-' +
          String(date.getDate()).padStart(2, '0') + ' ' +
          String(date.getHours()).padStart(2, '0') + ':' +
          String(date.getMinutes()).padStart(2, '0') + ':' +
          String(date.getSeconds()).padStart(2, '0');
      }

      async function sendSlack(id) {
        const btn = document.getElementById(`btn-slack-${id}`);
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span>`;
        try {
          const res = await fetch(`index.php?action=send_slack&id=${id}`);
          const data = await res.json();
          if (data.ok) {
            showToast('Wiadomość została wysłana na Slacka!', 'success');

            // Aktualizacja UI
            const badge = document.getElementById(`badge-status-slack-${id}`);
            if (badge) {
              badge.className = 'badge badge-sent';
              badge.innerText = 'Slack: Wysłano';
            }

            const now = new Date();
            const timeString = formatDateTime(now);
            const timeEl = document.getElementById(`sent-at-slack-${id}`);
            if (timeEl) {
              timeEl.innerHTML = `Slack: ${timeString}`;
            }
          } else {
            showToast(`Błąd: ${data.error}`, 'error');
            const badge = document.getElementById(`badge-status-slack-${id}`);
            if (badge) {
              badge.className = 'badge badge-error';
              badge.innerText = 'Slack: Błąd';
            }
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      async function sendTrello(id) {
        const btn = document.getElementById(`btn-trello-${id}`);
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span>`;
        try {
          const res = await fetch(`index.php?action=send_trello&id=${id}`);
          const data = await res.json();
          if (data.ok) {
            showToast('Zadanie zostało wysłane do Trello!', 'success');

            // Aktualizacja UI
            const badge = document.getElementById(`badge-status-trello-${id}`);
            if (badge) {
              badge.className = 'badge badge-sent';
              badge.innerText = 'Trello: Wysłano';
            }

            const now = new Date();
            const timeString = formatDateTime(now);
            const timeEl = document.getElementById(`sent-at-trello-${id}`);
            if (timeEl) {
              timeEl.innerHTML = `Trello: ${timeString}`;
            }
          } else {
            showToast(`Błąd: ${data.error}`, 'error');
            const badge = document.getElementById(`badge-status-trello-${id}`);
            if (badge) {
              badge.className = 'badge badge-error';
              badge.innerText = 'Trello: Błąd';
            }
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      async function sendAll(id) {
        const btn = document.getElementById(`btn-all-${id}`);
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span>`;
        try {
          const res = await fetch(`index.php?action=send_all&id=${id}`);
          const data = await res.json();
          if (data.ok) {
            showToast('Wysłano do Slacka i Trello!', 'success');

            // Aktualizacja UI
            const badgeSlack = document.getElementById(`badge-status-slack-${id}`);
            if (badgeSlack) {
              badgeSlack.className = 'badge badge-sent';
              badgeSlack.innerText = 'Slack: Wysłano';
            }

            const badgeTrello = document.getElementById(`badge-status-trello-${id}`);
            if (badgeTrello) {
              badgeTrello.className = 'badge badge-sent';
              badgeTrello.innerText = 'Trello: Wysłano';
            }

            const now = new Date();
            const timeString = formatDateTime(now);
            const timeSlackEl = document.getElementById(`sent-at-slack-${id}`);
            if (timeSlackEl) {
              timeSlackEl.innerHTML = `Slack: ${timeString}`;
            }
            const timeTrelloEl = document.getElementById(`sent-at-trello-${id}`);
            if (timeTrelloEl) {
              timeTrelloEl.innerHTML = `Trello: ${timeString}`;
            }
          } else {
            showToast(`Błąd: ${data.error}`, 'error');
            // W razie częściowego błędu odświeżamy stronę, by pokazać dokładne statusy z bazy
            setTimeout(() => {
              location.reload();
            }, 2000);
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      async function scheduleMessage(id) {
        const input = document.getElementById(`schedule-time-${id}`);
        const time = input.value;
        if (!time) {
          showToast('Najpierw wybierz datę i godzinę!', 'warning');
          return;
        }
        const btn = document.getElementById(`btn-sched-${id}`);
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `...`;
        try {
          const formData = new FormData();
          formData.append('scheduled_at', time);
          const res = await fetch(`index.php?action=schedule&id=${id}`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.ok) {
            showToast(`Zaplanowano wysyłkę na: ${data.scheduled_at}`, 'success');
            const badgeSlack = document.getElementById(`badge-status-slack-${id}`);
            if (badgeSlack) {
              badgeSlack.className = 'badge badge-pending';
              badgeSlack.innerText = 'Slack: Oczekuje';
            }
            document.getElementById(`scheduled-at-${id}`).innerText = data.scheduled_at;
          } else {
            showToast(`Błąd: ${data.error}`, 'error');
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      async function deleteMessage(id) {
        if (!confirm('Czy na pewno chcesz usunąć tę wiadomość z bazy?')) return;
        const row = document.getElementById(`row-${id}`);
        row.style.opacity = '0.5';
        try {
          const res = await fetch(`index.php?action=delete&id=${id}`);
          const data = await res.json();
          if (data.ok) {
            showToast('Usunięto wiadomość z bazy.', 'success');
            row.style.transform = 'scale(0.95)';
            row.style.opacity = '0';
            setTimeout(() => {
              row.remove();
              location.reload(); // Prosta aktualizacja widoku i statystyk
            }, 300);
          } else {
            row.style.opacity = '1';
            showToast('Błąd usuwania.', 'error');
          }
        } catch (err) {
          row.style.opacity = '1';
          showToast('Błąd połączenia.', 'error');
        }
      }

      async function triggerCron() {
        const btn = document.getElementById('btn-cron');
        const oldHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `⏳ Uruchamianie...`;
        try {
          const res = await fetch('index.php?action=cron');
          const data = await res.json();
          if (data.ok) {
            showToast(`Cron przetworzył ${data.processed} wiadomości. Wysłano: ${data.sent}`, 'success');
            setTimeout(() => location.reload(), 1500);
          } else {
            showToast('Wystąpił błąd podczas pracy Crona.', 'error');
          }
        } catch (err) {
          showToast('Błąd połączenia.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = oldHtml;
        }
      }

      function copyCode(btn) {
        const code = btn.nextElementSibling.innerText;
        navigator.clipboard.writeText(code).then(() => {
          const oldText = btn.innerText;
          btn.innerText = 'Skopiowano!';
          setTimeout(() => btn.innerText = oldText, 2000);
        }).catch(err => {
          showToast('Nie udało się skopiować kodu.', 'error');
        });
      }

      // Auto-refresh logic
      let refreshTimeLeft = 60; // 60 seconds (1 minute)
      let autoRefreshInterval = null;
      let isAutoRefreshPaused = localStorage.getItem('autoRefreshPaused') === 'true';

      function startAutoRefresh() {
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);

        const dot = document.getElementById('auto-refresh-dot');
        const timerEl = document.getElementById('auto-refresh-timer');
        const btnToggle = document.getElementById('btn-auto-refresh-toggle');

        if (!dot || !timerEl || !btnToggle) return;

        if (isAutoRefreshPaused) {
          dot.className = 'refresh-dot paused';
          timerEl.innerText = 'wstrzymane';
          btnToggle.innerHTML = '▶️ Wznów';
          return;
        }

        dot.className = 'refresh-dot active';
        timerEl.innerText = `${refreshTimeLeft}s`;
        btnToggle.innerHTML = '⏸️ Pauza';

        autoRefreshInterval = setInterval(() => {
          refreshTimeLeft--;
          if (refreshTimeLeft <= 0) {
            clearInterval(autoRefreshInterval);
            showToast('Odświeżanie strony w celu pobrania najnowszych danych...', 'success');
            setTimeout(() => {
              location.reload();
            }, 500);
          } else {
            timerEl.innerText = `${refreshTimeLeft}s`;
          }
        }, 1000);
      }

      function toggleAutoRefresh() {
        isAutoRefreshPaused = !isAutoRefreshPaused;
        localStorage.setItem('autoRefreshPaused', isAutoRefreshPaused ? 'true' : 'false');
        if (!isAutoRefreshPaused) {
          refreshTimeLeft = 60;
        }
        startAutoRefresh();
        showToast(isAutoRefreshPaused ? 'Autoodświeżanie zostało wstrzymane.' : 'Autoodświeżanie zostało wznowione.', isAutoRefreshPaused ? 'warning' : 'success');
      }

      // Automatically reset timer when user is interacting with inputs, so they don't lose typed data
      function setupInputActivityListeners() {
        const resetTimer = () => {
          if (!isAutoRefreshPaused && refreshTimeLeft < 55) {
            refreshTimeLeft = 60;
            const timerEl = document.getElementById('auto-refresh-timer');
            if (timerEl) timerEl.innerText = '60s';
          }
        };

        document.querySelectorAll('.input-date').forEach(input => {
          input.addEventListener('focus', resetTimer);
          input.addEventListener('input', resetTimer);
        });

        const textarea = document.getElementById('edit-textarea');
        if (textarea) {
          textarea.addEventListener('focus', resetTimer);
          textarea.addEventListener('input', resetTimer);
        }
      }

      // Start the auto refresh on load
      setupInputActivityListeners();
      startAutoRefresh();
    </script>
  </body>

  </html>
  <?php
  exit;
}

// ─── OBSŁUGA ZAPYTAŃ POST (API Webhooki / Zgłoszenia) ─────────────────────────
$jsonInput = file_get_contents('php://input');
$webhookData = json_decode($jsonInput, true) ?? [];

// 1. Sprawdzenie czy to webhook JSON: slack_response
if (isset($webhookData['slack_response'])) {
  logDebug("Obsługa webhooka slack_response (zapis do bazy)...");
  $aiResponse = getAiResponseForSlackResponse($webhookData);
  $parsed = parseAiResponse($aiResponse);

  $db = getDbConnection();
  $stmt = $db->prepare("INSERT INTO messages (type, original_data, raw_payload, ai_response, trello_time, trello_name, trello_desc, status) VALUES (:type, :original_data, :raw_payload, :ai_response, :trello_time, :trello_name, :trello_desc, 'pending')");
  $stmt->execute([
    'type' => 'slack_response',
    'original_data' => json_encode($webhookData, JSON_UNESCAPED_UNICODE),
    'raw_payload' => $jsonInput,
    'ai_response' => $parsed['slack'],
    'trello_time' => $parsed['trello_time'],
    'trello_name' => $parsed['trello_name'],
    'trello_desc' => $parsed['trello_desc']
  ]);
  $insertedId = $db->lastInsertId();

  logDebug("Zapisano slack_response w bazie. ID: " . $insertedId);

  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true,
    'message' => 'Otrzymano odpowiedź z AI i zapisano w bazie danych.',
    'id' => $insertedId,
    'ai_response' => $parsed['slack']
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 2. Sprawdzenie czy to webhook JSON: commits
if (isset($webhookData['commits'])) {
  logDebug("Obsługa webhooka commits (zapis do bazy)...");
  $summary = getAiSummary($webhookData);
  $parsed = parseAiResponse($summary);

  $db = getDbConnection();
  $stmt = $db->prepare("INSERT INTO messages (type, original_data, raw_payload, ai_response, trello_time, trello_name, trello_desc, status) VALUES (:type, :original_data, :raw_payload, :ai_response, :trello_time, :trello_name, :trello_desc, 'pending')");
  $stmt->execute([
    'type' => 'commits',
    'original_data' => json_encode($webhookData, JSON_UNESCAPED_UNICODE),
    'raw_payload' => $jsonInput,
    'ai_response' => $parsed['slack'],
    'trello_time' => $parsed['trello_time'],
    'trello_name' => $parsed['trello_name'],
    'trello_desc' => $parsed['trello_desc']
  ]);
  $insertedId = $db->lastInsertId();

  logDebug("Zapisano commits w bazie. ID: " . $insertedId);

  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true,
    'message' => 'Podsumowanie commits wygenerowane i zapisane w bazie.',
    'id' => $insertedId,
    'ai_response' => $parsed['slack']
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 3. Obsługa zapytania POST z opisem (zastępuje dawny formularz)
$description = trim($webhookData['description'] ?? $_POST['description'] ?? '');
$url = trim($webhookData['url'] ?? $_POST['url'] ?? '');

if ($description !== '') {
  logDebug("Obsługa zapytania POST z opisem (zapis do bazy)...");

  if ($url && !filter_var($url, FILTER_VALIDATE_URL)) {
    header('Content-Type: application/json');
    echo json_encode(['ok' => false, 'error' => 'Podaj prawidłowy adres URL (np. https://przykład.pl).'], JSON_UNESCAPED_UNICODE);
    exit;
  }

  logDebug("Zapytanie POST: generowanie AI odpowiedzi...");
  $aiDescription = getAiResponseForPost($description, $url);
  $parsed = parseAiResponse($aiDescription);

  $db = getDbConnection();
  $stmt = $db->prepare("INSERT INTO messages (type, original_data, raw_payload, ai_response, trello_time, trello_name, trello_desc, status) VALUES (:type, :original_data, :raw_payload, :ai_response, :trello_time, :trello_name, :trello_desc, 'pending')");
  $stmt->execute([
    'type' => 'general_post',
    'original_data' => json_encode(array_merge($webhookData, $_POST), JSON_UNESCAPED_UNICODE),
    'raw_payload' => $jsonInput ?: json_encode($_POST, JSON_UNESCAPED_UNICODE),
    'ai_response' => $parsed['slack'],
    'trello_time' => $parsed['trello_time'],
    'trello_name' => $parsed['trello_name'],
    'trello_desc' => $parsed['trello_desc']
  ]);
  $insertedId = $db->lastInsertId();

  logDebug("Zapisano general_post w bazie. ID: " . $insertedId);

  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true,
    'message' => 'Opis wdrożenia przetworzony i zapisany w bazie.',
    'id' => $insertedId,
    'ai_response' => $parsed['slack']
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// 4. Jeśli nie pasuje do żadnego z powyższych
header('Content-Type: application/json');
echo json_encode(['ok' => false, 'error' => 'Nieprawidłowe zapytanie POST (brak wymaganych danych).'], JSON_UNESCAPED_UNICODE);
exit;
