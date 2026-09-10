/**
 * telegram.js — Laporan digest ke Bot Telegram (Fase 4, client-side).
 * Token + chat ID disimpan di localStorage (diinput user di dashboard,
 * TIDAK di-hardcode) karena Fase 1 murni client-side tanpa backend.
 */

const SETTINGS_KEY = 'infranexia-telegram-settings';
const SENT_KEY = 'infranexia-telegram-sent';

export function loadTelegramSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      botToken: parsed.botToken || '',
      chatId: parsed.chatId || '',
      autoSend: parsed.autoSend !== false,
    };
  } catch {
    return { botToken: '', chatId: '', autoSend: true };
  }
}

export function saveTelegramSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      botToken: settings.botToken || '',
      chatId: settings.chatId || '',
      autoSend: settings.autoSend !== false,
    }));
  } catch {
    // abaikan — non-blocking
  }
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const LAST_SENT_KEY = 'infranexia-telegram-last-sent';

/** MODE TES: guard interval berbasis timestamp (auto-send tiap N menit). */
export function getLastSentAt(scopeKey) {
  try {
    const raw = localStorage.getItem(LAST_SENT_KEY);
    const sent = raw ? JSON.parse(raw) : {};
    return Number(sent[scopeKey]) || 0;
  } catch {
    return 0;
  }
}

export function markSentNow(scopeKey) {
  try {
    const raw = localStorage.getItem(LAST_SENT_KEY);
    const sent = raw ? JSON.parse(raw) : {};
    sent[scopeKey] = Date.now();
    localStorage.setItem(LAST_SENT_KEY, JSON.stringify(sent));
  } catch {
    // abaikan
  }
}

/** Cegah spam: auto-send maksimal 1x per hari per modul+regional. */
export function alreadyAutoSentToday(scopeKey) {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    const sent = raw ? JSON.parse(raw) : {};
    return sent[scopeKey] === todayISO();
  } catch {
    return false;
  }
}

export function markAutoSentToday(scopeKey) {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    const sent = raw ? JSON.parse(raw) : {};
    sent[scopeKey] = todayISO();
    localStorage.setItem(SENT_KEY, JSON.stringify(sent));
  } catch {
    // abaikan
  }
}

export async function sendTelegramMessage({ botToken, chatId, text }) {
  if (!botToken || !chatId) {
    throw new Error('Bot token / Chat ID belum diisi.');
  }
  const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId.trim(), text }),
  });
  if (!res.ok) {
    throw new Error(`Telegram HTTP ${res.status} — cek token & koneksi.`);
  }
  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.description || 'Telegram menolak pesan — cek token & chat ID.');
  }
  return json;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function fmtDelta(v, suffix = '') {
  const num = Number(v) || 0;
  if (num === 0) return `±0${suffix}`;
  return `${num > 0 ? '+' : ''}${num}${suffix}`;
}

/** Susun teks digest: KPI + delta vs baseline kemarin. */
export function buildDigestText({ moduleTitle, regionLabel, stats, delta, previousDate, updatedAt }) {
  const lines = [];
  lines.push(`INFRANEXIA — Laporan ${moduleTitle} • ${regionLabel}`);
  if (updatedAt) {
    try {
      lines.push(new Date(updatedAt).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }));
    } catch { /* abaikan */ }
  }
  lines.push('');
  lines.push(`Total Order: ${fmtNum(stats.total)}`);
  lines.push(`Golive/UT: ${fmtNum(stats.golive)} (${stats.ach}%)`);
  lines.push(`In Progress: ${fmtNum(stats.open)}`);
  lines.push(`Drop: ${fmtNum(stats.drop)}`);
  lines.push('');
  if (delta && previousDate) {
    let prevLabel = previousDate;
    try {
      prevLabel = new Date(`${previousDate}T00:00:00`).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short',
      });
    } catch { /* pakai mentah */ }
    lines.push(`vs ${prevLabel}: Total ${fmtDelta(delta.total)} | Golive ${fmtDelta(delta.golive)} | Open ${fmtDelta(delta.open)} | Ach ${fmtDelta(delta.ach, '%')}`);
  } else {
    lines.push('Baseline pertama tersimpan — pergerakan vs kemarin tampil mulai besok.');
  }
  return lines.join('\n');
}
