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

  // Sprawdzenie i dodanie kolumn trello_time, trello_name, trello_desc, trello_status i trello_sent_at jeśli nie istnieją
  $cols = $db->query("PRAGMA table_info(messages)")->fetchAll();
  $hasTime = false;
  $hasName = false;
  $hasDesc = false;
  $hasTrelloStatus = false;
  $hasTrelloSentAt = false;
  foreach ($cols as $col) {
    if ($col['name'] === 'trello_time')
      $hasTime = true;
    if ($col['name'] === 'trello_name')
      $hasName = true;
    if ($col['name'] === 'trello_desc')
      $hasDesc = true;
    if ($col['name'] === 'trello_status')
      $hasTrelloStatus = true;
    if ($col['name'] === 'trello_sent_at')
      $hasTrelloSentAt = true;
  }
  if (!$hasTime) {
    $db->exec("ALTER TABLE messages ADD COLUMN trello_time INTEGER");
  }
  if (!$hasName) {
    $db->exec("ALTER TABLE messages ADD COLUMN trello_name TEXT");
  }
  if (!$hasDesc) {
    $db->exec("ALTER TABLE messages ADD COLUMN trello_desc TEXT");
  }
  if (!$hasTrelloStatus) {
    $db->exec("ALTER TABLE messages ADD COLUMN trello_status TEXT NOT NULL DEFAULT 'pending'");
  }
  if (!$hasTrelloSentAt) {
    $db->exec("ALTER TABLE messages ADD COLUMN trello_sent_at TEXT");
  }

  return $db;
}

/** Pomocnicza funkcja do parsowania odpowiedzi JSON z AI */
function parseAiResponse(string $aiRaw): array
{
  $jsonStr = trim($aiRaw);
  // Spróbujmy znaleźć blok JSON, w razie gdyby AI dodało markdowny typu ```json ... ```
  if (preg_match('/```json\s*(.*?)\s*```/s', $jsonStr, $matches)) {
    $jsonStr = trim($matches[1]);
  } elseif (preg_match('/\{.*\}/s', $jsonStr, $matches)) {
    $jsonStr = trim($matches[0]);
  }

  $data = json_decode($jsonStr, true);
  if (json_last_error() === JSON_ERROR_NONE && isset($data['slack'])) {
    $slack = $data['slack'];
    $trelloTime = isset($data['trello']['time']) ? (int) $data['trello']['time'] : null;
    $trelloName = $data['trello']['name'] ?? null;
    $trelloDesc = $data['trello']['description'] ?? null;
    return [
      'slack' => $slack,
      'trello_time' => $trelloTime,
      'trello_name' => $trelloName,
      'trello_desc' => $trelloDesc
    ];
  }

  // W razie błędu parsowania, traktujemy całą odpowiedź jako Slack, a Trello zostaje puste
  return [
    'slack' => $aiRaw,
    'trello_time' => null,
    'trello_name' => null,
    'trello_desc' => null
  ];
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

/** Buduje ujednolicony prompt dla AI z zachowaniem spójnego formatu wyjściowego */
function buildAiPrompt(string $systemRole, string $slackPrompt, string $trelloPrompt, string $dataInput): string
{
  return "{$systemRole}\n\n"
    . "Twoim zadaniem jest wygenerowanie odpowiedzi w formacie JSON zawierającej dwa klucze:\n"
    . "1. \"slack\": {$slackPrompt}\n"
    . "2. \"trello\": Obiekt zawierający:\n"
    . "   - \"name\": {$trelloPrompt}\n"
    . "   - \"time\": Szacowana liczba minut, jaką mogło zająć wykonanie tego zadania/wdrożenia (zwróć wyłącznie liczbę całkowitą reprezentującą minuty, np. 30 lub 60, 90 itp - interwał co 30min).\n"
    . "   - \"description\": Szczegółowy opis zadania Trello w języku polskim, opisujący co dokładnie należy zrobić. Nietechnicznym językiem. \n\n"
    . "Odpowiedz WYŁĄCZNIE poprawnym obiektem JSON w formacie:\n"
    . "{\n"
    . "  \"slack\": \"...\",\n"
    . "  \"trello\": {\n"
    . "    \"time\": szacowany_czas_w_minutach,\n"
    . "    \"name\": \"nazwa_zadania\",\n"
    . "    \"description\": \"szczegółowy opis zadania\"\n"
    . "  }\n"
    . "}\n\n"
    . "Nie dodawaj żadnych wstępów, podsumowań ani bloków markdown. Tylko czysty JSON.\n\n"
    . "Dane wejściowe:\n" . $dataInput;
}

/** Generuje podsumowanie commitów przy użyciu AI (OpenRouter) */
function getAiSummary(array $payload): string
{
  if (empty($payload['commits'])) {
    logDebug("getAiSummary: Brak commits w payloadzie.");
    return json_encode([
      'slack' => 'Brak nowych commitów.',
      'trello' => ['time' => 0, 'name' => 'Brak nowych commitów', 'description' => 'Brak nowych commitów w tym wdrożeniu.']
    ], JSON_UNESCAPED_UNICODE);
  }

  $commitsStr = "";
  foreach ($payload['commits'] as $commit) {
    $commitsStr .= "- " . ($commit['message'] ?? 'bez opisu') . "\n";
  }

  $prompt = buildAiPrompt(
    "Jesteś asystentem programisty. Przeanalizuj poniższe commity z wdrożenia (builda).",
    "Krótkie podsumowanie ostatniego buildu na podstawie commitów. Napisz co zostało zmienione i jaki jest cel zmian. Odpowiedz zwięźle, w punktach, używając emoji. Formatuj tekst przy użyciu markdown obsługiwanego przez Slack (np. pogrubienia *tekst*, kod `tekst` itp.).",
    "Treść zadania (nazwa zadania), które Twoim zdaniem powinno zostać utworzone, aby dany commit/grupa commitów była zgodna z jego treścią. Powinna być profesjonalna, zadanie ma być dobrze opisane i zawierać wszystkie informacje potrzebne do jego wykonania. Nietechnicznym językiem. 200-500 znaków",
    $commitsStr
  );

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
    return json_encode([
      'slack' => 'Nie udało się wygenerować podsumowania.',
      'trello' => ['time' => 0, 'name' => 'Błąd generowania', 'description' => 'Nie udało się połączyć z API AI.']
    ], JSON_UNESCAPED_UNICODE);
  }

  logDebug("getAiSummary: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $summary = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($summary)) ? trim($summary) : json_encode([
    'slack' => 'Nie udało się wygenerować podsumowania.',
    'trello' => ['time' => 0, 'name' => 'Pusta odpowiedź AI', 'description' => 'AI nie zwróciło żadnej treści.']
  ], JSON_UNESCAPED_UNICODE);
}

/** Generuje poprawiony opis zgłoszenia przy użyciu AI (OpenRouter) */
function getAiResponseForPost(string $description, string $url = ''): string
{
  if (empty($description)) {
    logDebug("getAiResponseForPost: opis jest pusty.");
    return '';
  }

  $dataInput = ($url ? "Adres URL: " . $url . "\n" : "") . "Opis zgłoszenia:\n" . $description;
  $prompt = buildAiPrompt(
    "Jesteś pomocnym asystentem. Otrzymałeś opis wdrożenia lub zgłoszenie z formularza. Przeanalizuj poniższe informacje.",
    "Poprawiony opis wdrożenia tak, aby był profesjonalny, czytelny, zwięzły, podzielony na punkty i zawierał odpowiednie emoji. Formatuj tekst przy użyciu markdown obsługiwanego przez Slack (np. pogrubienia *tekst*, kod `tekst` itp.).",
    "Treść zadania (nazwa zadania), które powinno zostać utworzone na podstawie tego opisu. Nietechnicznym językiem.",
    $dataInput
  );

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
    return json_encode([
      'slack' => $description,
      'trello' => ['time' => 30, 'name' => 'Wykonanie: ' . substr($description, 0, 50), 'description' => $description]
    ], JSON_UNESCAPED_UNICODE);
  }

  logDebug("getAiResponseForPost: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $aiContent = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($aiContent)) ? trim($aiContent) : json_encode([
    'slack' => $description,
    'trello' => ['time' => 30, 'name' => 'Wykonanie: ' . substr($description, 0, 50), 'description' => $description]
  ], JSON_UNESCAPED_UNICODE);
}

/** Generuje podsumowanie na podstawie odpowiedzi ze Slacka przy użyciu AI (OpenRouter) */
function getAiResponseForSlackResponse(array $payload): string
{
  $jsonStr = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

  $prompt = buildAiPrompt(
    "Jesteś pomocnym asystentem. Otrzymałeś dane w formacie JSON opisujące wdrożenie lub odpowiedź ze Slacka. Przeanalizuj te dane.",
    "Profesjonalne, czytelne i estetyczne podsumowanie w języku polskim. Powinno być zwięzłe, podzielone na punkty i zawierać emoji. Formatuj tekst przy użyciu markdown obsługiwanego przez Slack (np. pogrubienia *tekst*, kod `tekst` itp.).",
    "Treść zadania (nazwa zadania), które powinno zostać utworzone na podstawie tych danych.",
    $jsonStr
  );

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
    return json_encode([
      'slack' => "Błąd podczas generowania podsumowania przez AI: " . curl_strerror($errno),
      'trello' => ['time' => 30, 'name' => 'Wdrożenie', 'description' => 'Dane wdrożenia: ' . $jsonStr]
    ], JSON_UNESCAPED_UNICODE);
  }

  logDebug("getAiResponseForSlackResponse: Odpowiedź OpenRouter: " . $response);
  $result = json_decode($response, true);
  $aiContent = $result['choices'][0]['message']['content'] ?? '';

  return !empty(trim($aiContent)) ? trim($aiContent) : json_encode([
    'slack' => 'Nie udało się wygenerować podsumowania AI.',
    'trello' => ['time' => 30, 'name' => 'Wdrożenie', 'description' => 'Dane wdrożenia: ' . $jsonStr]
  ], JSON_UNESCAPED_UNICODE);
}



/** Formatuje minuty do czytelnego formatu Trello (np. 3h 45min, 45min) */
function formatMinutesToTrelloTime(int $minutes): string
{
  $hours = floor($minutes / 60);
  $mins = $minutes % 60;
  if ($hours > 0) {
    if ($mins > 0) {
      return "{$hours}h {$mins}min";
    }
    return "{$hours}h";
  }
  return "{$mins}min";
}

/** Wysyła zadanie z bazy do Trello */
function sendTrelloTaskFromDb(PDO $db, int $id): array
{
  $stmt = $db->prepare("SELECT * FROM messages WHERE id = :id");
  $stmt->execute(['id' => $id]);
  $msg = $stmt->fetch();

  if (!$msg) {
    return ['ok' => false, 'error' => 'Zadanie o podanym ID nie istnieje.'];
  }

  if (empty($msg['trello_name'])) {
    return ['ok' => false, 'error' => 'Brak nazwy zadania Trello do wysłania.'];
  }

  $minutes = isset($msg['trello_time']) ? (int) $msg['trello_time'] : 0;
  $timeFormatted = formatMinutesToTrelloTime($minutes);

  $payload = [
    'id' => '6a23b02d3e367db7037b3eec',
    'name' => $msg['trello_name'],
    'desc' => $msg['trello_desc'] ?? '',
    'idList' => '6a2387672c4937a0f4e1eb07',
    'idMembers' => ['5340fce41a7ea48003d38596'],
    'customFieldItems' => [
      [
        'idCustomField' => '6a23ae2ac35cd6968ea4df16',
        'value' => [
          'text' => $timeFormatted
        ]
      ]
    ]
  ];

  logDebug("sendTrelloTaskFromDb: Wysyłanie payloadu do Trello: " . json_encode($payload, JSON_UNESCAPED_UNICODE));

  $ch = curl_init('https://trello.studio-ai.com.pl/api/public/tasks');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json',
    ],
  ]);

  $response = curl_exec($ch);
  $errno = curl_errno($ch);
  curl_close($ch);

  if ($errno) {
    $errStr = 'Błąd cURL: ' . curl_strerror($errno);
    logDebug("sendTrelloTaskFromDb: Trello cURL Error: " . $errStr);
    $stmtUpdate = $db->prepare("UPDATE messages SET trello_status = 'error', error = :error WHERE id = :id");
    $stmtUpdate->execute(['id' => $id, 'error' => $errStr]);
    return ['ok' => false, 'error' => $errStr];
  }

  logDebug("sendTrelloTaskFromDb: Odpowiedź z Trello: " . $response);
  $result = json_decode($response, true);

  if (isset($result['error']) || isset($result['errors'])) {
    $errStr = $result['error'] ?? $result['errors'] ?? 'Błąd API Trello';
    if (is_array($errStr)) {
      $errStr = json_encode($errStr, JSON_UNESCAPED_UNICODE);
    }
    $stmtUpdate = $db->prepare("UPDATE messages SET trello_status = 'error', error = :error WHERE id = :id");
    $stmtUpdate->execute(['id' => $id, 'error' => $errStr]);
    return ['ok' => false, 'error' => $errStr];
  }

  $stmtUpdate = $db->prepare("UPDATE messages SET trello_status = 'sent', trello_sent_at = datetime('now', 'localtime') WHERE id = :id");
  $stmtUpdate->execute(['id' => $id]);
  return ['ok' => true, 'response' => $result];
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
