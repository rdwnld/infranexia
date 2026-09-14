/**
 * bot.js — Bot Telegram perintah Tingkat 1 (long-polling, tanpa dependensi).
 *
 * Perintah: /start /help /laporan /nodeb /hem /olo
 *
 * Env:
 *   BOT_TOKEN          (wajib — token dari @BotFather)
 *   ALLOWED_CHAT_IDS   (opsional, koma-dipisah — bot hanya balas chat terdaftar)
 *
 * Jalankan:  BOT_TOKEN=xxx node bot/bot.js
 *   atau via file .env (lihat .env.example) + `node bot/bot.js`
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchAllStats, formatModuleLine } from './sheets.js';

// Muat .env di folder bot/ (tanpa dependensi)
try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
    }
  }
} catch {
  // abaikan
}

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
const ALLOWED = new Set(
  String(process.env.ALLOWED_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN belum di-set. Isi env BOT_TOKEN atau buat file .env (lihat .env.example).');
  process.exit(1);
}

const api = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Telegram HTTP ${res.status}`);
  }
  return json.result;
};

const sendMessage = (chatId, text) => api('sendMessage', { chat_id: chatId, text });

const HELP_TEXT = [
  'INFRANEXIA — perintah yang tersedia:',
  '/laporan — digest gabungan NODE B + HEM + OLO',
  '/nodeb — laporan modul NODE B',
  '/hem — laporan modul HEM',
  '/olo — laporan modul OLO',
  '/help — daftar perintah ini',
].join('\n');

function stamp() {
  try {
    return new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

async function buildReport(which) {
  const stats = await fetchAllStats();
  const lines = [`INFRANEXIA — ${stamp()}`, ''];
  if (which === 'nodeb' || which === 'all') {
    lines.push(formatModuleLine('NODE B', 'site', stats.nodeb, 'Closed'));
  }
  if (which === 'hem' || which === 'all') {
    lines.push(formatModuleLine('HEM', 'order', stats.hem, 'Golive'));
  }
  if (which === 'olo' || which === 'all') {
    lines.push(formatModuleLine('OLO', 'order', stats.olo, 'Golive'));
  }
  return lines.join('\n');
}

function parseCommand(text = '') {
  const first = text.trim().split(/\s+/)[0] || '';
  const cmd = first.split('@')[0].toLowerCase(); // abaikan @namabot di grup
  switch (cmd) {
    case '/start':
    case '/help': return { type: 'help' };
    case '/laporan': return { type: 'report', which: 'all' };
    case '/nodeb': return { type: 'report', which: 'nodeb' };
    case '/hem': return { type: 'report', which: 'hem' };
    case '/olo': return { type: 'report', which: 'olo' };
    default: return { type: 'unknown' };
  }
}

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;
  const chatId = String(msg.chat?.id || '');
  if (!chatId) return;

  if (ALLOWED.size > 0 && !ALLOWED.has(chatId)) {
    return; // abaikan chat tak terdaftar — tanpa balasan
  }

  const cmd = parseCommand(msg.text);
  if (cmd.type === 'unknown') return; // hanya respons perintah, bukan obrolan

  if (cmd.type === 'help') {
    await sendMessage(chatId, HELP_TEXT);
    return;
  }

  await api('sendChatAction', { chat_id: chatId, action: 'typing' });
  try {
    const report = await buildReport(cmd.which);
    await sendMessage(chatId, report);
  } catch (err) {
    console.error('Gagal susun laporan:', err.message);
    await sendMessage(chatId, 'Gagal mengambil data laporan. Coba lagi beberapa saat.');
  }
}

async function pollLoop() {
  let offset = 0;
  console.log('Bot jalan (long-polling). Tekan Ctrl+C untuk berhenti.');
  for (;;) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offset, timeout: 30 }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json.ok) {
        console.error('getUpdates:', json.description || `HTTP ${res.status}`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      for (const update of json.result || []) {
        offset = update.update_id + 1;
        handleUpdate(update).catch(err => console.error('handleUpdate:', err.message));
      }
    } catch (err) {
      console.error('Koneksi:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

pollLoop();
