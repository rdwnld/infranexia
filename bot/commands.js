/**
 * commands.js — Logika perintah bot, dipakai bersama mode long-polling (bot.js)
 * dan mode webhook Vercel (api/telegram.js).
 */

import { fetchAllStats, formatModuleLine } from './sheets.js';

export const HELP_TEXT = [
  'INFRANEXIA — perintah yang tersedia:',
  '/laporan — digest gabungan NODE B + HEM + OLO',
  '/nodeb — laporan modul NODE B',
  '/hem — laporan modul HEM',
  '/olo — laporan modul OLO',
  '/help — daftar perintah ini',
].join('\n');

export function parseCommand(text = '') {
  const first = String(text || '').trim().split(/\s+/)[0] || '';
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

function stamp() {
  try {
    return new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export async function buildReport(which) {
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

async function telegramApi(botToken, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.description || `Telegram HTTP ${res.status}`);
  }
  return json.result;
}

/**
 * Tangani satu update Telegram. Return true jika ada pesan terkirim.
 */
export async function handleTelegramUpdate(update, { botToken, allowedChatIds = '' } = {}) {
  const msg = update?.message;
  if (!msg || !msg.text || !botToken) return false;
  const chatId = String(msg.chat?.id || '');
  if (!chatId) return false;

  const allowed = new Set(
    String(allowedChatIds).split(',').map(s => s.trim()).filter(Boolean)
  );
  if (allowed.size > 0 && !allowed.has(chatId)) return false; // abaikan chat tak terdaftar

  const cmd = parseCommand(msg.text);
  if (cmd.type === 'unknown') return false; // hanya respons perintah

  if (cmd.type === 'help') {
    await telegramApi(botToken, 'sendMessage', { chat_id: chatId, text: HELP_TEXT });
    return true;
  }

  await telegramApi(botToken, 'sendChatAction', { chat_id: chatId, action: 'typing' });
  try {
    const report = await buildReport(cmd.which);
    await telegramApi(botToken, 'sendMessage', { chat_id: chatId, text: report });
    return true;
  } catch (err) {
    console.error('Gagal susun laporan:', err.message);
    await telegramApi(botToken, 'sendMessage', { chat_id: chatId, text: 'Gagal mengambil data laporan. Coba lagi beberapa saat.' });
    return true;
  }
}
