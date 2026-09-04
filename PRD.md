# PRD — Dashboard Monitoring Deployment Jaringan Regional Sumatera

Versi: 0.1 (draft awal)
Pemilik produk: (isi nama/jabatan)
Target pembaca: AI coding agent & tim developer yang mengerjakan proyek ini

---

## 1. Ringkasan Produk

Dashboard web untuk memonitor progres deployment infrastruktur jaringan (site, tiang, kabel FO, dsb.)
di wilayah **Regional Sumatera**, dipecah menjadi tiga sub-regional:

- **Sumatera Bagian Utara (SBU)**
- **Sumatera Bagian Tengah (SBT)**
- **Sumatera Bagian Selatan (SBS)**

Data ditarik langsung (live) dari Google Sheets dan divisualisasikan dalam bentuk chart, tabel, dan peta
interaktif, dengan sistem filter yang saling terhubung antar-panel.

Dashboard mencakup **tiga modul data**:

1. **NODE B** — progres deployment site Node B (site fisik, tiang, galian, fiber optik).
2. **HEM** — progres deployment order kategori "HEM".
3. **OLO** — progres deployment order kategori "OLO".

---

## 2. Latar Belakang & Masalah yang Dipecahkan

Tim lapangan dan manajemen butuh visibilitas real-time atas ribuan order/site yang sedang berjalan di
seluruh regional Sumatera, supaya:

- Bisa cepat lihat *bottleneck* — cabang/batch/subkontraktor mana yang order-nya paling lama nyangkut.
- Bisa memantau pencapaian ("Ach Closed") per cabang, per batch, per subkontraktor.
- Bisa melihat sebaran lokasi site/order secara geografis (peta).
- Bisa drill-down dari angka ringkasan ke detail baris data tanpa harus buka spreadsheet mentah.
- Bisa membandingkan progres antar sub-regional (Utara vs Tengah vs Selatan).

Saat ini proses monitoring dilakukan manual lewat spreadsheet mentah, yang lambat untuk dibaca banyak
orang sekaligus dan rawan salah baca data.

---

## 3. Tujuan & Kriteria Sukses

| Tujuan | Kriteria sukses (ukuran) |
|---|---|
| Data selalu real-time | Dashboard menampilkan data terbaru dari Google Sheets setiap kali dibuka/direfresh, tanpa proses manual |
| Navigasi regional jelas | User bisa berpindah antar SBU/SBT/SBS dan antar modul (NODE B/HEM/OLO) dalam ≤2 klik |
| Insight cepat didapat | User bisa menjawab "cabang mana yang paling tertinggal" dalam <10 detik tanpa hitung manual |
| Filter konsisten & intuitif | Klik pada chart/tabel memfilter seluruh halaman terkait; filter bisa direset dengan satu tombol |
| Performa baik | Waktu load awal dashboard < 5 detik pada koneksi kantor normal, render ulang filter < 500ms |

---

## 4. Target Pengguna

- **Tim monitoring/PMO** — memantau progres harian, mencari order yang stuck/aging.
- **Manajemen regional (Branch Manager / Kepala Regional)** — melihat ringkasan pencapaian per wilayah.
- **Tim lapangan/Waspang/Subkon** (opsional, tergantung kebutuhan akses) — melihat status order yang
  jadi tanggung jawabnya.

*(Kebutuhan akses berbeda per role belum final — lihat Bagian 10, Pertanyaan Terbuka.)*

---

## 5. Ruang Lingkup

### 5.1 Termasuk (in-scope, Fase 1)

- Halaman/menu navigasi regional: **SBU, SBT, SBS** (dan opsional ringkasan gabungan Sumatera).
- Tiga modul data per regional: **NODE B, HEM, OLO**.
- Sistem filter interaktif (single-select via klik chart/tabel + multi-select checklist).
- Visualisasi: donut/pie chart, bar chart, tabel ranking, matrix silang (cross-tab), peta interaktif.
- Loading state & error handling saat data gagal diambil dari Google Sheets.
- Tampilan responsif untuk layar desktop (prioritas) dan tablet.

### 5.2 Tidak termasuk (out-of-scope, Fase 1)

- Modul data lain di luar NODE B/HEM/OLO (mis. JPP PT3, PT2, atau modul lain yang mungkin ada di
  spreadsheet sumber tapi tidak diminta).
- Autentikasi/login (kecuali dinyatakan lain — lihat Bagian 10).
- Backend/database sendiri — dashboard membaca langsung dari Google Sheets (client-side).
- Edit data dari dashboard (dashboard bersifat **read-only**, semua edit data dilakukan di spreadsheet
  sumber).
- Fitur analitik lanjutan (prediksi/simulasi) — dipertimbangkan untuk fase berikutnya.

---

## 6. Sumber Data

- **Platform**: Google Sheets, diakses lewat Google Visualization API (`gviz/tq`) — tanpa API key,
  tanpa backend, langsung dari browser (client-side fetch via JSONP/script tag).
- **Syarat**: spreadsheet sumber harus di-share dengan akses *"Anyone with the link can view"* agar
  bisa diakses tanpa login.
- **Tab yang dipakai**: 3 tab spesifik berisi data NODE B, HEM, dan OLO (nama tab & struktur kolom
  persis harus diverifikasi langsung di spreadsheet sebelum implementasi — lihat Bagian 9, Data
  Discovery).
- Detail URL spreadsheet & nama tab: **diisi di `ARCHITECTURE.md` / dikonfirmasi user**, tidak
  di-hardcode di dokumen ini supaya PRD tetap valid walau sumber data berganti.

---

## 7. Kebutuhan Fungsional

### 7.1 Navigasi & Struktur Umum

- **FR-1**: User dapat berpindah antar 3 sub-regional (SBU/SBT/SBS) lewat tab/menu navigasi utama.
- **FR-2**: Di dalam tiap sub-regional, user dapat berpindah antar 3 modul (NODE B/HEM/OLO) lewat
  tab/menu sekunder.
- **FR-3**: (opsional, dikonfirmasi) Tersedia halaman ringkasan gabungan lintas-regional untuk
  perbandingan cepat antara SBU/SBT/SBS.
- **FR-4**: Header menampilkan waktu terakhir data diambil ("last updated") dan tombol refresh manual.

### 7.2 Modul NODE B

- **FR-5 — Site Overview**: donut/pie chart proporsi status site (mis. Closed vs Open, atau breakdown
  status lengkap), dengan badge ringkasan (contoh: "% Closed", total jumlah site).
- **FR-6 — Filter checklist**: filter multi-select untuk dimensi Branch dan Status, ditempatkan di atas
  chart utama, digabung (AND) dengan filter single-select yang sedang aktif.
- **FR-7 — Status by Branch**: breakdown/tabel status site dikelompokkan per cabang (branch).
- **FR-8 — Sub Status ranking**: daftar sub-status terbanyak, terurut (ranked list).
- **FR-9 — Batch Order (WO)**: tabel/rekap data dikelompokkan per batch work order.
- **FR-10 — Peta sebaran site**: peta interaktif menampilkan titik lokasi tiap site (dari data
  koordinat), warna marker berbeda sesuai status.
- **FR-11**: Setiap elemen (slice chart, baris tabel, marker peta) dapat diklik untuk memfilter seluruh
  panel di halaman yang sama berdasarkan dimensi itu; klik ulang pada filter yang sama = filter
  dilepas.

### 7.3 Modul HEM & OLO (struktur sama, data & tema beda)

- **FR-12 — Profiling Order**: strip ringkasan KPI (angka-angka kunci) di bagian atas halaman, plus
  filter checklist "Status Lapangan".
- **FR-13 — Klasifikasi tahapan (stage)**: setiap order diklasifikasikan ke salah satu dari 7 tahap
  utama progres (lihat `skill.md` untuk definisi bisnis lengkap): Approved Drop, Propose Drop,
  Persiapan, Instalasi, Finish Instal, Bisa PT1, Golive/UT (Uji Terima). Tahap "Persiapan" punya
  sub-tahap lebih detail: Hold, Aanwijzing, Perizinan, Matdel.
- **FR-14 — Status Deployment (flow/tree view)**: visualisasi alur horizontal dari Total Order → cabang
  Open/Closed → tiap tahap, dengan jumlah order di tiap node; setiap node dapat diklik untuk memfilter
  halaman.
- **FR-15 — Matrix status per District/Cabang**: tabel silang (cross-tab) District/Cabang × Tahap,
  menunjukkan jumlah order per kombinasi.
- **FR-16 — Analisis aging/durasi order**: pengelompokan order open berdasarkan lama waktu berjalan
  (bucket umur, contoh: <7 hari, 8–14 hari, 15–21 hari, 22–30 hari, >1 bulan, >2 bulan), ditampilkan
  sebagai pareto chart/list, diklik untuk filter.
- **FR-17 — Sub Status table**.
- **FR-18 — Ach Closed ranking**: tiga bar chart terpisah — pencapaian "Closed" per Cabang, per Batch,
  per Subkontraktor.
- **FR-19 — Fokus list**: daftar top-N (mis. 5) batch/subkon dengan order open tertua/paling lama
  tertunda, sebagai *early warning*.
- **FR-20 — Peta sebaran order**: sama seperti FR-10 tapi untuk data HEM/OLO, warna marker mengikuti
  sub-tahap yang lebih detail.
- **FR-21**: Filter kombinasi: klik pada chart/tree (single-select) + checklist multi-select
  Branch/District + dropdown filter tambahan (mis. periode komitmen golive), semua bisa aktif
  bersamaan (AND).

### 7.4 Kebutuhan Lintas-Modul

- **FR-22**: Semua tabel panjang punya pencarian teks bebas (search box) dan/atau pagination/scroll
  agar tetap ringan dirender.
- **FR-23**: Ada indikator loading yang jelas saat data sedang diambil, dan pesan error yang informatif
  (dengan saran perbaikan, mis. "pastikan sharing sheet sudah benar") jika gagal.
- **FR-24**: Setiap panel utama punya judul jelas dan (jika relevan) badge jumlah/ringkasan di header.

---

## 8. Kebutuhan Non-Fungsional

- **NFR-1 — Keamanan**: semua data dari sumber eksternal (Google Sheets) harus dianggap tidak
  terpercaya sepenuhnya; render lewat mekanisme aman React (JSX) dan hindari `dangerouslySetInnerHTML`
  kecuali benar-benar perlu dan sudah disanitasi.
- **NFR-2 — Performa**: render ulang akibat perubahan filter tidak boleh memblokir UI > 500ms untuk
  dataset dengan estimasi ribuan baris per modul; gunakan memoization di titik-titik render berat.
- **NFR-3 — Maintainability**: kode dipecah per komponen/halaman/hook, tidak monolitik; lihat
  `ARCHITECTURE.md`.
- **NFR-4 — Resilience terhadap perubahan sheet**: pembacaan kolom berdasarkan **nama header**, bukan
  index tetap, dengan fallback index — supaya tidak rusak total kalau kolom sumber di-reorder (lihat
  `skill.md`).
- **NFR-5 — Aksesibilitas dasar**: kontras warna cukup, ukuran teks terbaca, elemen interaktif (button,
  checkbox) bisa dioperasikan lewat keyboard.
- **NFR-6 — Kompatibilitas browser**: mendukung browser modern (Chrome/Edge terbaru dua versi ke
  belakang); tidak wajib dukung IE.

---

## 9. Ketergantungan & Prasyarat

1. **Data Discovery** wajib dilakukan sebelum implementasi modul manapun: buka langsung tab sumber
   data di spreadsheet, catat nama kolom persis (header row), tipe data tiap kolom, dan contoh nilai —
   lihat proses ini di `workflow.md`.
2. Spreadsheet sumber harus sudah di-share dengan akses publik-view sebelum dashboard bisa membaca
   data secara live.
3. Definisi pemetaan Branch/District/STO ke 3 sub-regional (SBU/SBT/SBS) harus tersedia sebelum
   navigasi regional bisa diimplementasikan (lihat Bagian 10).
4. Sumber data koordinat (lat/lng) untuk peta harus dipastikan tersedia — baik langsung di tab
   data utama, atau di tab lookup terpisah.

---

## 10. Pertanyaan Terbuka / Perlu Konfirmasi

| # | Pertanyaan | Dampak jika tidak dijawab |
|---|---|---|
| 1 | Bagaimana pemetaan Branch/District ke SBU/SBT/SBS? Apakah sudah ada kolom regional di sheet, atau perlu tabel mapping manual? | Navigasi regional (FR-1, FR-2) tidak bisa diimplementasikan |
| 2 | Nama tab & struktur kolom persis di spreadsheet sumber untuk NODE B, HEM, OLO? | Parsing data (semua FR modul) tidak bisa mulai |
| 3 | Sumber koordinat peta (lat/lng) — kolom langsung atau tab lookup terpisah? | FR-10, FR-20 (peta) tidak bisa diimplementasikan |
| 4 | Apakah dashboard perlu login/pembatasan akses per role/regional? | Menentukan apakah perlu modul auth di luar scope Fase 1 |
| 5 | Apakah perlu halaman ringkasan gabungan lintas-regional (FR-3)? | Menentukan struktur navigasi final |
| 6 | Berapa estimasi jumlah baris data per modul (skala data)? | Menentukan strategi performa (virtualisasi tabel, dsb.) |
| 7 | Apakah fitur lanjutan (baseline harian "data bergerak", insight otomatis, simulasi proyeksi) dibutuhkan di Fase 1, atau ditunda? | Menentukan cakupan Fase 1 vs Fase 2 |

---

## 11. Fase Pengerjaan (ringkas — detail di `TODO.md`)

- **Fase 0**: Data Discovery & konfirmasi pertanyaan terbuka.
- **Fase 1**: Setup proyek, koneksi data, modul NODE B lengkap.
- **Fase 2**: Modul HEM & OLO (panel inti).
- **Fase 3**: Navigasi regional SBU/SBT/SBS.
- **Fase 4** (opsional): fitur lanjutan (baseline harian, insight, simulasi).
