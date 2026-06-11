<?php
declare(strict_types=1);

const CSV_HEADER = 'Data,Profil,Specjalizacja,Kod Pocztowy,Miasto,Województwo,Sprawy Firmowe,Sprawy Prywatne,Pozostale,Imie i Nazwisko,Telefon,Nazwa Eksperta,Adres,Zgoda';
const CONTACT_HEADER = 'Data,Imie i Nazwisko,Email,Telefon,Wiadomosc';
const CONTACT_CSV_NAME = 'contact_messages.csv';
const ZIP_CACHE_NAME = '.zip_cache';
const SPEC_FILE_NAME = 'specializations.json';

$ROOT = __DIR__;
$DATA_DIR = $ROOT . DIRECTORY_SEPARATOR . 'data';
$CSV_FILE = $DATA_DIR . DIRECTORY_SEPARATOR . 'registrations.csv';
$ZIP_CSV = $ROOT . DIRECTORY_SEPARATOR . 'cities.csv';
$ZIP_CACHE = $DATA_DIR . DIRECTORY_SEPARATOR . ZIP_CACHE_NAME;
$SPEC_FILE = $DATA_DIR . DIRECTORY_SEPARATOR . SPEC_FILE_NAME;
$INDEX_HTML = $ROOT . DIRECTORY_SEPARATOR . 'index.html';
$ADMIN_KEY = getenv('PS_ADMIN_KEY') ?: 'prostasprawa2026';

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

    $hasWoj = strpos($lines[0], 'Województwo') !== false;
    $hasSpec = strpos($lines[0], 'Specjalizacja') !== false;
    if ($hasWoj && $hasSpec)
        return;

    log_msg("Migrating registrations.csv schema...");

    $migrated = [CSV_HEADER];
    $count = count($lines);
    for ($i = 1; $i < $count; $i++) {
        $line = trim($lines[$i]);
        if ($line === '')
            continue;
        $cols = str_getcsv($line);
        if (!$hasWoj) {
            $woj = '';
            if (isset($cols[3]) && strpos($cols[3], 'Warszawa') !== false) {
                $woj = 'mazowieckie';
            }
            array_splice($cols, 4, 0, [$woj]);
        }
        if (!$hasSpec) {
            array_splice($cols, 2, 0, ['']);
        }
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

function defaultSpecializations(): array
{
    return [
        'PRAWNICY' => [
            'Adwokat',
            'Radca prawny',
            'Doradca podatkowy',
            'Rzecznik patentowy',
            'Doradca restrukturyzacyjny',
            'Mediator',
            'Syndyk',
        ],
        'EKSPERCI' => [
            'Finanse' => [
                'Doradca finansowy',
                'Księgowy',
                'Biegły rewident',
            ],
            'Budownictwo i nieruchomości' => [
                'Rzeczoznawca majątkowy',
                'Geodeta',
                'Inspektor nadzoru budowlanego',
                'Kierownik budowy',
                'Kosztorysant budowlany',
                'Audytor energetyczny',
            ],
            'Motoryzacja i szkody' => [
                'Rzeczoznawca samochodowy',
                'Ekspert ds. odszkodowań',
            ],
            'Biznes i firmy' => [
                'Specjalista BHP',
                'Specjalista PPOŻ',
                'Specjalista RODO',
                'Specjalista Compliance',
                'Specjalista ds. zamówień publicznych',
                'Doradca biznesowy',
            ],
            'Medycyna i opinie' => [
                'Psycholog',
                'Psycholog sądowy',
                'Lekarz biegły',
            ],
        ],
        'BIEGLI I RZECZOZNAWCY' => [
            'Biegły sądowy',
            'Rzeczoznawca majątkowy',
            'Rzeczoznawca samochodowy',
            'Rzeczoznawca budowlany',
            'Biegły księgowy',
            'Biegły z zakresu informatyki',
            'Biegły medyczny',
        ],
    ];
}

function saveSpecializations(string $specFile, array $map): void
{
    $tmp = $specFile . '.tmp';
    file_put_contents($tmp, json_encode($map, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    rename($tmp, $specFile);
}

function loadSpecializations(string $specFile): array
{
    if (file_exists($specFile)) {
        $data = json_decode((string) file_get_contents($specFile), true);
        if (is_array($data))
            return $data;
        log_msg("Warning: $specFile unreadable, regenerating defaults");
    }
    $defaults = defaultSpecializations();
    saveSpecializations($specFile, $defaults);
    return $defaults;
}

function cleanSpecializations(array $data): array
{
    $clean = [];
    foreach ($data as $key => $val) {
        $key = trim((string) $key);
        if ($key === '')
            continue;

        if (!is_array($val))
            continue;

        $isSimpleList = true;
        foreach ($val as $item) {
            if (!is_string($item)) {
                $isSimpleList = false;
                break;
            }
        }

        if ($isSimpleList) {
            $list = [];
            foreach ($val as $item) {
                $item = trim((string) $item);
                if ($item !== '' && !in_array($item, $list, true)) {
                    $list[] = $item;
                }
            }
            $clean[$key] = $list;
        } else {
            $nested = [];
            foreach ($val as $subkey => $subval) {
                $subkey = trim((string) $subkey);
                if ($subkey === '' || !is_array($subval))
                    continue;
                $sublist = [];
                foreach ($subval as $item) {
                    $item = trim((string) $item);
                    if ($item !== '' && !in_array($item, $sublist, true)) {
                        $sublist[] = $item;
                    }
                }
                $nested[$subkey] = $sublist;
            }
            if (!empty($nested)) {
                $clean[$key] = $nested;
            }
        }
    }
    return $clean;
}

function handleSaveSpecializations(string $specFile, string $adminKey): void
{
    $provided = (string) ($_SERVER['HTTP_X_ADMIN_KEY'] ?? '');
    if (!hash_equals($adminKey, $provided)) {
        sendJSON(['error' => 'Unauthorized'], 401);
        return;
    }

    $data = readJsonBody();
    $clean = cleanSpecializations($data);

    saveSpecializations($specFile, $clean);
    log_msg('Specializations updated (' . count($clean) . ' categories)');
    sendJSON(['success' => true]);
}

function handleRegister(string $csvFile): void
{
    $data = readJsonBody();

    $now = date('c');
    $row = [
        $now,
        $data['profil'] ?? '',
        $data['specjalizacja'] ?? '',
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

function parseCsvToArray(string $filePath): array
{
    if (!file_exists($filePath)) {
        return ['headers' => [], 'rows' => []];
    }
    $fh = fopen($filePath, 'r');
    if ($fh === false) {
        return ['headers' => [], 'rows' => []];
    }
    $headers = fgetcsv($fh) ?: [];
    $rows = [];
    while (($row = fgetcsv($fh)) !== false) {
        // Skip completely empty rows
        if (count(array_filter($row, fn($v) => $v !== '')) === 0) continue;
        $rows[] = $row;
    }
    fclose($fh);
    return ['headers' => $headers, 'rows' => $rows];
}

function handleGetData(string $csvFile, string $contactCsv, string $adminKey): void
{
    $provided = (string) ($_SERVER['HTTP_X_ADMIN_KEY'] ?? '');
    if (!hash_equals($adminKey, $provided)) {
        sendJSON(['error' => 'Unauthorized'], 401);
        return;
    }
    $which = $_GET['which'] ?? 'registrations';
    if ($which === 'contacts') {
        sendJSON(parseCsvToArray($contactCsv));
    } else {
        sendJSON(parseCsvToArray($csvFile));
    }
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
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');

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

if ($uri === '/api/specializations') {
    if ($method === 'GET') {
        sendJSON(loadSpecializations($SPEC_FILE));
    } elseif ($method === 'POST') {
        try {
            handleSaveSpecializations($SPEC_FILE, $ADMIN_KEY);
        } catch (Throwable $e) {
            log_msg('Error in specializations endpoint: ' . $e->getMessage());
            sendJSON(['error' => 'Invalid data'], 400);
        }
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

if ($uri === '/api/data') {
    if ($method === 'GET') {
        $CONTACT_CSV = $DATA_DIR . DIRECTORY_SEPARATOR . CONTACT_CSV_NAME;
        handleGetData($CSV_FILE, $CONTACT_CSV, $ADMIN_KEY);
    } else {
        sendJSON(['error' => 'Method not allowed'], 405);
    }
    return;
}

serveMain($INDEX_HTML);
