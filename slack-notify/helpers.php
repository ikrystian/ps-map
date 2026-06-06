<?php
// ─── KONFIGURACJA ────────────────────────────────────────────────────────────
define('SLACK_BOT_TOKEN', 'xoxb-230543694562-11166378695556-QcAKxTs0uQIeTf3zDCTqmU4g');   // Bot User OAuth Token
define('SLACK_CHANNEL_ID', 'C0B5SKF6NUD');             // ID kanału (nie nazwa!)

define('OPENROUTER_API_KEY', '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'); // UZUPEŁNIJ KLUCZ!
define('OPENROUTER_MODEL', 'deepseek/deepseek-v4-flash');
// ─────────────────────────────────────────────────────────────────────────────

function logDebug(string $message): void
{
  $timestamp = date('[Y-m-d H:i:s]');
  file_put_contents(__DIR__ . '/debug.log', "{$timestamp} {$message}\n", FILE_APPEND);
}

function esc(string $v): string
{
  return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}

function slackEsc(string $v): string
{
  return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $v);
}

/** Połączenie z lokalną bazą danych SQLite i inicjalizacja tabeli */
function getDbConnection(): PDO
{
  $dbPath = __DIR__ . '/database.sqlite';
  $db = new PDO("sqlite:{$dbPath}");
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

  // Inicjalizacja tabeli wiadomości
  $db->exec("CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    original_data TEXT,
    raw_payload TEXT,
    ai_response TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    scheduled_at TEXT,
    sent_at TEXT,
    error TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )");

  return $db;
}

/** Podstawowa funkcja do wysyłania payloadu do Slacka */
function sendSlackRaw(string $token, array $payload): array
{
  logDebug("sendSlackRaw: Wysyłanie raw payloadu do Slacka: " . json_encode($payload, JSON_UNESCAPED_UNICODE));
  $ch = curl_init('https://slack.com/api/chat.postMessage');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . $token,
    ],
  ]);

  $response = curl_exec($ch);
  $errno = curl_errno($ch);
  curl_close($ch);

  if ($errno) {
    $errStr = 'Błąd cURL: ' . curl_strerror($errno);
    logDebug("sendSlackRaw: Slack cURL Error: " . $errStr);
    return ['ok' => false, 'error' => $errStr];
  }

  logDebug("sendSlackRaw: Odpowiedź ze Slacka: " . $response);
  $result = json_decode($response, true);
  if (!($result['ok'] ?? false)) {
    $msg = $result['error'] ?? 'nieznany błąd';
    if (!empty($result['response_metadata']['messages'])) {
      $msg .= ' (' . implode(', ', $result['response_metadata']['messages']) . ')';
    }
    logDebug("sendSlackRaw: Błąd wysyłania: " . $msg);
    return ['ok' => false, 'error' => $msg];
  }

  logDebug("sendSlackRaw: Wysyłanie zakończone sukcesem.");
  return $result;
}

/** Generuje podsumowanie commitów przy użyciu AI (OpenRouter) */
function getAiSummary(array $payload): string
{
  if (empty($payload['commits'])) {
    logDebug("getAiSummary: Brak commits w payloadzie.");
    return 'Brak nowych commitów.';
  }

  $commitsStr = "";
  foreach ($payload['commits'] as $commit) {
    $commitsStr .= "- " . ($commit['message'] ?? 'bez opisu');
  }

  $prompt = "Jesteś asystentem programisty. Podsumuj krótko ostatni build na podstawie poniższych commitów. Napisz co zostało zmienione i jaki jest cel tych zmian. Odpowiedz zwięźle, w punktach, używając emoji. " . "Commity: \n" . $commitsStr;
  logDebug("getAiSummary: prompt AI: " . $prompt);

  $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
  $data = [
    'model' => OPENROUTER_MODEL,
    'messages' => [
      ['role' => 'user', 'content' => $prompt]
    ]
  ];

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . OPENROUTER_API_KEY,
    ],
  ]);

  $response = curl_exec($ch);
  $errno = curl_errno($ch);
  curl_close($ch);

  if ($errno) {
    logDebug("getAiSummary: błąd cURL: " . curl_strerror($errno));
    return 'Nie udało się wygenerować podsumowania.';
  }

  logDebug("getAiSummary: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $summary = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($summary)) ? trim($summary) : 'Nie udało się wygenerować podsumowania.';
}

/** Generuje poprawiony opis zgłoszenia przy użyciu AI (OpenRouter) */
function getAiResponseForPost(string $description, string $url = ''): string
{
  if (empty($description)) {
    logDebug("getAiResponseForPost: opis jest pusty.");
    return '';
  }

  $prompt = "Jesteś pomocnym asystentem. Otrzymałeś zgłoszenie z formularza. Przeanalizuj poniższy opis i popraw go tak, aby był profesjonalny, czytelny, zwięzły, podzielony na punkty i zawierał odpowiednie emoji. Odpowiedz wyłącznie gotowym, poprawionym tekstem w języku polskim, bez żadnych dodatkowych komentarzy wstępnych czy podsumowań typu 'Oto poprawiony tekst:'.\n\n";
  if ($url) {
    $prompt .= "Adres URL powiązany ze zgłoszeniem: " . $url . "\n";
  }
  $prompt .= "Oryginalny opis zgłoszenia:\n" . $description;
  logDebug("getAiResponseForPost: prompt AI: " . $prompt);

  $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
  $data = [
    'model' => OPENROUTER_MODEL,
    'messages' => [
      ['role' => 'user', 'content' => $prompt]
    ]
  ];

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . OPENROUTER_API_KEY,
    ],
  ]);

  $response = curl_exec($ch);
  $errno = curl_errno($ch);
  curl_close($ch);

  if ($errno) {
    logDebug("getAiResponseForPost: błąd cURL: " . curl_strerror($errno));
    return $description; // W razie błędu zwracamy oryginalny opis
  }

  logDebug("getAiResponseForPost: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $aiContent = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($aiContent)) ? trim($aiContent) : $description;
}

/** Generuje podsumowanie na podstawie odpowiedzi ze Slacka przy użyciu AI (OpenRouter) */
function getAiResponseForSlackResponse(array $payload): string
{
  $jsonStr = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

  $prompt = "Jesteś pomocnym asystentem. Otrzymałeś dane w formacie JSON opisujące wdrożenie lub odpowiedź ze Slacka. Przeanalizuj te dane i wygeneruj profesjonalne, czytelne i estetyczne podsumowanie/wiadomość w języku polskim, które wyślemy na Slack. Wiadomość powinna być zwięzła, podzielona na punkty jeśli to konieczne, i zawierać odpowiednie emoji. Formatuj tekst przy użyciu markdown obsługiwanego przez Slack (np. pogrubienia *tekst*, kod `tekst` itp.). Odpowiedz wyłącznie gotowym, poprawionym tekstem wiadomości w języku polskim, bez żadnych dodatkowych komentarzy wstępnych czy podsumowań typu 'Oto podsumowanie:'.\n\nDane JSON:\n" . $jsonStr;
  logDebug("getAiResponseForSlackResponse: prompt AI: " . $prompt);

  $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
  $data = [
    'model' => OPENROUTER_MODEL,
    'messages' => [
      ['role' => 'user', 'content' => $prompt]
    ]
  ];

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
      'Authorization: Bearer ' . OPENROUTER_API_KEY,
    ],
  ]);

  $response = curl_exec($ch);
  $errno = curl_errno($ch);
  curl_close($ch);

  if ($errno) {
    logDebug("getAiResponseForSlackResponse: błąd cURL: " . curl_strerror($errno));
    return "Błąd podczas generowania podsumowania przez AI: " . curl_strerror($errno);
  }

  logDebug("getAiResponseForSlackResponse: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $aiContent = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($aiContent)) ? trim($aiContent) : 'Nie udało się wygenerować podsumowania AI.';
}

/** Wysyła konkretną zapisaną wiadomość z bazy na Slacka */
function sendMessageFromDb(PDO $db, int $id): array
{
  $stmt = $db->prepare("SELECT * FROM messages WHERE id = :id");
  $stmt->execute(['id' => $id]);
  $msg = $stmt->fetch();

  if (!$msg) {
    return ['ok' => false, 'error' => 'Wiadomość o podanym ID nie istnieje.'];
  }

  $aiResponse = $msg['ai_response'];
  $originalData = json_decode($msg['original_data'] ?? '', true) ?? [];
  $channel = $originalData['slack_response']['channel'] ?? $originalData['channel'] ?? SLACK_CHANNEL_ID;

  $payload = [
    'channel' => $channel,
    'text' => 'Aktualizacja projektu',
    'blocks' => [
      [
        'type' => 'section',
        'text' => [
          'type' => 'mrkdwn',
          'text' => $aiResponse
        ]
      ]
    ],
    'username' => 'Prosta Sprawa',
    'icon_emoji' => ':rocket:'
  ];

  $result = sendSlackRaw(SLACK_BOT_TOKEN, $payload);

  if ($result['ok'] ?? false) {
    $stmtUpdate = $db->prepare("UPDATE messages SET status = 'sent', sent_at = datetime('now', 'localtime'), error = NULL WHERE id = :id");
    $stmtUpdate->execute(['id' => $id]);
    return ['ok' => true];
  } else {
    $errorStr = $result['error'] ?? 'Nieznany błąd';
    $stmtUpdate = $db->prepare("UPDATE messages SET status = 'error', error = :error WHERE id = :id");
    $stmtUpdate->execute(['id' => $id, 'error' => $errorStr]);
    return ['ok' => false, 'error' => $errorStr];
  }
}

/** Uruchomienie wysyłania zaplanowanych wiadomości (Cron) */
function runCronJobs(PDO $db): array
{
  // Szukamy oczekujących wiadomości z czasem zaplanowanym <= aktualna chwila
  $stmt = $db->prepare("SELECT id FROM messages WHERE status = 'pending' AND scheduled_at IS NOT NULL AND scheduled_at <= datetime('now', 'localtime')");
  $stmt->execute();
  $messages = $stmt->fetchAll();

  $sentCount = 0;
  $errors = [];

  foreach ($messages as $msg) {
    $res = sendMessageFromDb($db, $msg['id']);
    if ($res['ok']) {
      $sentCount++;
    } else {
      $errors[] = "ID {$msg['id']}: " . $res['error'];
    }
  }

  return [
    'ok' => true,
    'processed' => count($messages),
    'sent' => $sentCount,
    'errors' => $errors
  ];
}
