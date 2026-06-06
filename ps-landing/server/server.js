const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = path.join(__dirname, '..');
const CSV_FILE = path.join(ROOT, 'data', 'registrations.csv');

// Ensure data directory exists
const dataDir = path.join(ROOT, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// CSV header (includes Województwo after Miasto)
const CSV_HEADER = 'Data,Profil,Kod Pocztowy,Miasto,Województwo,Sprawy Firmowe,Sprawy Prywatne,Pozostale,Imie i Nazwisko,Telefon,Nazwa Eksperta,Adres,Zgoda\n';

// Migration and Initialization of registrations.csv
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADER, 'utf-8');
} else {
    try {
        const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const lines = fileContent.split(/\r?\n/);
        if (lines[0] && !lines[0].includes('Województwo')) {
            console.log('Migrating registrations.csv to include Województwo column...');

            const parseRow = (text) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current);
                return result;
            };

            const migratedLines = [CSV_HEADER.trim()];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cols = parseRow(line);
                // Insert Województwo (index 4) after Miasto (index 3)
                let woj = '';
                if (cols[3] && cols[3].includes('Warszawa')) {
                    woj = 'mazowieckie';
                }
                cols.splice(4, 0, woj);
                const row = cols.map(escapeCSV).join(',');
                migratedLines.push(row);
            }
            fs.writeFileSync(CSV_FILE, migratedLines.join('\n') + '\n', 'utf-8');
            console.log('Migration complete.');
        }
    } catch (err) {
        console.error('Error during migrations.csv schema update:', err);
    }
}

// Load zip codes database
let zipDatabase = [];

let csvPath = path.join(ROOT, 'cities.csv');

if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const seen = new Set();
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length < 3) continue;
        const voivodeship = parts[0].trim();
        const city = parts[1].trim();
        const zip = parts[2].trim();
        const key = `${zip}|${city}|${voivodeship}`;
        if (!seen.has(key)) {
            seen.add(key);
            zipDatabase.push({ zip, city, voivodeship });
        }
    }
    console.log(`Loaded ${zipDatabase.length} zip-city mappings.`);
} else {
    console.warn('Zip code CSV file not found.');
}


const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

function escapeCSV(val) {
    if (!val) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

const server = http.createServer((req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    // Zip search API endpoint
    if (req.method === 'GET' && req.url.startsWith('/api/search-zip')) {
        const urlParams = new URL(req.url, `http://${req.headers.host}`);
        const q = (urlParams.searchParams.get('q') || '').trim();

        if (q.length < 2) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify([]));
        }

        const matches = [];
        const queryClean = q.replace(/[^0-9-]/g, '').toLowerCase();
        const queryCleanNoDash = queryClean.replace('-', '');

        for (const entry of zipDatabase) {
            const entryZipClean = entry.zip.replace('-', '');
            if (entryZipClean.startsWith(queryCleanNoDash) || entry.zip.startsWith(queryClean)) {
                matches.push(entry);
                if (matches.length >= 15) break;
            }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(matches));
    }

    // API endpoint
    if (req.method === 'POST' && req.url === '/api/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const now = new Date().toISOString();
                const row = [
                    now,
                    data.profil,
                    data.kodPocztowy,
                    data.miasto,
                    data.wojewodztwo || '',
                    data.sprawyFirmowe,
                    data.sprawyPrywatne,
                    data.pozostale,
                    data.imieNazwisko,
                    data.telefon,
                    data.nazwaEksperta,
                    data.adres,
                    data.consent
                ].map(escapeCSV).join(',') + '\n';

                fs.appendFileSync(CSV_FILE, row, 'utf-8');
                console.log(`[${now}] New registration: ${data.imieNazwisko}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('Error:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }

    // Contact form API endpoint
    if (req.method === 'POST' && req.url === '/api/contact') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const now = new Date().toISOString();

                // Ensure messages csv file exists
                const CONTACT_CSV = path.join(dataDir, 'contact_messages.csv');
                const CONTACT_HEADER = 'Data,Imie i Nazwisko,Email,Telefon,Wiadomosc\n';
                if (!fs.existsSync(CONTACT_CSV)) {
                    fs.writeFileSync(CONTACT_CSV, CONTACT_HEADER, 'utf-8');
                }

                const row = [
                    now,
                    data.name,
                    data.email,
                    data.phone || '',
                    data.message
                ].map(escapeCSV).join(',') + '\n';

                fs.appendFileSync(CONTACT_CSV, row, 'utf-8');
                console.log(`[${now}] New contact message from: ${data.name} <${data.email}>`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error('Error in contact endpoint:', err);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid data' }));
            }
        });
        return;
    }

    // Static files
    let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    filePath = path.join(ROOT, filePath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n  🚀 ProstaSpawa server running at http://localhost:${PORT}\n`);
});
