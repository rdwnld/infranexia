/**
 * bot.js — Bot Telegram perintah Tingkat 1, MODE LONG-POLLING (tanpa dependensi).
 * Untuk deploy Vercel pakai MODE WEBHOOK (api/telegram.js) — jangan jalankan
 * keduanya bersamaan (hapus webhook dulu via `node bot/set-webhook.mjs delete`).
 *
 * Perintah: /start /help /laporan /nodeb /hem /olo
 *
 * Env (atau file bot/.env, lihat .env.example):
 *   BOT_TOKEN          (wajib)
 *   ALLOWED_CHAT_IDS   (opsional, koma-dipisah)
 *
 * Jalankan:  npm run bot
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleTelegramUpdate } from './commands.js';

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
const ALLOWED_CHAT_IDS = process.env.ALLOWED_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '';

if (!BOT_TOKEN) {
  console.error('BOT_TOKEN belum di-set. Isi env BOT_TOKEN atau buat file bot/.env (lihat bot/.env.example).');
  process.exit(1);
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
        handleTelegramUpdate(update, { botToken: BOT_TOKEN, allowedChatIds: ALLOWED_CHAT_IDS })
          .catch(err => console.error('handleUpdate:', err.message));
      }
    } catch (err) {
      console.error('Koneksi:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

pollLoop();
