<?php
// ─── KONFIGURACJA ────────────────────────────────────────────────────────────
define('SLACK_BOT_TOKEN', 'xoxb-230543694562-11166378695556-QcAKxTs0uQIeTf3zDCTqmU4g');   // Bot User OAuth Token
define('SLACK_CHANNEL_ID', 'C0B5LTHKH2L');             // ID kanału (nie nazwa!)

define('OPENROUTER_API_KEY', 'sk-or-v1-...'); // UZUPEŁNIJ KLUCZ!
define('OPENROUTER_MODEL', 'google/gemini-2.0-flash-lite-preview-02-05:free');

define('MAX_IMAGE_MB', 5);                             // Maks. rozmiar obrazka (MB)
// ─────────────────────────────────────────────────────────────────────────────

$success = false;
$error   = '';

function esc(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }
function slackEsc(string $v): string { return str_replace(['&', '<', '>'], ['&amp;', '&lt;', '&gt;'], $v); }
$old = fn(string $k) => esc($_POST[$k] ?? '');

/** Podstawowa funkcja do wysyłania payloadu do Slacka */
function sendSlackRaw(string $token, array $payload): array
{
    $ch = curl_init('https://slack.com/api/chat.postMessage');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ],
    ]);

    $response = curl_exec($ch);
    $errno    = curl_errno($ch);
    curl_close($ch);

    if ($errno) return ['ok' => false, 'error' => 'Błąd cURL: ' . curl_strerror($errno)];
    
    $result = json_decode($response, true);
    if (!($result['ok'] ?? false)) {
        $msg = $result['error'] ?? 'nieznany błąd';
        if (!empty($result['response_metadata']['messages'])) {
            $msg .= ' (' . implode(', ', $result['response_metadata']['messages']) . ')';
        }
        return ['ok' => false, 'error' => $msg];
    }
    
    return $result;
}

/** Generuje podsumowanie commitów przy użyciu AI (OpenRouter) */
function getAiSummary(array $payload): string {
    if (empty($payload['commits'])) return 'Brak nowych commitów.';

    $commitsStr = "";
    foreach ($payload['commits'] as $commit) {
        $commitsStr .= "- " . ($commit['message'] ?? 'bez opisu') . " (autor: " . ($commit['author'] ?? 'anonim') . ")\n";
    }

    $prompt = "Jesteś asystentem programisty. Podsumuj krótko ostatni build na podstawie poniższych commitów. Napisz co zostało zmienione i jaki jest cel tych zmian. Odpowiedz zwięźle, w punktach, używając emoji.\n\nRepozytorium: " . ($payload['repository'] ?? 'Nieznane') . "\nGałąź: " . ($payload['branch'] ?? 'main') . "\nAutor: " . ($payload['pusher'] ?? 'unknown') . "\n\nCommity:\n" . $commitsStr;

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    $data = [
        'model' => OPENROUTER_MODEL,
        'messages' => [
            ['role' => 'user', 'content' => $prompt]
        ]
    ];

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . OPENROUTER_API_KEY,
        ],
    ]);

    $response = curl_exec($ch);
    $result = json_decode($response, true);
    curl_close($ch);

    return $result['choices'][0]['message']['content'] ?? 'Nie udało się wygenerować podsumowania AI.';
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
            'type'   => 'section',
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
        'channel'    => $channel,
        'text'       => $url ? "Nowe zgłoszenie: {$urlEsc}" : "Nowe zgłoszenie",
        'blocks'     => $blocks,
        'username'   => 'FormularzoBot',
        'icon_emoji' => ':clipboard:',
    ];

    return sendSlackRaw($token, $payload);
}

/** Wysyła plik (obrazek) na Slack i zwraca jego ID (bez publikowania na kanale) */
function uploadSlackImage(string $token, array $file): array
{
    // 1. files.getUploadURLExternal
    $ch = curl_init('https://slack.com/api/files.getUploadURLExternal');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'filename' => $file['name'],
            'length'   => $file['size'],
        ]),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/x-www-form-urlencoded',
            'Authorization: Bearer ' . $token,
        ],
    ]);
    $res1 = json_decode(curl_exec($ch), true);
    if (curl_errno($ch) || !($res1['ok'] ?? false)) {
        $err = $res1['error'] ?? curl_error($ch);
        curl_close($ch);
        return ['ok' => false, 'error' => 'getUploadURLExternal: ' . $err];
    }
    curl_close($ch);

    $uploadUrl = $res1['upload_url'];
    $fileId    = $res1['file_id'];

    // 2. Upload pliku do otrzymanego URL
    $fileData = file_get_contents($file['tmp_name']);
    $ch = curl_init($uploadUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $fileData,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: ' . $file['type'],
        ],
    ]);
    $res2 = curl_exec($ch);
    if (curl_errno($ch)) {
        $err = curl_error($ch);
        curl_close($ch);
        return ['ok' => false, 'error' => 'Upload to URL: ' . $err];
    }
    curl_close($ch);

    // 3. files.completeUploadExternal
    $ch = curl_init('https://slack.com/api/files.completeUploadExternal');
    $payload = json_encode([
        'files' => [['id' => $fileId, 'title' => $file['name']]],
    ]);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json; charset=utf-8',
            'Authorization: Bearer ' . $token,
        ],
    ]);
    $res3 = json_decode(curl_exec($ch), true);
    if (curl_errno($ch) || !($res3['ok'] ?? false)) {
        $err = $res3['error'] ?? curl_error($ch);
        curl_close($ch);
        return ['ok' => false, 'error' => 'completeUploadExternal: ' . $err];
    }
    curl_close($ch);

    return ['ok' => true, 'file_id' => $fileId];
}

// ─── OBSŁUGA ŻĄDAŃ ───────────────────────────────────────────────────────────

// 1. Sprawdzenie czy to webhook JSON (np. z GitHub Actions)
$jsonInput = file_get_contents('php://input');
$webhookData = json_decode($jsonInput, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($webhookData['commits'])) {
    $summary = getAiSummary($webhookData);
    
    $blocks = [
        [
            'type' => 'header',
            'text' => ['type' => 'plain_text', 'text' => '🚀 Udane wdrożenie: ' . ($webhookData['repository'] ?? 'Projekt'), 'emoji' => true],
        ],
        [
            'type'   => 'section',
            'fields' => [
                ['type' => 'mrkdwn', 'text' => "*Gałąź:*\n`" . ($webhookData['branch'] ?? 'main') . "`"],
                ['type' => 'mrkdwn', 'text' => "*Pusher:*\n" . ($webhookData['pusher'] ?? 'unknown')],
            ],
        ],
        [
            'type' => 'section',
            'text' => ['type' => 'mrkdwn', 'text' => "*Podsumowanie zmian (AI):*\n" . $summary],
        ],
        ['type' => 'divider'],
    ];

    $payload = [
        'channel'    => SLACK_CHANNEL_ID,
        'text'       => "🚀 Nowy build: " . ($webhookData['repository'] ?? ''),
        'blocks'     => $blocks,
        'username'   => 'BuildBot',
        'icon_emoji' => ':rocket:',
    ];

    $result = sendSlackRaw(SLACK_BOT_TOKEN, $payload);
    
    header('Content-Type: application/json');
    echo json_encode(['ok' => true, 'slack_response' => $result]);
    exit;
}

// 2. Obsługa tradycyjnego formularza (multipart/form-data)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $description = trim($_POST['description'] ?? '');
    $url         = trim($_POST['url']         ?? '');
    $hasImage    = isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE;

    // ── walidacja ──
    if (!$description) {
        $error = 'Pole „Opis" jest wymagane.';
    } elseif ($url && !filter_var($url, FILTER_VALIDATE_URL)) {
        $error = 'Podaj prawidłowy adres URL (np. https://przykład.pl).';
    } elseif ($hasImage) {
        $img = $_FILES['image'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxBytes     = MAX_IMAGE_MB * 1024 * 1024;

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
            $msgResult = sendSlackMessage(SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, $description, $url, $fileId);
            if (!$msgResult['ok']) {
                $error = 'Błąd wysyłki wiadomości: ' . ($msgResult['error'] ?? 'nieznany');
            } else {
                $success = true;
            }
        }
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
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d0f14;
    --surface:  #141720;
    --border:   #252a38;
    --accent:   #4a9eff;
    --accent2:  #7c3aff;
    --text:     #e8eaf0;
    --muted:    #6b7280;
    --success:  #22d3a5;
    --error:    #f87171;
    --radius:   14px;
  }

  html { font-size: 16px; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    position: relative;
    overflow-x: hidden;
  }

  /* animated mesh background */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 15% 20%, rgba(74,158,255,.13) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 85% 80%, rgba(124,58,255,.12) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* subtle grid */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: .25;
    pointer-events: none;
    z-index: 0;
  }

  .wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 560px;
  }

  /* ── header ── */
  .header {
    margin-bottom: 2.5rem;
    animation: fadeUp .6s ease both;
  }

  .header .pill {
    display: inline-flex;
    align-items: center;
    gap: .45rem;
    background: rgba(74,158,255,.1);
    border: 1px solid rgba(74,158,255,.25);
    color: var(--accent);
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    letter-spacing: .08em;
    text-transform: uppercase;
    padding: .35rem .75rem;
    border-radius: 100px;
    margin-bottom: 1rem;
  }

  .header .pill::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    animation: pulse 2s ease infinite;
  }

  .header h1 {
    font-size: clamp(1.8rem, 5vw, 2.4rem);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -.02em;
  }

  .header h1 span {
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header p {
    margin-top: .6rem;
    color: var(--muted);
    font-size: .9rem;
    line-height: 1.6;
  }

  /* ── card ── */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    animation: fadeUp .6s .1s ease both;
    box-shadow: 0 0 0 1px rgba(255,255,255,.03), 0 20px 60px rgba(0,0,0,.4);
  }

  /* ── form fields ── */
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  .field {
    display: flex;
    flex-direction: column;
    gap: .45rem;
    margin-bottom: 1.1rem;
  }
  .field:last-child { margin-bottom: 0; }

  label {
    font-size: .75rem;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--muted);
  }

  input, textarea {
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: .9rem;
    padding: .75rem 1rem;
    width: 100%;
    transition: border-color .2s, background .2s, box-shadow .2s;
    outline: none;
    resize: vertical;
  }

  input::placeholder, textarea::placeholder { color: var(--muted); opacity: .6; }

  input:focus, textarea:focus {
    border-color: var(--accent);
    background: rgba(74,158,255,.05);
    box-shadow: 0 0 0 3px rgba(74,158,255,.12);
  }

  textarea { min-height: 120px; }

  /* ── file upload ── */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: 10px;
    padding: 1.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: border-color .2s, background .2s;
    position: relative;
  }

  .upload-zone:hover,
  .upload-zone.dragover {
    border-color: var(--accent);
    background: rgba(74,158,255,.05);
  }

  .upload-zone input[type=file] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
  }

  .upload-zone input[type=file]:focus { box-shadow: none; }

  .upload-icon {
    font-size: 1.6rem;
    margin-bottom: .4rem;
    display: block;
    opacity: .5;
    transition: opacity .2s;
  }
  .upload-zone:hover .upload-icon { opacity: .8; }

  .upload-label-text {
    font-size: .82rem;
    color: var(--muted);
    font-family: 'DM Mono', monospace;
  }

  .upload-label-text strong { color: var(--accent); }

  .upload-preview {
    display: none;
    margin-top: .75rem;
    align-items: center;
    gap: .75rem;
    background: rgba(255,255,255,.04);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: .6rem .8rem;
    text-align: left;
  }

  .upload-preview.visible { display: flex; }

  .upload-preview img {
    width: 44px;
    height: 44px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
    border: 1px solid var(--border);
  }

  .upload-preview-info {
    flex: 1;
    min-width: 0;
  }

  .upload-preview-name {
    font-family: 'DM Mono', monospace;
    font-size: .78rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
  }

  .upload-preview-size {
    font-family: 'DM Mono', monospace;
    font-size: .7rem;
    color: var(--muted);
    margin-top: .15rem;
  }

  .upload-clear {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 1rem;
    padding: .2rem;
    border-radius: 4px;
    transition: color .2s;
    flex-shrink: 0;
    margin-top: 0;
    width: auto;
  }
  .upload-clear:hover { color: var(--error); }

  /* ── button ── */
  button[type=submit] {
    margin-top: 1.5rem;
    width: 100%;
    padding: .9rem 1.5rem;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none;
    border-radius: 10px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: .02em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .6rem;
    position: relative;
    overflow: hidden;
    transition: opacity .2s, transform .15s;
  }

  button[type=submit]:hover  { opacity: .9; }
  button[type=submit]:active { transform: scale(.98); }

  /* shimmer on button */
  button[type=submit]::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.15) 50%, transparent 60%);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  button[type=submit]:hover::after { transform: translateX(100%); }

  /* ── alert boxes ── */
  .alert {
    border-radius: 10px;
    padding: 1rem 1.2rem;
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    margin-bottom: 1.4rem;
    font-size: .88rem;
    line-height: 1.5;
    animation: fadeUp .4s ease both;
  }

  .alert-success {
    background: rgba(34,211,165,.1);
    border: 1px solid rgba(34,211,165,.3);
    color: var(--success);
  }

  .alert-error {
    background: rgba(248,113,113,.1);
    border: 1px solid rgba(248,113,113,.3);
    color: var(--error);
  }

  .alert .icon { font-size: 1.1rem; flex-shrink: 0; margin-top: .05rem; }

  /* ── slack badge ── */
  .slack-badge {
    display: flex;
    align-items: center;
    gap: .5rem;
    margin-top: 1.4rem;
    color: var(--muted);
    font-size: .75rem;
    font-family: 'DM Mono', monospace;
    justify-content: center;
  }

  .slack-badge svg { width: 14px; height: 14px; }

  /* ── animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: .4; }
  }

  @media (max-width: 480px) {
    .row { grid-template-columns: 1fr; }
    .card { padding: 1.5rem; }
  }
</style>
</head>
<body>
<div class="wrapper">

  <div class="header">
    <div class="pill">Slack Bot</div>
    <h1>Dodaj<br><span>nowe zgłoszenie</span></h1>
    <p>Wypełnij formularz — zgłoszenie trafi bezpośrednio na nasz kanał Slack.</p>
  </div>

  <div class="card">

    <?php if ($success): ?>
      <div class="alert alert-success">
        <span class="icon">✓</span>
        <div><strong>Zgłoszenie wysłane!</strong><br>Wiadomość dotarła na kanał Slack. Zajmiemy się nią jak najszybciej.</div>
      </div>
    <?php elseif ($error): ?>
      <div class="alert alert-error">
        <span class="icon">⚠</span>
        <div><strong>Błąd:</strong> <?= esc($error) ?></div>
      </div>
    <?php endif; ?>

    <?php if (!$success): ?>
    <form method="POST" enctype="multipart/form-data" novalidate>

      <div class="field">
        <label for="url">Adres URL <span style="color:var(--error)">*</span></label>
        <input type="url" id="url" name="url" placeholder="https://przykład.pl/strona" value="<?= $old('url') ?>" required>
      </div>

      <div class="field">
        <label for="description">Opis <span style="color:var(--error)">*</span></label>
        <textarea id="description" name="description" placeholder="Opisz szczegółowo zgłoszenie…" required><?= $old('description') ?></textarea>
      </div>

      <div class="field">
        <label for="image">Obrazek <span style="color:var(--muted);font-size:.7rem;text-transform:none;letter-spacing:0">(opcjonalnie · JPEG / PNG / GIF / WebP · maks. <?= MAX_IMAGE_MB ?> MB)</span></label>
        <div class="upload-zone" id="uploadZone">
          <input type="file" id="image" name="image" accept="image/jpeg,image/png,image/gif,image/webp">
          <span class="upload-icon">🖼️</span>
          <div class="upload-label-text">
            Przeciągnij i upuść obrazek lub <strong>kliknij, aby wybrać</strong>
          </div>
        </div>
        <div class="upload-preview" id="uploadPreview">
          <img id="previewImg" src="" alt="podgląd">
          <div class="upload-preview-info">
            <div class="upload-preview-name" id="previewName"></div>
            <div class="upload-preview-size" id="previewSize"></div>
          </div>
          <button type="button" class="upload-clear" id="clearImage" title="Usuń obrazek">✕</button>
        </div>
      </div>

      <button type="submit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        Wyślij na Slack
      </button>
    </form>

    <script>
    (function () {
      const input    = document.getElementById('image');
      const zone     = document.getElementById('uploadZone');
      const preview  = document.getElementById('uploadPreview');
      const img      = document.getElementById('previewImg');
      const nameEl   = document.getElementById('previewName');
      const sizeEl   = document.getElementById('previewSize');
      const clearBtn = document.getElementById('clearImage');

      function formatBytes(b) {
        if (b < 1024) return b + ' B';
        if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
        return (b / (1024 * 1024)).toFixed(1) + ' MB';
      }

      function showPreview(file) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        img.src = url;
        nameEl.textContent = file.name;
        sizeEl.textContent = formatBytes(file.size);
        preview.classList.add('visible');
      }

      function clearPreview() {
        input.value = '';
        img.src = '';
        preview.classList.remove('visible');
      }

      input.addEventListener('change', () => showPreview(input.files[0]));
      clearBtn.addEventListener('click', clearPreview);

      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()  => zone.classList.remove('dragover'));
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          showPreview(file);
        }
      });
    })();
    </script>
    <?php endif; ?>

    <div class="slack-badge">
      <!-- Slack logo (simplified) -->
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 15a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 4 0v6a2 2 0 1 1-4 0V9zm9 9a2 2 0 1 1 0-4h6a2 2 0 1 1 0 4h-6zm-6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 6a2 2 0 1 1 4 0v-6a2 2 0 1 1-4 0v6zm-9-9a2 2 0 1 1 0 4H0a2 2 0 1 1 0-4h6zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="currentColor"/>
      </svg>
      Wiadomości trafiają bezpośrednio na Slack
    </div>

  </div>
</div>
</body>
</html>
