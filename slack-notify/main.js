
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function formatDateTime(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}
  ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function apiFetch(url, opts = {}) {
    const res = await fetch(url, opts);
    return res.json();
}

function setBtnLoading(btn, html = '<span class="spinner"></span>') {
    const old = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = html;
    return () => { btn.disabled = false; btn.innerHTML = old; };
}

// ── Expand / Collapse treści ─────────────────────────────────────────────────

function toggleExpand(id) {
    const content = document.getElementById(`content-${id}`);
    const toggle = document.getElementById(`toggle-${id}`);
    const expanded = content.classList.toggle('expanded');
    toggle.innerText = expanded ? 'Zwiń' : 'Rozwiń';
}

// ── Wysyłka ──────────────────────────────────────────────────────────────────

function checkAndHideButtons(id) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    const slackBadge = document.getElementById(`badge-status-slack-${id}`);
    const trelloBadge = document.getElementById(`badge-status-trello-${id}`);
    if (!slackBadge || !trelloBadge) return;

    const isSlackSent = slackBadge.classList.contains('badge-sent');
    const isTrelloSent = trelloBadge.classList.contains('badge-sent');

    if (isSlackSent) {
        const slackBtn = document.getElementById(`btn-slack-${id}`);
        if (slackBtn) slackBtn.style.display = 'none';
    }
    if (isTrelloSent) {
        const trelloBtn = document.getElementById(`btn-trello-${id}`);
        if (trelloBtn) trelloBtn.style.display = 'none';
    }

    if (isSlackSent && isTrelloSent) {
        const editBtn = document.getElementById(`btn-edit-${id}`);
        if (editBtn) editBtn.style.display = 'none';

        const schedTime = document.getElementById(`schedule-time-${id}`);
        if (schedTime) schedTime.style.display = 'none';

        const schedBtn = document.getElementById(`btn-sched-${id}`);
        if (schedBtn) schedBtn.style.display = 'none';

        const schedForm = schedTime ? schedTime.closest('.schedule-form') : null;
        if (schedForm) schedForm.style.display = 'none';

        const allBtn = document.getElementById(`btn-all-${id}`);
        if (allBtn) allBtn.style.display = 'none';
    }
}

async function sendSlack(id) {
    const btn = document.getElementById(`btn-slack-${id}`);
    const restore = setBtnLoading(btn);
    try {
        const data = await apiFetch(`index.php?action=send_slack&id=${id}`);
        if (data.ok) {
            showToast('Wiadomość została wysłana na Slacka!', 'success');
            updateSlackUI(id, 'sent', formatDateTime(new Date()));
            checkAndHideButtons(id);
        } else {
            showToast(`Błąd: ${data.error}`, 'error');
            updateBadge(`badge-status-slack-${id}`, 'error', 'Slack: Błąd');
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

async function sendTrello(id) {
    const btn = document.getElementById(`btn-trello-${id}`);
    const restore = setBtnLoading(btn);
    try {
        const data = await apiFetch(`index.php?action=send_trello&id=${id}`);
        if (data.ok) {
            showToast('Zadanie zostało wysłane do Trello!', 'success');
            updateTrelloUI(id, 'sent', formatDateTime(new Date()));
            checkAndHideButtons(id);
        } else {
            showToast(`Błąd: ${data.error}`, 'error');
            updateBadge(`badge-status-trello-${id}`, 'error', 'Trello: Błąd');
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

async function sendAll(id) {
    const btn = document.getElementById(`btn-all-${id}`);
    const restore = setBtnLoading(btn);
    try {
        const data = await apiFetch(`index.php?action=send_all&id=${id}`);
        if (data.ok) {
            showToast('Wysłano do Slacka i Trello!', 'success');
            const now = formatDateTime(new Date());
            updateSlackUI(id, 'sent', now);
            updateTrelloUI(id, 'sent', now);
            checkAndHideButtons(id);
        } else {
            showToast(`Błąd: ${data.error}`, 'error');
            setTimeout(() => location.reload(), 2000);
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

function updateBadge(elementId, status, label) {
    const el = document.getElementById(elementId);
    if (el) { el.className = `badge badge-${status}`; el.innerText = label; }
}

function updateSlackUI(id, status, time) {
    updateBadge(`badge-status-slack-${id}`, status, `Slack: ${status === 'sent' ? 'Wysłano' : 'Błąd'}`);
    const el = document.getElementById(`sent-at-slack-${id}`);
    if (el) el.innerHTML = `Slack: ${time}`;
}

function updateTrelloUI(id, status, time) {
    updateBadge(`badge-status-trello-${id}`, status, `Trello: ${status === 'sent' ? 'Wysłano' : 'Błąd'}`);
    const el = document.getElementById(`sent-at-trello-${id}`);
    if (el) el.innerHTML = `Trello: ${time}`;
}

// ── Planowanie ───────────────────────────────────────────────────────────────

async function scheduleMessage(id) {
    const input = document.getElementById(`schedule-time-${id}`);
    if (!input.value) { showToast('Najpierw wybierz datę i godzinę!', 'warning'); return; }

    const btn = document.getElementById(`btn-sched-${id}`);
    const restore = setBtnLoading(btn, '...');
    const body = new FormData();
    body.append('scheduled_at', input.value);

    try {
        const data = await apiFetch(`index.php?action=schedule&id=${id}`, { method: 'POST', body });
        if (data.ok) {
            showToast(`Zaplanowano wysyłkę na: ${data.scheduled_at}`, 'success');
            updateBadge(`badge-status-slack-${id}`, 'pending', 'Slack: Oczekuje');
            document.getElementById(`scheduled-at-${id}`).innerText = data.scheduled_at;
        } else {
            showToast(`Błąd: ${data.error}`, 'error');
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

// ── Usuwanie ─────────────────────────────────────────────────────────────────

async function deleteMessage(id) {
    if (!confirm('Czy na pewno chcesz usunąć tę wiadomość z bazy?')) return;
    const row = document.getElementById(`row-${id}`);
    row.style.opacity = '0.5';
    try {
        const data = await apiFetch(`index.php?action=delete&id=${id}`);
        if (data.ok) {
            showToast('Usunięto wiadomość z bazy.', 'success');
            row.style.transform = 'scale(0.95)';
            row.style.opacity = '0';
            setTimeout(() => { row.remove(); location.reload(); }, 300);
        } else {
            row.style.opacity = '1';
            showToast('Błąd usuwania.', 'error');
        }
    } catch { row.style.opacity = '1'; showToast('Błąd połączenia.', 'error'); }
}

// ── Cron ─────────────────────────────────────────────────────────────────────

async function triggerCron() {
    const btn = document.getElementById('btn-cron');
    const restore = setBtnLoading(btn, '⏳ Uruchamianie...');
    try {
        const data = await apiFetch('index.php?action=cron');
        if (data.ok) {
            showToast(`Cron przetworzył ${data.processed} wiadomości. Wysłano: ${data.sent}`, 'success');
            setTimeout(() => location.reload(), 1500);
        } else {
            showToast('Wystąpił błąd podczas pracy Crona.', 'error');
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

// ── Modal edycji ─────────────────────────────────────────────────────────────

let currentEditId = null;

function openModal(id) {
    const modal = document.getElementById(id);
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('show');
    setTimeout(() => modal.style.display = 'none', 300);
}

function openEditModal(id) {
    currentEditId = id;
    const row = document.getElementById(`row-${id}`);
    const contentEl = document.getElementById(`content-${id}`);
    const status = row.getAttribute('data-status') || '';
    const statusMap = { pending: 'Oczekuje', sent: 'Wysłano', error: 'Błąd' };

    document.getElementById('modal-msg-id').innerText = `#${id}`;
    document.getElementById('modal-msg-type').innerText = row.getAttribute('data-type') || '';

    const statusEl = document.getElementById('modal-msg-status');
    statusEl.innerText = statusMap[status] || status;
    statusEl.className = `badge badge-${status}`;

    const warning = document.getElementById('modal-warning-sent');
    warning.style.display = status === 'sent' ? 'flex' : 'none';
    warning.style.marginBottom = status === 'sent' ? '0.5rem' : '0';

    const textarea = document.getElementById('edit-textarea');
    textarea.value = contentEl.getAttribute('data-raw') || '';

    // Trello fields
    document.getElementById('edit-trello-name').value = row.getAttribute('data-trello-name') || '';
    document.getElementById('edit-trello-desc').value = row.getAttribute('data-trello-desc') || '';
    const rawTime = parseInt(row.getAttribute('data-trello-time') || '0', 10);
    document.getElementById('edit-trello-time').value = rawTime > 0 ? rawTime : '';

    openModal('edit-modal');
    setTimeout(() => textarea.focus(), 50);

    if (!isAutoRefreshPaused) refreshTimeLeft = 60;
}

function closeEditModal() { closeModal('edit-modal'); }
function closePayloadModal() { closeModal('payload-modal'); }

async function saveEditedMessage() {
    if (!currentEditId) return;
    const id = currentEditId;
    const textarea = document.getElementById('edit-textarea');
    const value = textarea.value.trim();

    if (!value) { showToast('Treść wiadomości nie może być pusta!', 'warning'); return; }

    const trelloName = document.getElementById('edit-trello-name').value.trim();
    const trelloDesc = document.getElementById('edit-trello-desc').value.trim();
    const trelloTimeRaw = document.getElementById('edit-trello-time').value.trim();
    const trelloTime = trelloTimeRaw !== '' ? parseInt(trelloTimeRaw, 10) : '';

    const btn = document.getElementById('btn-modal-save');
    const restore = setBtnLoading(btn, '<span class="spinner"></span> Zapisywanie...');
    const body = new FormData();
    body.append('ai_response', value);
    if (trelloName !== '') body.append('trello_name', trelloName);
    if (trelloDesc !== '') body.append('trello_desc', trelloDesc);
    if (trelloTime !== '') body.append('trello_time', trelloTime);

    try {
        const data = await apiFetch(`index.php?action=update&id=${id}`, { method: 'POST', body });
        if (data.ok) {
            showToast('Wiadomość została zaktualizowana!', 'success');

            // Update Slack content in table
            const contentEl = document.getElementById(`content-${id}`);
            contentEl.setAttribute('data-raw', value);
            const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            contentEl.innerHTML = esc(value) + '<div class="response-fade"></div>';

            // Update row data attributes
            const row = document.getElementById(`row-${id}`);
            if (trelloName !== '') row.setAttribute('data-trello-name', trelloName);
            if (trelloDesc !== '') row.setAttribute('data-trello-desc', trelloDesc);
            if (trelloTime !== '') row.setAttribute('data-trello-time', trelloTime);

            // Update Trello cell in table
            const trelloCell = row.querySelector('.trello-cell');
            if (trelloCell && trelloName) {
                const mins = trelloTime !== '' ? trelloTime : parseInt(row.getAttribute('data-trello-time') || '0', 10);
                const h = Math.floor(mins / 60), m = mins % 60;
                const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
                trelloCell.innerHTML = `<div class="trello-task">
                    <span class="trello-name">${esc(trelloName)}</span>
                    <span class="trello-time">⏱️ ${timeStr}</span>
                    ${trelloDesc ? `<div class="trello-desc-wrapper"><details class="trello-desc-details"><summary class="trello-desc-summary">Opis zadania</summary><div class="trello-desc-content">${esc(trelloDesc)}</div></details></div>` : ''}
                </div>`;
            }

            closeEditModal();
        } else {
            showToast(`Błąd: ${data.error}`, 'error');
        }
    } catch { showToast('Błąd połączenia.', 'error'); }
    finally { restore(); }
}

// ── Modal JSON ───────────────────────────────────────────────────────────────

function showPayload(id) {
    const row = document.getElementById(`row-${id}`);
    const raw = row.getAttribute('data-payload') || '';
    const content = document.getElementById('payload-content');
    document.getElementById('modal-payload-id').innerText = `#${id}`;
    try { content.innerText = JSON.stringify(JSON.parse(raw), null, 2); }
    catch { content.innerText = raw; }
    openModal('payload-modal');
}

function copyPayload() {
    navigator.clipboard.writeText(document.getElementById('payload-content').innerText)
        .then(() => showToast('JSON skopiowany do schowka!', 'success'))
        .catch(() => showToast('Nie udało się skopiować JSON.', 'error'));
}

// Zamknięcie modala po kliknięciu tła
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
    if (e.target === document.getElementById('payload-modal')) closePayloadModal();
});

// ── Auto-refresh ─────────────────────────────────────────────────────────────

let refreshTimeLeft = 60;
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
            clearInterval(autoRefreshInterval); showToast('Odświeżanie strony...', 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            timerEl.innerText = `${refreshTimeLeft}s`;
        }
    }, 1000);
}

function toggleAutoRefresh() {
    isAutoRefreshPaused = !isAutoRefreshPaused;
    localStorage.setItem('autoRefreshPaused', isAutoRefreshPaused);
    if (!isAutoRefreshPaused) refreshTimeLeft = 60;
    startAutoRefresh();
    showToast(
        isAutoRefreshPaused ? 'Autoodświeżanie wstrzymane.' : 'Autoodświeżanie wznowione.',
        isAutoRefreshPaused ? 'warning' : 'success'
    );
}

// Resetowanie timera przy interakcji z polami formularzy
function setupInputActivityListeners() {
    const resetTimer = () => {
        if (!isAutoRefreshPaused && refreshTimeLeft < 55) {
            refreshTimeLeft = 60; const
                el = document.getElementById('auto-refresh-timer'); if (el) el.innerText = '60s';
        }
    };
    document.querySelectorAll('.input-date').forEach(el => {
        el.addEventListener('focus', resetTimer);
        el.addEventListener('input', resetTimer);
    });
    const textarea = document.getElementById('edit-textarea');
    if (textarea) {
        textarea.addEventListener('focus', resetTimer);
        textarea.addEventListener('input', resetTimer);
    }
}

setupInputActivityListeners();
startAutoRefresh();

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('tr[id^="row-"]').forEach(row => {
        const id = row.id.replace('row-', '');
        checkAndHideButtons(id);
    });
});