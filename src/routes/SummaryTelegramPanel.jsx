import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Settings2, Loader2, CheckCircle2, AlertTriangle, BellRing } from 'lucide-react';
import {
  loadTelegramSettings,
  saveTelegramSettings,
  sendTelegramMessage,
  getLastSentAt,
  markSentNow,
} from '../shared/utils/telegram';
import { STAGES } from '../modules/hem/hem.stageRules';

const SCOPE_KEY = 'summary-daily';
// MODE TES: kirim otomatis tiap 2 menit (kembalikan ke guard harian untuk produksi)
const TEST_INTERVAL_MS = 2 * 60 * 1000;
const TEST_CHECK_MS = 30 * 1000;

function summarizeHemOlo(rows = []) {
  let total = rows.length;
  let golive = 0;
  let open = 0;
  let drop = 0;
  rows.forEach(r => {
    if (r.isClosed) golive++;
    else if (r.stage === STAGES.APPROVED_DROP || r.stage === STAGES.PROPOSED_DROP) drop++;
    else open++;
  });
  return { total, golive, open, drop, ach: total > 0 ? Number(((golive / total) * 100).toFixed(1)) : 0 };
}

function summarizeNodeB(rows = []) {
  let total = rows.length;
  let closed = 0;
  let open = 0;
  let drop = 0;
  rows.forEach(r => {
    if (r.statusLapangan === 'CLOSED') closed++;
    else if (r.statusLapangan === 'DROP') drop++;
    else open++;
  });
  return { total, golive: closed, open, drop, ach: total > 0 ? Number(((closed / total) * 100).toFixed(1)) : 0 };
}

function fmt(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function buildSummaryText({ nodeb, hem, olo }) {
  const lines = ['INFRANEXIA — Ringkasan Harian (ALL)'];
  try {
    lines.push(new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }));
  } catch { /* abaikan */ }
  lines.push('');
  const block = (label, unit, s, closedLabel) => {
    lines.push(`${label} (${fmt(s.total)} ${unit}): ${closedLabel} ${fmt(s.golive)} (${s.ach}%) | Open ${fmt(s.open)} | Drop ${fmt(s.drop)}`);
  };
  block('NODE B', 'site', nodeb, 'Closed');
  block('HEM', 'order', hem, 'Golive');
  block('OLO', 'order', olo, 'Golive');
  return lines.join('\n');
}

/**
 * Satu-satunya panel alert Telegram (opsi A): digest gabungan 3 modul
 * dari halaman Ringkasan — auto 1x sehari + tombol manual.
 */
export function SummaryTelegramPanel({ nodebRows = [], hemRows = [], oloRows = [] }) {
  const [settings, setSettings] = useState(() => loadTelegramSettings());
  const [showConfig, setShowConfig] = useState(false);
  const [sendState, setSendState] = useState('idle');
  const [sendMsg, setSendMsg] = useState('');
  const autoAttempted = useRef(false);

  const configured = Boolean(settings.botToken && settings.chatId);
  const ready = nodebRows.length > 0 || hemRows.length > 0 || oloRows.length > 0;

  const doSend = useCallback(async (isAuto) => {
    if (!settings.botToken || !settings.chatId) {
      setSendState('error');
      setSendMsg('Isi Bot Token & Chat ID dulu (klik ikon gerigi).');
      return false;
    }
    setSendState('sending');
    setSendMsg(isAuto ? 'Mengirim alert otomatis…' : 'Mengirim laporan…');
    try {
      const text = buildSummaryText({
        nodeb: summarizeNodeB(nodebRows),
        hem: summarizeHemOlo(hemRows),
        olo: summarizeHemOlo(oloRows),
      });
      await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId, text });
      setSendState('sent');
      setSendMsg(isAuto ? 'Alert otomatis terkirim ke Telegram.' : `Laporan terkirim (${new Date().toLocaleTimeString('id-ID')}).`);
      return true;
    } catch (err) {
      setSendState('error');
      setSendMsg(err.message || 'Gagal mengirim ke Telegram.');
      return false;
    }
  }, [settings.botToken, settings.chatId, nodebRows, hemRows, oloRows]);

  // MODE TES: cek tiap 30 detik, kirim jika >= 2 menit sejak kirim terakhir
  useEffect(() => {
    if (!ready || !settings.autoSend || !configured) return;
    let timer = null;
    const tick = async () => {
      if (autoAttempted.current) return;
      if (Date.now() - getLastSentAt(SCOPE_KEY) < TEST_INTERVAL_MS) return;
      autoAttempted.current = true;
      const ok = await doSend(true);
      if (ok) markSentNow(SCOPE_KEY);
      autoAttempted.current = false;
    };
    tick();
    timer = setInterval(tick, TEST_CHECK_MS);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [ready, settings.autoSend, configured, doSend]);

  const handleSave = () => {
    saveTelegramSettings(settings);
    setShowConfig(false);
    setSendState('idle');
    setSendMsg('Konfigurasi tersimpan di browser ini.');
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-sky-400" />
          <div>
            <h3 className="text-slate-200 font-semibold text-sm">Alert Telegram — Ringkasan (TES: tiap 2 mnt)</h3>
            <p className="text-[11px] text-slate-500">
              {configured
                ? `Digest NODE B + HEM + OLO, otomatis 1x sehari ${settings.autoSend ? 'aktif' : 'nonaktif'}`
                : 'Belum dikonfigurasi — klik ikon gerigi untuk isi Bot Token & Chat ID'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConfig(v => !v)}
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            title="Konfigurasi Telegram"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => doSend(false)}
            disabled={sendState === 'sending' || !ready}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {sendState === 'sending'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Send className="w-3.5 h-3.5" />}
            Kirim Sekarang
          </button>
        </div>
      </div>

      {sendMsg && (
        <div className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg border ${
          sendState === 'sent'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : sendState === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400'
        }`}>
          {sendState === 'sent'
            ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            : sendState === 'error'
              ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              : <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
          <span>{sendMsg}</span>
        </div>
      )}

      {showConfig && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <input
            type="password"
            value={settings.botToken}
            onChange={(e) => setSettings(s => ({ ...s, botToken: e.target.value }))}
            placeholder="Bot Token (dari @BotFather)"
            className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-md text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
          />
          <input
            type="text"
            value={settings.chatId}
            onChange={(e) => setSettings(s => ({ ...s, chatId: e.target.value }))}
            placeholder="Chat ID grup/channel (bot harus jadi anggota)"
            className="px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-md text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.autoSend}
                onChange={(e) => setSettings(s => ({ ...s, autoSend: e.target.checked }))}
                className="accent-sky-500 w-3.5 h-3.5"
              />
              Auto 1x/hari
            </label>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-md transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
