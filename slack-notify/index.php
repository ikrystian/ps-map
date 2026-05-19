<?php
// ─── KONFIGURACJA ────────────────────────────────────────────────────────────
define('SLACK_BOT_TOKEN', '');   // Bot User OAuth Token
define('SLACK_CHANNEL_ID', 'L');             // ID kanału (nie nazwa!)

define('OPENROUTER_API_KEY', ''); // UZUPEŁNIJ KLUCZ!
define('OPENROUTER_MODEL', 'deepseek/deepseek-v4-flash:free');

define('MAX_IMAGE_MB', 5);                             // Maks. rozmiar obrazka (MB)
// ─────────────────────────────────────────────────────────────────────────────

$success = false;
$error = '';

function logDebug(string $message): void
{
  $timestamp = date('[Y-m-d H:i:s]');
  file_put_contents(__DIR__ . '/debug.log', "{$timestamp} {$message}\n", FILE_APPEND);
}

// Logowanie szczegółów przychodzącego żądania
logDebug("=== OTRZYMANO ŻĄDANIE ===");
logDebug("Metoda: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN'));
logDebug("URI: " . ($_SERVER['REQUEST_URI'] ?? 'UNKNOWN'));
logDebug("IP klienta: " . ($_SERVER['REMOTE_ADDR'] ?? 'UNKNOWN'));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $rawBody = file_get_contents('php://input');
  if (!empty($rawBody)) {
    logDebug("Raw POST Body: " . $rawBody);
  }
  if (!empty($_POST)) {
    logDebug("POST Fields: " . json_encode($_POST, JSON_UNESCAPED_UNICODE));
  }
  if (!empty($_FILES)) {
    logDebug("FILES: " . json_encode($_FILES, JSON_UNESCAPED_UNICODE));
  }
}

function esc(string $v): string
{
  return htmlspecialchars($v, ENT_QUOTES, 'UTF-8');
}
function slackEsc(string $v): string
{
  return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $v);
}
$old = fn(string $k) => esc($_POST[$k] ?? '');

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
    $commitsStr .= "- " . ($commit['message'] ?? 'bez opisu') . " (autor: " . ($commit['author'] ?? 'anonim') . ")\n";
  }

  $prompt = "Jesteś asystentem programisty. Podsumuj krótko ostatni build na podstawie poniższych commitów. Napisz co zostało zmienione i jaki jest cel tych zmian. Odpowiedz zwięźle, w punktach, używając emoji.\n\nRepozytorium: " . ($payload['repository'] ?? 'Nieznane') . "\nGałąź: " . ($payload['branch'] ?? 'main') . "\nAutor: " . ($payload['pusher'] ?? 'unknown') . "\n\nCommity:\n" . $commitsStr;
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

/** Wysyła wiadomość tekstową na Slack (opcjonalnie z obrazkiem) */
function sendSlackMessage(string $token, string $channel, string $description, string $url = '', string $fileId = ''): array
{
  $urlEsc = slackEsc($url);
  $descEsc = slackEsc($description);

  if (mb_strlen($descEsc) > 2900) {
    $descEsc = mb_substr($descEsc, 0, 2897) . '...';
  }

  $blocks = [
    [
      'type' => 'header',
      'text' => ['type' => 'plain_text', 'text' => '📋 Nowa aktualizacja projektu', 'emoji' => true],
    ],
  ];

  if ($url) {
    $blocks[] = [
      'type' => 'section',
      'fields' => [
        ['type' => 'mrkdwn', 'text' => "*Adres URL:*\n<{$urlEsc}|{$urlEsc}>"],
      ],
    ];
  }

  $blocks[] = [
    'type' => 'section',
    'text' => ['type' => 'mrkdwn', 'text' => "*Opis:*\n{$descEsc}"],
  ];

  if ($fileId) {
    $blocks[] = [
      'type' => 'image',
      'slack_file' => ['id' => $fileId],
      'alt_text' => 'Załączony obrazek do zgłoszenia'
    ];
  }

  $blocks[] = ['type' => 'divider'];

  $payload = [
    'channel' => $channel,
    'text' => $url ? "Nowe zgłoszenie: {$urlEsc}" : "Nowe zgłoszenie",
    'blocks' => $blocks,
    'username' => 'FormularzoBot',
    'icon_emoji' => ':clipboard:',
  ];

  return sendSlackRaw($token, $payload);
}

/** Wysyła plik (obrazek) na Slack i zwraca jego ID (bez publikowania na kanale) */
function uploadSlackImage(string $token, array $file): array
{
  logDebug("uploadSlackImage: Rozpoczęcie wgrywania obrazka: " . $file['name']);
  // 1. files.getUploadURLExternal
  $ch = curl_init('https://slack.com/api/files.getUploadURLExternal');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
      'filename' => $file['name'],
      'length' => $file['size'],
    ]),
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/x-www-form-urlencoded',
      'Authorization: Bearer ' . $token,
    ],
  ]);
  $res1 = json_decode(curl_exec($ch), true);
  if (curl_errno($ch) || !($res1['ok'] ?? false)) {
    $err = $res1['error'] ?? curl_error($ch);
    curl_close($ch);
    logDebug("uploadSlackImage: getUploadURLExternal error: " . $err);
    return ['ok' => false, 'error' => 'getUploadURLExternal: ' . $err];
  }
  curl_close($ch);

  $uploadUrl = $res1['upload_url'];
  $fileId = $res1['file_id'];
  logDebug("uploadSlackImage: Otrzymano upload_url i file_id: " . $fileId);

  // 2. Upload pliku do otrzymanego URL
  $fileData = file_get_contents($file['tmp_name']);
  $ch = curl_init($uploadUrl);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $fileData,
    CURLOPT_HTTPHEADER => [
      'Content-Type: ' . $file['type'],
    ],
  ]);
  $res2 = curl_exec($ch);
  if (curl_errno($ch)) {
    $err = curl_error($ch);
    curl_close($ch);
    logDebug("uploadSlackImage: upload pliku error: " . $err);
    return ['ok' => false, 'error' => 'Upload to URL: ' . $err];
  }
  curl_close($ch);
  logDebug("uploadSlackImage: Pomyślnie przesłano plik binarny.");

  // 3. files.completeUploadExternal
  $ch = curl_init('https://slack.com/api/files.completeUploadExternal');
  $payload = json_encode([
    'files' => [['id' => $fileId, 'title' => $file['name']]],
  ]);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
      'Content-Type: application/json; charset=utf-8',
      'Authorization: Bearer ' . $token,
    ],
  ]);
  $res3 = json_decode(curl_exec($ch), true);
  if (curl_errno($ch) || !($res3['ok'] ?? false)) {
    $err = $res3['error'] ?? curl_error($ch);
    curl_close($ch);
    logDebug("uploadSlackImage: completeUploadExternal error: " . $err);
    return ['ok' => false, 'error' => 'completeUploadExternal: ' . $err];
  }
  curl_close($ch);
  logDebug("uploadSlackImage: Zakończono sukcesem. file_id: " . $fileId);

  return ['ok' => true, 'file_id' => $fileId];
}

// ─── OBSŁUGA ŻĄDAŃ ───────────────────────────────────────────────────────────

// 1. Sprawdzenie czy to webhook JSON (np. z GitHub Actions)
$jsonInput = file_get_contents('php://input');
$webhookData = json_decode($jsonInput, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($webhookData['slack_response'])) {
  logDebug("Obsługa webhooka slack_response...");
  $aiResponse = getAiResponseForSlackResponse($webhookData);

  $channel = $webhookData['slack_response']['channel'] ?? SLACK_CHANNEL_ID;
  $payload = [
    'channel' => $channel,
    'text' => $aiResponse,
    'blocks' => [
      [
        'type' => 'section',
        'text' => [
          'type' => 'mrkdwn',
          'text' => $aiResponse
        ]
      ]
    ],
    'username' => 'BuildBot',
    'icon_emoji' => ':rocket:'
  ];

  logDebug("Wysyłanie wyniku slack_response do Slacka...");
  $result = sendSlackRaw(SLACK_BOT_TOKEN, $payload);
  logDebug("Wynik wysyłki slack_response: " . json_encode($result, JSON_UNESCAPED_UNICODE));

  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true,
    'ai_response' => $aiResponse,
    'slack_response' => $result
  ]);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($webhookData['commits'])) {
  logDebug("Obsługa webhooka commits...");
  $summary = getAiSummary($webhookData);

  $blocks = [
    [
      'type' => 'header',
      'text' => ['type' => 'plain_text', 'text' => '🚀 Udane wdrożenie nowej zmiany na produkcje'],
    ],
    [
      'type' => 'section',
      'fields' => [
        ['type' => 'mrkdwn', 'text' => "*Gałąź:*\n`" . ($webhookData['branch'] ?? 'main') . "`"],
      ],
    ],
    [
      'type' => 'section',
      'text' => ['type' => 'mrkdwn', 'text' => "*Podsumowanie zmian:*\n" . $summary],
    ],
    ['type' => 'divider'],
  ];

  $payload = [
    'channel' => SLACK_CHANNEL_ID,
    'text' => "🚀 Nowy build: " . ($webhookData['repository'] ?? ''),
    'blocks' => $blocks,
    'username' => 'BuildBot',
    'icon_emoji' => ':rocket:',
  ];

  logDebug("Wysyłanie wyniku commits do Slacka...");
  $result = sendSlackRaw(SLACK_BOT_TOKEN, $payload);
  logDebug("Wynik wysyłki commits: " . json_encode($result, JSON_UNESCAPED_UNICODE));

  header('Content-Type: application/json');
  echo json_encode(['ok' => true, 'slack_response' => $result]);
  exit;
}

// 2. Obsługa tradycyjnego formularza (multipart/form-data)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  logDebug("Obsługa tradycyjnego formularza (multipart/form-data)...");
  $description = trim($_POST['description'] ?? '');
  $url = trim($_POST['url'] ?? '');
  $hasImage = isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE;

  // ── walidacja ──
  if (!$description) {
    $error = 'Pole „Opis" jest wymagane.';
  } elseif ($url && !filter_var($url, FILTER_VALIDATE_URL)) {
    $error = 'Podaj prawidłowy adres URL (np. https://przykład.pl).';
  } elseif ($hasImage) {
    $img = $_FILES['image'];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxBytes = MAX_IMAGE_MB * 1024 * 1024;

    if ($img['error'] !== UPLOAD_ERR_OK) {
      $error = 'Błąd przesyłania pliku (kod: ' . $img['error'] . ').';
    } elseif (!in_array($img['type'], $allowedTypes, true)) {
      $error = 'Dozwolone formaty obrazka: JPEG, PNG, GIF, WebP.';
    } elseif ($img['size'] > $maxBytes) {
      $error = 'Obrazek jest zbyt duży. Maksymalny rozmiar to ' . MAX_IMAGE_MB . ' MB.';
    }
  }

  if (!$error) {
    $fileId = '';

    // Jeśli jest obrazek, najpierw go wgraj
    if ($hasImage) {
      $imgResult = uploadSlackImage(SLACK_BOT_TOKEN, $_FILES['image']);
      if (!$imgResult['ok']) {
        $error = 'Błąd uploadu obrazka: ' . ($imgResult['error'] ?? 'nieznany');
      } else {
        $fileId = $imgResult['file_id'];
        sleep(1);
      }
    }

    // Wyślij wiadomość
    if (!$error) {
      logDebug("Formularz: generowanie AI odpowiedzi...");
      $aiDescription = getAiResponseForPost($description, $url);
      logDebug("Formularz: wysyłanie na Slacka...");
      $msgResult = sendSlackMessage(SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, $aiDescription, $url, $fileId);
      logDebug("Formularz: Wynik wysyłki: " . json_encode($msgResult, JSON_UNESCAPED_UNICODE));
      if (!$msgResult['ok']) {
        $error = 'Błąd wysyłki wiadomości: ' . ($msgResult['error'] ?? 'nieznany');
      } else {
        $success = true;
      }
    }
  } else {
    logDebug("Formularz: błędy walidacji: " . $error);
  }
}
?>
<!DOCTYPE html>
<html lang="pl">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zgłoszenie — wyślij na Slack</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap"
    rel="stylesheet">
  <style>
    </head><body></body></html>