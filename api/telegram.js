/**
 * api/telegram.js — MODE WEBHOOK untuk deploy Vercel.
 * Telegram memanggil endpoint ini (POST) setiap ada pesan masuk.
 *
 * Env di dashboard Vercel (Settings → Environment Variables):
 *   BOT_TOKEN                (wajib)
 *   ALLOWED_CHAT_IDS         (disarankan: -1003962265176)
 *   TELEGRAM_WEBHOOK_SECRET  (opsional tapi disarankan — token rahasia validasi webhook)
 */

import { handleTelegramUpdate } from '../bot/commands.js';

export const config = {
  maxDuration: 60, // beri waktu fetch 3 sheet (efektif di paket berbayar; Hobby tetap max bawaan)
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';
  if (expectedSecret && req.headers['x-telegram-bot-api-secret-token'] !== expectedSecret) {
    return res.status(401).send('Unauthorized');
  }

  const botToken = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
  const allowedChatIds = process.env.ALLOWED_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '';

  try {
    await handleTelegramUpdate(req.body, { botToken, allowedChatIds });
  } catch (err) {
    console.error('webhook:', err.message);
  }
  return res.status(200).send('OK');
}
