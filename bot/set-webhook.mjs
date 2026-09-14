/**
 * set-webhook.mjs — Daftarkan/hapus webhook Telegram untuk mode Vercel.
 *
 *   node bot/set-webhook.mjs https://domain-anda.vercel.app/api/telegram [secret]
 *   node bot/set-webhook.mjs delete
 *
 * Token dibaca dari env BOT_TOKEN (atau argumen ke-3 jika diawali "token:").
 * PENTING: webhook dan long-polling tidak bisa jalan bersamaan.
 */

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '';
if (!BOT_TOKEN) {
  console.error('BOT_TOKEN belum di-set (env atau bot/.env).');
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error('Pakai: node bot/set-webhook.mjs <url-webhook|delete> [secret]');
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  console.log(JSON.stringify(json, null, 2));
  if (!json.ok) process.exit(1);
}

if (arg === 'delete') {
  await call('deleteWebhook', { drop_pending_updates: true });
  console.log('Webhook dihapus — mode long-polling bisa dipakai lagi.');
} else {
  const secret = process.argv[3] || '';
  await call('setWebhook', {
    url: arg,
    ...(secret ? { secret_token: secret } : {}),
  });
  console.log('Webhook terdaftar. Pastikan env BOT_TOKEN (+ ALLOWED_CHAT_IDS) sudah di-set di Vercel.');
}
