import React, { useCallback, useRef, useState } from 'react';
import { Send, Settings2, Loader2, CheckCircle2, AlertTriangle, BellRing } from 'lucide-react';
import {
  loadTelegramSettings,
  saveTelegramSettings,
  sendTelegramMessage,
} from '../shared/utils/telegram';
import { REGION_BADGES } from '../regions/regionConfig';

const MAX_LIST_PER_MODULE = 20;

function fmt(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Escape karakter Markdown Telegram agar nama order tidak merusak format pesan
function escapeMd(s) {
  return String(s ?? '').replace(/([*_`[])/g, '\\$1');
}

// Order open yang Komitmen Golive-nya sudah lewat hari ini
// (bukan Golive/Closed, bukan Drop, bukan Hold, bukan Bisa PT1 — sama seperti tabel OPEN LOP)
function getOverdueRows(rows = []) {
  const today = todayISO();
  return rows
    .filter(r => {
      if (!r || r.isClosed) return false;
      if ((r.stage || '').toUpperCase().includes('DROP')) return false;
      const prog = (r.progressLapangan || '').toUpperCase();
      const sub = (r.subStatus || '').toUpperCase();
      if (prog.includes('HOLD') || sub.includes('HOLD')) return false;
      if (prog.includes('BISA PT1') || sub.includes('BISA PT1')) return false;
      const t = r.targetGolive;
      if (!t || !/^\d{4}-\d{2}-\d{2}/.test(t)) return false;
      return t < today;
    })
    .map(r => ({
      ...r,
      daysLate: Math.round((Date.parse(today) - Date.parse(r.targetGolive)) / 86400000),
    }))
    .sort((a, b) => b.daysLate - a.daysLate);
}

function buildSummaryText({ hemRows = [], oloRows = [] }) {
  const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const lines = [
    `*INFRANEXIA — Order Overdue*`,
    `Tanggal: ${dateStr}`,
    ``,
  ];

  const block = (label, rows) => {
    const overdue = getOverdueRows(rows);
    lines.push(`*Modul ${label} — ${fmt(overdue.length)} order overdue*`);
    if (overdue.length === 0) {
      lines.push(`- Tidak ada order overdue.`);
      lines.push(``);
      return;
    }
    const byRegion = REGION_BADGES
      .map(region => ({ region, rows: overdue.filter(r => r.region === region) }))
      .filter(g => g.rows.length > 0);
    const rest = overdue.filter(r => !REGION_BADGES.includes(r.region));
    if (rest.length > 0) byRegion.push({ region: 'Lainnya', rows: rest });
    let shown = 0;
    for (const g of byRegion) {
      lines.push(``);
      lines.push(`*━━ Regional ${g.region} (${fmt(g.rows.length)} ━━*`);
      for (const r of g.rows) {
        if (shown >= MAX_LIST_PER_MODULE) break;
        lines.push(`- *${escapeMd(r.namaLop)}* | ${escapeMd(r.district)} | Komitmen ${r.targetGolive} | Telat ${r.daysLate} hari`);
        shown++;
      }
      if (shown >= MAX_LIST_PER_MODULE) break;
    }
    if (overdue.length > shown) {
      lines.push(`- ... dan ${fmt(overdue.length - shown)} order overdue lainnya.`);
    }
    lines.push(``);
  };

  block('HEM', hemRows);
  block('OLO', oloRows);

  return lines.join('\n');
}

function getPersiapanRows(rows = []) {
  return rows
    .filter(r => {
      if (!r || r.isClosed) return false;
      if (r.stage !== 'Persiapan') return false;
      const prog = (r.progressLapangan || '').toUpperCase();
      const sub = (r.subStatus || '').toUpperCase();
      if (prog.includes('HOLD') || sub.includes('HOLD') || r.subStagePersiapan === 'Hold') return false;
      if (r.subStagePersiapan === 'Perizinan' || r.subStagePersiapan === 'Matdel') return false;
      return true;
    })
    .sort((a, b) => (a.district || '').localeCompare(b.district) || (a.namaLop || '').localeCompare(b.namaLop));
}

function buildModulePersiapanChunks(label, rows) {
  const dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const persiapan = getPersiapanRows(rows);

  if (persiapan.length === 0) {
    return [
      `*INFRANEXIA — Reminder Order Persiapan & Aanwijzing (${label})*` +
      `\nTanggal: ${dateStr}\n\n*Modul ${label} — 0 order*\n- Tidak ada order Persiapan/Aanwijzing.`
    ];
  }

  const byRegion = REGION_BADGES
    .map(region => ({ region, rows: persiapan.filter(r => r.region === region) }))
    .filter(g => g.rows.length > 0);
  const rest = persiapan.filter(r => !REGION_BADGES.includes(r.region));
  if (rest.length > 0) byRegion.push({ region: 'Lainnya', rows: rest });

  const chunks = [];
  let currentLines = [
    `*INFRANEXIA — Reminder Order Persiapan & Aanwijzing (${label})*`,
    `Tanggal: ${dateStr}`,
    ``,
    `*Modul ${label} — ${fmt(persiapan.length)} order*`,
  ];

  for (const g of byRegion) {
    const regionHeader = `*━━ Regional ${g.region} (${fmt(g.rows.length)} ━━*`;
    const districts = [...new Set(g.rows.map(r => r.district || 'UNKNOWN'))].sort();

    const regionLines = [``, regionHeader];
    for (const dist of districts) {
      const distRows = g.rows.filter(r => (r.district || 'UNKNOWN') === dist);
      if (distRows.length === 0) continue;
      regionLines.push(``);
      regionLines.push(`${escapeMd(dist)}`);
      distRows.forEach((r, idx) => {
        regionLines.push(`${idx + 1}. ${escapeMd(r.namaLop)}`);
      });
    }

    const testChunk = [...currentLines, ...regionLines].join('\n');
    if (testChunk.length > 3800 && currentLines.length > 4) {
      chunks.push(currentLines.join('\n'));
      currentLines = [
        `*INFRANEXIA — Reminder Order Persiapan & Aanwijzing (${label}) (Lanjutan)*`,
        `Tanggal: ${dateStr}`,
        ``,
        ...regionLines
      ];
    } else {
      currentLines.push(...regionLines);
    }
  }

  if (currentLines.length > 0) {
    chunks.push(currentLines.join('\n'));
  }

  return chunks;
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
  const sendingRef = useRef(false);

  const configured = Boolean(settings.botToken && settings.chatId);
  const ready = nodebRows.length > 0 || hemRows.length > 0 || oloRows.length > 0;

  const doSend = useCallback(async (isAuto) => {
    if (sendingRef.current) return false;
    if (!settings.botToken || !settings.chatId) {
      setSendState('error');
      setSendMsg('Isi Bot Token & Chat ID dulu (klik ikon gerigi).');
      return false;
    }
    sendingRef.current = true;
    setSendState('sending');
    setSendMsg(isAuto ? 'Mengirim alert otomatis…' : 'Mengirim laporan…');
    try {
      const text1 = buildSummaryText({ hemRows, oloRows });
      await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId, text: text1 });

      const hemChunks = buildModulePersiapanChunks('HEM', hemRows);
      for (const chunk of hemChunks) {
        await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId, text: chunk });
      }

      const oloChunks = buildModulePersiapanChunks('OLO', oloRows);
      for (const chunk of oloChunks) {
        await sendTelegramMessage({ botToken: settings.botToken, chatId: settings.chatId, text: chunk });
      }

      setSendState('sent');
      setSendMsg(isAuto ? 'Alert otomatis terkirim ke Telegram.' : `Laporan lengkap terkirim (${new Date().toLocaleTimeString('id-ID')}).`);
      return true;
    } catch (err) {
      setSendState('error');
      setSendMsg(err.message || 'Gagal mengirim ke Telegram.');
      return false;
    } finally {
      sendingRef.current = false;
    }
  }, [settings.botToken, settings.chatId, nodebRows, hemRows, oloRows]);

  const handleSave = () => {
    saveTelegramSettings(settings);
    setShowConfig(false);
    setSendState('idle');
    setSendMsg('Konfigurasi tersimpan di browser ini.');
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <div>
            <h3 className="text-slate-800 dark:text-slate-200 font-semibold text-sm">Alert Telegram — Order Overdue</h3>
            <p className="text-[11px] text-slate-500">
              {configured
                ? 'Hanya order open yang lewat Komitmen Golive (pengiriman manual)'
                : 'Belum dikonfigurasi — klik ikon gerigi untuk isi Bot Token & Chat ID'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowConfig(v => !v)}
            className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            title="Konfigurasi Telegram"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => doSend(false)}
            disabled={sendState === 'sending' || !ready}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
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
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300'
            : sendState === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300'
              : 'bg-slate-200 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700/60 text-slate-500 dark:text-slate-400'
        }`}>
          {sendState === 'sending'
            ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            : sendState === 'error'
              ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
          <span>{sendMsg}</span>
        </div>
      )}

      {showConfig && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 p-3 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          <input
            type="password"
            value={settings.botToken}
            onChange={(e) => setSettings(s => ({ ...s, botToken: e.target.value }))}
            placeholder="Bot Token (dari @BotFather)"
            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
          />
          <input
            type="text"
            value={settings.chatId}
            onChange={(e) => setSettings(s => ({ ...s, chatId: e.target.value }))}
            placeholder="Chat ID grup/channel (bot harus jadi anggota)"
            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 rounded-md text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
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
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-medium rounded-md transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
