<?php
declare(strict_types=1);

const CSV_HEADER = 'Data,Profil,Kod Pocztowy,Miasto,Województwo,Sprawy Firmowe,Sprawy Prywatne,Pozostale,Imie i Nazwisko,Telefon,Nazwa Eksperta,Adres,Zgoda';
const CONTACT_HEADER = 'Data,Imie i Nazwisko,Email,Telefon,Wiadomosc';
const CONTACT_CSV_NAME = 'contact_messages.csv';
const ZIP_CACHE_NAME = '.zip_cache';

$ROOT = __DIR__;
$DATA_DIR = $ROOT . DIRECTORY_SEPARATOR . 'data';
$CSV_FILE = $DATA_DIR . DIRECTORY_SEPARATOR . 'registrations.csv';
$ZIP_CSV = $ROOT . DIRECTORY_SEPARATOR . 'cities.csv';
$ZIP_CACHE = $DATA_DIR . DIRECTORY_SEPARATOR . ZIP_CACHE_NAME;
$INDEX_HTML = $ROOT . DIRECTORY_SEPARATOR . 'index.html';

if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0777, true);
}

function log_msg(string $msg): void
{
    error_log($msg);
}

function escapeCSV($val): string
{
    if ($val === null || $val === false)
        return '';
    $str = (string) $val;
    if (strpos($str, ',') !== false || strpos($str, '"') !== false || strpos($str, "\n") !== false) {
        return '"' . str_replace('"', '""', $str) . '"';
    }
    return $str;
}

function sendJSON($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        throw new RuntimeException('Empty body');
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid JSON');
    }
    return $data;
}

function ensureRegistrationsCsv(string $csvFile): void
{
    static $done = false;
    if ($done)
        return;
    $done = true;

    if (!file_exists($csvFile)) {
        file_put_contents($csvFile, CSV_HEADER . "\n", LOCK_EX);
        return;
    }

    $content = file_get_contents($csvFile);
    if ($content === false)
        return;

    $lines = preg_split('/\r?\n/', $content);
    if (!$lines || $lines[0] === '')
        return;

    if (strpos($lines[0], 'Województwo') !== false)
        return;

    log_msg("Migrating registrations.csv to include Województwo column...");

    $migrated = [CSV_HEADER];
    $count = count($lines);
    for ($i = 1; $i < $count; $i++) {
        $line = trim($lines[$i]);
        if ($line === '')
            continue;
        $cols = str_getcsv($line);
        $woj = '';
        if (isset($cols[3]) && strpos($cols[3], 'Warszawa') !== false) {
            $woj = 'mazowieckie';
        }
        array_splice($cols, 4, 0, [$woj]);
        $migrated[] = implode(',', array_map('escapeCSV', $cols));
    }
    file_put_contents($csvFile, implode("\n", $migrated) . "\n", LOCK_EX);
    log_msg("Migration complete.");
}

function getZipDatabase(string $zipCsv, string $cacheFile): array
{
    static $cache = null;
    if ($cache !== null)
        return $cache;

    if (!file_exists($zipCsv)) {
        log_msg("Warning: Zip code CSV file not found at $zipCsv");
        $cache = [];
        return $cache;
    }

    $csvMtime = filemtime($zipCsv);
    if (file_exists($cacheFile) && filemtime($cacheFile) >= $csvMtime) {
        $data = @file_get_contents($cacheFile);
        if ($data !== false) {
            $db = @json_decode($data, true);
            if (is_array($db)) {
                $cache = $db;
                return $cache;
            }
        }
        log_msg("Warning: Zip cache unreadable, regenerating");
    }

    $db = [];
    $fh = fopen($zipCsv, 'r');
    if ($fh === false) {
        log_msg("Error: Cannot open $zipCsv");
        $cache = $db;
        return $cache;
    }

    fgetcsv($fh);
    $seen = [];
    while (($row = fgetcsv($fh)) !== false) {
        if (count($row) < 3)
            continue;
        $voivodeship = trim((string) $row[0]);
        $city = trim((string) $row[1]);
        $zip = trim((string) $row[2]);
        $key = $zip . '|' . $city . '|' . $voivodeship;
        if (!isset($seen[$key])) {
            $seen[$key] = true;
            $db[] = [$zip, $city, $voivodeship];
        }
    }
    fclose($fh);

    log_msg("Loaded " . count($db) . " zip-city mappings.");

    $tempFile = $cacheFile . '.tmp';
    @file_put_contents($tempFile, json_encode($db), LOCK_EX);
    @rename($tempFile, $cacheFile);

    $cache = $db;
    return $cache;
}

function handleSearchZip(string $query, array $zipDatabase): void
{
    if (strlen($query) < 2) {
        sendJSON([]);
        return;
    }

    $queryClean = strtolower(preg_replace('/[^0-9-]/', '', $query));
    $queryCleanNoDash = str_replace('-', '', $queryClean);

    $matches = [];
    foreach ($zipDatabase as $entry) {
        $zip = $entry[0];
        $entryZipClean = str_replace('-', '', $zip);
        if (strpos($entryZipClean, $queryCleanNoDash) === 0 || strpos($zip, $queryClean) === 0) {
            $matches[] = ['zip' => $zip, 'city' => $entry[1], 'voivodeship' => $entry[2]];
            if (count($matches) >= 15)
                break;
        }
    }
    sendJSON($matches);
}

function handleRegister(string $csvFile): void
{
    $data = readJsonBody();

    $now = date('c');
    $row = [
        $now,
        $data['profil'] ?? '',
        $data['kodPocztowy'] ?? '',
        $data['miasto'] ?? '',
        $data['wojewodztwo'] ?? '',
        $data['sprawyFirmowe'] ?? '',
        $data['sprawyPrywatne'] ?? '',
        $data['pozostale'] ?? '',
        $data['imieNazwisko'] ?? '',
        $data['telefon'] ?? '',
        $data['nazwaEksperta'] ?? '',
        $data['adres'] ?? '',
        $data['consent'] ?? '',
    ];

    $line = implode(',', array_map('escapeCSV', $row)) . "\n";
    file_put_contents($csvFile, $line, FILE_APPEND | LOCK_EX);
    log_msg("[$now] New registration: " . ($data['imieNazwisko'] ?? ''));

    sendJSON(['success' => true]);
}

function handleContact(string $dataDir): void
{
    $data = readJsonBody();

    $now = date('c');
    $contactCsv = $dataDir . DIRECTORY_SEPARATOR . CONTACT_CSV_NAME;

    if (!file_exists($contactCsv)) {
        file_put_contents($contactCsv, CONTACT_HEADER . "\n", LOCK_EX);
    }

    $row = [
        $now,
        $data['name'] ?? '',
        $data['email'] ?? '',
        $data['phone'] ?? '',
        $data['message'] ?? '',
    ];

    $line = implode(',', array_map('escapeCSV', $row)) . "\n";
    file_put_contents($contactCsv, $line, FILE_APPEND | LOCK_EX);
    log_msg("[$now] New contact message from: " . ($data['name'] ?? '') . " <" . ($data['email'] ?? '') . ">");

    sendJSON(['success' => true]);
}

function serveMain(string $indexHtml): void
{
    if (!is_file($indexHtml)) {
        http_response_code(500);
        header('Content-Type: text/html; charset=utf-8');
        echo '<h1>index.html not found</h1>';
        return;
    }
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexHtml);
}

// --- Main routing ---

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

if (basename($uri) === 'index.php') {
    $uri = '/';
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($method === 'OPTIONS') {
    http_response_code(204);
    return;
}

ensureRegistrationsCsv($CSV_FILE);

if ($uri === '/api/search-zip') {
    if ($method === 'GET') {
        handleSearchZip(trim((string) ($_GET['q'] ?? '')), getZipDatabase($ZIP_CSV, $ZIP_CACHE));
    } else {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
    return;
}

if ($uri === '/api/register') {
    if ($method === 'POST') {
        try {
            handleRegister($CSV_FILE);
        } catch (Throwable $e) {
            log_msg('Error: ' . $e->getMessage());
            sendJSON(['error' => 'Invalid data'], 400);
        }
    } else {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
    return;
}

if ($uri === '/api/contact') {
    if ($method === 'POST') {
        try {
            handleContact($DATA_DIR);
        } catch (Throwable $e) {
            log_msg('Error in contact endpoint: ' . $e->getMessage());
            sendJSON(['error' => 'Invalid data'], 400);
        }
    } else {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
    return;
}

serveMain($INDEX_HTML);
