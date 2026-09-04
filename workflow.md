# workflow.md — Alur Kerja Pengembangan

Dokumen ini menjelaskan proses kerja sehari-hari untuk mengembangkan proyek ini — baik oleh AI agent
maupun developer manusia.

---

## 1. Urutan Kerja Umum

```
1. Cek TODO.md → pilih task berikutnya (ikuti urutan fase, jangan lompat ke Fase 2
   sebelum Fase 0/1 relevan selesai)
2. Kalau task berhubungan dengan parsing/kolom data baru → pastikan Data Discovery
   untuk tab itu SUDAH dilakukan (lihat Bagian 2). Kalau belum, kerjakan Data
   Discovery dulu sebagai task tersendiri.
3. Kalau task menyentuh keputusan yang masih [KONFIRMASI]/[ASUMSI] → cek apakah
   sudah dijawab user. Kalau belum dan sifatnya blocking → catat di TODO.md bagian
   Blocker, kerjakan task lain dulu.
4. Implementasi — kalau task-nya menghasilkan UI/komponen visual (panel chart, tabel, peta, dsb.),
   pakai skill UI/design yang tersedia (`frontend-design`, `ui-design`, `ui-radar`,
   `web-design-guidelines`, `emil-design-eng`, `anti-ui-slop`) sebagai acuan, bukan hanya styling
   default library — lihat `AGENTS.md` §2 untuk detailnya.
5. Uji manual dengan data nyata (lihat Bagian 3)
6. Update TODO.md (checklist + Blocker kalau ada temuan baru)
7. Update ARCHITECTURE.md/skill.md kalau ada asumsi yang berubah setelah diverifikasi
8. Commit dengan pesan jelas (lihat Bagian 4)
```

---

## 2. Proses Data Discovery (WAJIB sebelum menulis parser tab manapun)

Ini proses yang **belum pernah dilakukan** untuk sumber data proyek ini — harus dijalankan dari nol
untuk tiap tab (NODE B, HEM, OLO) sebelum kolom apapun di-hardcode ke dalam kode.

**Langkah:**

1. Buka spreadsheet sumber di browser, cari tab yang dimaksud.
2. Catat **nama tab persis** (perhatikan spasi, tanda hubung, kapitalisasi — sering jadi sumber bug
   karena nama tab dipakai sebagai parameter query ke gviz).
3. Catat **baris header** (nama tiap kolom, persis apa adanya — termasuk typo kalau ada, karena
   pencarian kolom nanti berdasarkan string ini).
4. Untuk tiap kolom yang relevan (lihat daftar kandidat kolom di `skill.md` sebagai starting point,
   tapi jangan berasumsi semua kolom itu pasti ada/persis sama nama-nya):
   - Catat tipe data yang sebenarnya muncul (angka, teks, tanggal, formula).
   - Ambil beberapa (5–10) contoh nilai nyata, termasuk kalau ada baris yang datanya kosong/tidak
     lengkap.
5. Khusus kolom klasifikasi status/progres: catat **semua nilai unik** yang ada di kolom itu (bukan
   cuma sampel) — supaya aturan klasifikasi di `skill.md` §2 bisa diverifikasi/disesuaikan mencakup
   semua kasus nyata, bukan cuma tebakan.
6. Khusus kolom koordinat: ambil 2–3 contoh, cocokkan manual dengan lokasi asli (mis. search di Google
   Maps) untuk memastikan urutan lat/lng dan pemisahnya (koma vs spasi) sudah benar dipahami.
7. Tuliskan hasil temuan ke bagian relevan di `skill.md`/`ARCHITECTURE.md`, hapus/ubah tanda
   `[ASUMSI — perlu verifikasi]` atau `[KONFIRMASI]` yang sudah terjawab.
8. Baru setelah itu, mulai tulis fungsi parser untuk tab tersebut.

---

## 3. Pengujian Manual dengan Data Nyata

Karena tidak ada backend/database sendiri, "pengujian dengan data nyata" berarti:

- Jalankan dashboard di mode dev, biarkan fetch data sungguhan dari spreadsheet sumber.
- Cek total jumlah baris yang berhasil di-parse **sama** dengan jumlah baris berisi data di sheet
  (baris kosong boleh di-skip, tapi jangan sampai ada baris berisi data yang hilang tanpa disadari).
- Cek tiap kategori/klasifikasi (status, stage, aging bucket) — total across semua kategori harus sama
  dengan total baris, tidak ada yang "hilang" ke kategori `unknown` dalam jumlah besar tanpa disadari.
- Cek panel peta — pastikan titik-titik muncul di lokasi yang masuk akal (tidak menggerombol di titik
  (0,0) atau di tengah laut, tanda ada masalah parsing koordinat).
- Cek interaksi filter — klik beberapa kombinasi filter, pastikan angka total di badge/summary
  berubah konsisten dengan yang diharapkan.
- Cek kondisi data kosong/tidak lengkap tidak membuat aplikasi crash (baris tanpa STO, tanpa
  koordinat, tanpa nilai numerik, dst.) — sesuai NFR-4 di `PRD.md`.

---

## 4. Konvensi Commit

Format singkat: `<area>: <deskripsi singkat>`, dengan area = nama modul/bagian yang disentuh.

Contoh:
- `nodeb: implementasi panel Site Overview (FR-5)`
- `shared: tambah helper colIndex untuk pembacaan kolom by header`
- `docs: update skill.md - konfirmasi format koordinat tab HEM`

Sebutkan nomor FR (`PRD.md`) di pesan commit kalau task berhubungan dengan requirement fungsional
tertentu, supaya mudah dilacak balik ke PRD.

---

## 5. Kapan Harus Berhenti dan Bertanya ke User

Berhenti dan minta konfirmasi user (jangan lanjut dengan asumsi) kalau:

- Struktur kolom sheet yang sebenarnya **berbeda signifikan** dari starting point di `skill.md` (mis.
  kolom kunci yang disebut di PRD ternyata tidak ada sama sekali).
- Definisi pemetaan regional (SBU/SBT/SBS) belum tersedia dan task yang sedang dikerjakan butuh itu.
- Menemukan kebutuhan fitur yang tidak tercakup di `PRD.md` sama sekali (bukan cuma detail teknis,
  tapi requirement bisnis baru).
- Estimasi kerja untuk sebuah task jauh lebih besar dari perkiraan karena kompleksitas data/bisnis yang
  baru diketahui saat implementasi (mis. logic klasifikasi ternyata jauh lebih rumit dari dugaan).

Untuk hal-hal teknis kecil yang tidak mengubah requirement/scope (mis. penamaan variabel, struktur file
detail), boleh diputuskan sendiri mengikuti pola yang sudah ada di `ARCHITECTURE.md`, tidak perlu
menunggu konfirmasi.

---

## 6. Menjaga Dokumen Tetap Akurat

Kelima dokumen lain (`PRD.md`, `ARCHITECTURE.md`, `skill.md`, `TODO.md`, `AGENTS.md`) adalah sumber
kebenaran bersama untuk semua orang/agent yang bekerja di proyek ini. Setiap kali sebuah asumsi
terbukti salah atau sebuah keputusan `[KONFIRMASI]` dijawab user, **update dokumennya saat itu juga**,
jangan menunda — dokumentasi yang tidak sinkron dengan kondisi nyata proyek lebih berbahaya daripada
tidak ada dokumentasi sama sekali, karena bikin agent berikutnya kerja berdasarkan asumsi yang sudah
usang.
