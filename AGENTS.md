# AGENTS.md — Panduan untuk AI Coding Agent

Dokumen ini berlaku untuk **setiap AI agent** (Claude Code, atau agent lain) yang bekerja di repo
proyek ini. Baca dokumen ini lebih dulu sebelum menyentuh kode.

---

## 1. Dokumen Wajib Dibaca (urutan)

1. `PRD.md` — apa yang harus dibangun dan kenapa.
2. `ARCHITECTURE.md` — bagaimana strukturnya dibangun.
3. `skill.md` — istilah & aturan bisnis domain (JANGAN menebak-nebak logic bisnis, semua yang penting
   ada di sini atau harus ditanyakan).
4. `TODO.md` — task apa yang sedang dikerjakan sekarang.
5. `workflow.md` — proses kerja harian (branching, testing, definisi selesai).

Jangan mulai coding sebelum tahu di mana posisi task saat ini di `TODO.md`.

---

## 2. Skill Tambahan yang Tersedia

Selain dokumen-dokumen di atas, tersedia beberapa skill UI/frontend design yang sudah terinstall di
environment ini: `frontend-design`, `ui-design`, `ui-radar`, `web-design-guidelines`,
`emil-design-eng`, `anti-ui-slop`, dan `find-skills` (meta-skill untuk mencari skill lain yang relevan
kalau ada kebutuhan yang belum tercakup skill di atas).

**Gunakan skill-skill ini setiap kali mengerjakan task yang menghasilkan UI/komponen visual** — semua
task "Panel: ..." di `TODO.md` (Site Overview, Status Deployment, Matrix, chart, peta, dsb.), bukan
cuma sekali di awal proyek. Tujuannya supaya tampilan dashboard punya arah desain yang jelas dan tidak
terlihat generik/template bawaan library. Kalau ragu skill mana yang paling relevan untuk task
tertentu, pakai `find-skills` dulu untuk mengecek.

Skill-skill ini melengkapi, bukan menggantikan, keputusan arsitektur di `ARCHITECTURE.md` — kalau ada
konflik (mis. rekomendasi library dari skill vs. yang sudah ditetapkan di `ARCHITECTURE.md` §2), stack
teknis di `ARCHITECTURE.md` yang jadi acuan utama; skill dipakai untuk keputusan visual/UX, bukan
keputusan tech stack.

## 3. Prinsip Kerja

- **Jangan asumsi diam-diam untuk hal yang berdampak besar.** Bagian-bagian yang ditandai
  `[KONFIRMASI]` di `ARCHITECTURE.md` atau `[ASUMSI — perlu verifikasi]` di `skill.md`, dan
  Pertanyaan Terbuka di `PRD.md` Bagian 10, **harus dikonfirmasi ke user** sebelum diimplementasikan
  sebagai final — kalau user belum menjawab, kerjakan bagian lain dulu dari `TODO.md`, jangan menebak.
- **Verifikasi data dulu, baru coding.** Sebelum menulis parser untuk tab manapun (NODE B/HEM/OLO),
  wajib sudah dilakukan Data Discovery (lihat `workflow.md` Bagian 2) untuk tab tersebut. Jangan
  menulis mapping kolom berdasarkan tebakan.
- **Ikuti pola yang sudah ditetapkan**, jangan reinventing: pembacaan kolom pakai `colIndex()` (lihat
  `skill.md` Bagian 5), bukan index array langsung; filter pakai reducer per modul (lihat
  `ARCHITECTURE.md` Bagian 6), bukan state tersebar di banyak `useState` lepas.
- **Read-only terhadap sumber data.** Jangan pernah menulis kode yang menulis balik ke Google Sheets.
- **Konsisten dengan struktur folder** di `ARCHITECTURE.md` Bagian 3. Kalau ingin menyimpang (misalnya
  menggabungkan modul HEM & OLO jadi satu modul generik karena strukturnya ternyata identik), tulis
  alasannya di commit message dan update `ARCHITECTURE.md`.

---

## 4. Batasan & Larangan

- Jangan menambahkan dependency besar baru (state management library, UI kit besar, dsb.) tanpa
  menuliskan alasannya dan mengecek dulu apakah kebutuhan itu bisa dipenuhi tanpa dependency baru.
- Jangan membuat backend/API server kecuali diminta eksplisit — Fase 1 murni client-side.
- Jangan implementasikan fitur di luar scope Fase 1 (`PRD.md` Bagian 5.2 dan 11) tanpa konfirmasi,
  meskipun terlihat "gampang ditambahkan sekalian".
- Jangan hardcode nilai yang seharusnya dinamis dari data (mis. daftar branch, daftar status) kecuali
  sebagai default/fallback yang jelas ditandai sebagai sementara.
- Jangan pakai `dangerouslySetInnerHTML` untuk menampilkan data dari sumber eksternal.

---

## 5. Cara Melaporkan Progres / Blocker

- Update status task di `TODO.md` setiap kali sebuah task selesai atau berpindah status (lihat
  format checklist di `TODO.md`).
- Kalau menemukan blocker (pertanyaan terbuka yang belum terjawab, data yang tidak sesuai ekspektasi,
  dsb.), catat di bagian "Blocker/Isu Terbuka" pada `TODO.md`, jangan biarkan pekerjaan berhenti diam
  tanpa jejak.
- Kalau menemukan bahwa struktur data sebenarnya berbeda dari asumsi di `skill.md`/`ARCHITECTURE.md`,
  **update dokumen tersebut** setelah dikonfirmasi, supaya dokumentasi tetap jadi sumber kebenaran yang
  akurat untuk agent berikutnya (dokumentasi yang basi lebih berbahaya daripada tidak ada dokumentasi).

---

## 6. Definisi "Selesai" (Definition of Done) — ringkas

Detail lengkap ada di `workflow.md`, ringkasannya:

- Kode berjalan tanpa error di `dev` mode.
- Sesuai dengan functional requirement terkait di `PRD.md` (sebutkan nomor FR di deskripsi
  commit/PR).
- Sudah diuji dengan data nyata dari spreadsheet sumber (bukan hanya data dummy/mock), termasuk kasus
  data kosong/tidak lengkap.
- Tidak melanggar larangan di Bagian 4 dokumen ini.
- Task terkait di `TODO.md` di-update statusnya.

---

## 7. Gaya Komunikasi ke User

- Kalau butuh keputusan dari user (bagian `[KONFIRMASI]`/pertanyaan terbuka), tanyakan secara spesifik
  dan berikan opsi konkret, jangan tanya terbuka tanpa arah.
- Kalau mengerjakan sesuatu berdasarkan asumsi karena belum ada jawaban (untuk hal yang **tidak**
  blocking), sebutkan asumsi itu secara eksplisit di ringkasan pekerjaan, supaya user bisa koreksi
  belakangan.
