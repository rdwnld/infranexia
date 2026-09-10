# TODO.md — Backlog Tugas

Format status: `[ ]` belum mulai · `[~]` sedang dikerjakan · `[x]` selesai · `[!]` terblokir (lihat
bagian Blocker di bawah)

---

## Fase 0 — Data Discovery & Konfirmasi (BLOCKER untuk semua fase lain)

- [x] Konfirmasi ke user: definisi pemetaan Branch/District → sub-regional SBU/SBT/SBS (`PRD.md` §10 #1)
- [x] Buka tab sumber data untuk modul NODE B → catat nama tab persis, nama header kolom persis, tipe data tiap kolom, contoh nilai untuk kolom klasifikasi (status/progres)
- [x] Buka tab sumber data untuk modul HEM → catat hal sama seperti di atas
- [x] Buka tab sumber data untuk modul OLO → catat hal sama seperti di atas
- [x] Cek sumber koordinat peta untuk tiap modul (kolom langsung atau tab lookup terpisah?) — catat nama kolom dan format string koordinat yang sebenarnya dipakai (`skill.md` §6)
- [x] Verifikasi daftar nilai mentah kolom klasifikasi status/progres (HEM & OLO) terhadap asumsi di `skill.md` §2 — sesuaikan dokumen kalau berbeda
- [x] Konfirmasi ke user: kebutuhan login/pembatasan akses (`PRD.md` §10 #4)
- [x] Konfirmasi ke user: perlu halaman ringkasan gabungan lintas-regional? (`PRD.md` §10 #5)
- [x] Estimasi skala data (jumlah baris per modul) → tentukan perlu tidaknya virtualisasi tabel (`PRD.md` §10 #6)
- [x] Konfirmasi ke user: fitur lanjutan (baseline harian, insight otomatis, simulasi) — Fase 1 atau ditunda? (`PRD.md` §10 #7)
- [x] Konfirmasi pilihan stack teknis yang ditandai `[KONFIRMASI]` di `ARCHITECTURE.md` §2 (bahasa, routing, state management, chart lib, peta, styling, tabel besar, testing, deploy target)

## Fase 1 — Setup Proyek & Modul NODE B

- [x] Inisialisasi proyek (Vite + React JS + Tailwind CSS)
- [x] Setup ESLint / build config
- [x] Implementasi `shared/data/gvizClient.js` (fetch generik ke gviz/tq)
- [x] Implementasi `shared/data/columnLookup.js` (`colIndex()` — lihat `skill.md` §5)
- [x] Implementasi `useGoogleSheet` / `useNodeBData` hook generik (loading/error/data state)
- [x] Implementasi `nodeb.parser.js` sesuai kolom hasil Data Discovery
- [x] Implementasi `useNodeBData` + `useNodeBFilters`
- [x] Panel: Site Overview (donut chart + badge ringkasan) — FR-5
- [x] Panel: Filter checklist Branch & Status — FR-6
- [x] Panel: Status by Branch — FR-7
- [x] Panel: Sub Status ranking — FR-8
- [x] Panel: Batch Order (WO) table — FR-9
- [x] Panel: Peta sebaran site — FR-10
- [x] Interaksi filter: klik chart/tabel/peta memfilter seluruh halaman — FR-11
- [x] Loading & error state untuk modul NODE B — FR-23
- [x] Uji build proyek dan parser data live NODE B

## Fase 2 — Modul HEM & OLO

- [x] Putuskan: modul HEM & OLO digabung jadi satu modul generik (re-use `HemPage` & `hem.parser.js` dengan prop `isOlo`)
- [x] Implementasi `hem.stageRules.js` (klasifikasi 7 tahap + sub-tahap Persiapan — `skill.md` §2)
- [x] Implementasi `hem.parser.js` untuk tab HEM (`gid=1129058778`) dan OLO (`gid=1544967736`)
- [x] Implementasi `useHemData` + `useHemFilters` reducer
- [x] Panel: Profiling Order (strip KPI) — FR-12
- [x] Panel: Status Deployment (flow horizontal 7 tahap + sub-tahap) — FR-14
- [x] Panel: Matrix status per District — FR-15
- [x] Panel: Analisis aging/durasi order (pareto) — FR-16
- [x] Panel: Sub Status table + search box — FR-17, FR-22
- [x] Panel: Ach Closed — tiga bar chart terpisah per District/Batch/Subkon + search — FR-18, FR-22
- [x] Panel: Fokus list (top-5 order tertua) — FR-19
- [x] Panel: Peta sebaran order — FR-20
- [x] Filter kombinasi + kalender Periode Komitmen Golive — FR-21
- [x] Search box tabel Matrix District — FR-22
- [x] Adaptasi modul OLO (re-use modul HEM dengan dataset OLO)
- [x] Loading & error state untuk modul HEM & OLO
- [x] Uji build proyek dan parser data live HEM & OLO

## Fase 3 — Navigasi Regional

- [x] Implementasi `regionConfig.js` (definisi SBU/SBT/SBS + mapping Branch→Regional hasil Fase 0)
- [x] Setup routing `/:regional/:modul` (+ rute `summary`)
- [x] Layout navigasi utama (tab regional + tab modul + tab Ringkasan) — FR-1, FR-2
- [x] Terapkan filter regional ke pipeline data ketiga modul
- [x] Halaman ringkasan gabungan lintas-regional — FR-3 (`SummaryPage`: HEM + OLO per SBU/SBT/SBS)
- [x] Header: last updated + tombol refresh manual per modul — FR-4 (`DataRefreshBar`)
- [x] Reset filter otomatis saat pindah regional
- [x] Uji build proyek Fase 3

## Fase 4 — Fitur Lanjutan (opsional, tergantung hasil Fase 0 #9)

- [x] Baseline harian "data bergerak" (snapshot localStorage 14 hari + strip delta vs kemarin)
- [x] Insight otomatis (ringkasan naratif rule-based: bottleneck district, penumpukan aging, rasio drop)
- [ ] Simulasi/proyeksi (perlu spesifikasi bisnis terpisah sebelum dikerjakan — jangan mulai tanpa
      requirement jelas dari user)

## Cross-cutting / Kapan Saja

- [ ] Aksesibilitas dasar (kontras warna, navigasi keyboard) — NFR-5
- [ ] Review performa render filter (< 500ms) — NFR-2
- [ ] Review keamanan render data eksternal (tidak ada `dangerouslySetInnerHTML`) — NFR-1
- [ ] Setup deployment ke target hosting hasil konfirmasi

---

## Blocker / Isu Terbuka (diisi berjalan)

*(Kosong — isi di sini setiap kali menemukan hal yang menghambat pekerjaan, dengan format:)*

- **[Tanggal] [Task terkait]** — deskripsi blocker — status: menunggu jawaban dari (siapa)
