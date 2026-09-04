# skill.md — Pengetahuan Domain: Monitoring Deployment Jaringan

Dokumen ini adalah referensi domain bisnis untuk AI agent yang mengerjakan proyek ini. Isinya
istilah-istilah, aturan klasifikasi, dan rumus yang dipakai berulang kali di seluruh dashboard — supaya
tidak perlu ditanyakan ulang tiap kali implementasi sebuah panel. **Bagian yang ditandai
[ASUMSI — perlu verifikasi]** adalah pengetahuan umum industri deployment jaringan FTTH yang dipakai
sebagai baseline, tapi harus dicek ulang terhadap data & istilah yang benar-benar dipakai di
spreadsheet sumber proyek ini saat Data Discovery (lihat `workflow.md`).

---

## 1. Glosarium Istilah

| Istilah | Arti |
|---|---|
| **Site** | Lokasi fisik titik layanan/instalasi jaringan. |
| **Branch / Cabang** | Unit organisasi regional yang membawahi sejumlah site/order (setingkat kota/kabupaten). |
| **District** | Setingkat dengan Branch, dipakai di modul HEM/OLO sebagai dimensi pengelompokan utama. |
| **STO** | Sentral Telepon Otomat — titik sentral jaringan tempat site/order terhubung; biasanya kode 3 huruf. |
| **HSA** | Home Service Area — area layanan yang lebih granular dari STO. |
| **LOP / NAMA LOP** | "Lokasi Order Pekerjaan" — identifier unik untuk satu order/proyek deployment. |
| **Batch / Batch Order (WO)** | Pengelompokan order berdasarkan gelombang/batch Work Order tertentu. |
| **Subcon / Subkon / Mitra** | Subkontraktor/mitra pelaksana pekerjaan lapangan untuk order tersebut. |
| **Waspang / Waspang TA** | Pengawas lapangan ("Pengawas Lapangan Teknis") yang bertanggung jawab atas order tersebut. |
| **DRM** | Dokumen/hasil evaluasi desain (Design Review/Material) — nilainya dipakai untuk estimasi biaya/nilai order. |
| **BOQ** | Bill of Quantity — rincian jumlah material yang dibutuhkan untuk order. |
| **Golive** | Status order sudah aktif/siap dipakai pelanggan. |
| **Uji Terima (UT)** | Tahap pengujian terima sebelum/sekitar Golive — biasanya digabung dengan Golive sebagai satu tahap final. |
| **Komitmen Golive** | Tanggal target/janji Golive untuk order tersebut. |
| **TGT / REAL (Tiang, Galian, FO)** | Target vs realisasi pekerjaan fisik: pemasangan tiang, penggalian, penarikan kabel fiber optik (FO). |
| **Ach / Achievement / Ach Closed** | Persentase/jumlah order yang sudah selesai ("Closed") dari total order pada suatu kelompok (branch/batch/subkon). |
| **Aging / Durasi Order** | Lama waktu (dalam hari) sejak order dibuat/submit sampai sekarang, khusus untuk order yang masih berjalan (open). |

---

## 2. Klasifikasi Tahap Progres (Stage) — Modul HEM & OLO

Order pada modul HEM dan OLO diklasifikasikan berdasarkan kolom `Progress Lapangan` **(TERVERIFIKASI)**
— nama kolom persis: `Progress Lapangan` (HEM kolom S, OLO kolom R).

Nilai mentah di kolom ini (hasil Data Discovery) dan grouping ke **7 tahap utama**:

1. **Approved Drop** — `APPROVED DROP` (HEM: 324, OLO: 45)
2. **Proposed Drop** — `11 PROPOSED DROP` (HEM: 49, OLO: 1)
3. **Persiapan** (rollup) — gabungan dari 5 sub-tahap (lihat Bagian 2.1):
   - `01 PERSIAPAN` (HEM: 4, OLO: 0)
   - `10 HOLD` (HEM: 8, OLO: 0)
   - `02 AANDWIJZING` (HEM: 23, OLO: 0)
   - `03 PERIZINAN` (HEM: 13, OLO: 1)
   - `04 MATDEL` (HEM: 27, OLO: 0)
4. **Instalasi** — `05 INSTALASI` (HEM: 10, OLO: 1)
5. **Finish Instal** — `06 F. INSTALASI` (HEM: 6, OLO: 0)
6. **Bisa PT1** — `BISA PT1` (HEM: 67, OLO: 0)
7. **Golive / UT** (rollup) — `07 GOLIVE` (HEM: 561, OLO: 43) + `08 UJI TERIMA` (HEM: 44, OLO: 46)

### 2.1 Sub-tahap "Persiapan"

Tahap "Persiapan" adalah gabungan dari 5 sub-tahap (termasuk `01 PERSIAPAN` sebagai catch-all
untuk order yang belum masuk sub-tahap spesifik):

- **Persiapan (umum)** — `01 PERSIAPAN` — order baru masuk tahap persiapan, belum ada sub-tahap.
- **Hold** — `10 HOLD` — order ditahan sementara.
- **Aanwijzing** — `02 AANDWIJZING` — tahap survey/penjelasan teknis awal (ejaan di sheet: "AANDWIJZING").
- **Perizinan** — `03 PERIZINAN` — proses pengurusan izin.
- **Matdel** — `04 MATDEL` — "Material Delivery" — pengiriman material ke lokasi.

### 2.2 Klasifikasi Progres — Modul NODE B

NODE B punya struktur progres **berbeda** dari HEM/OLO. Dua kolom utama:

**Kolom `Status Lapangan` (kolom X)** — dimensi utama status:
- `CLOSED` (803)
- `OPEN` (362)
- `DROP` (121)
- `KENDALA` (60)

**Kolom `PROGRES LAPANGAN` (kolom Y)** — detail progres (perhatikan: UPPERCASE, beda dari HEM/OLO):
- `03 AANWIJZING` (41) — note: ejaan "AANWIJZING", beda dari HEM "AANDWIJZING"
- `04 PERIZINAN` (79)
- `05 MATDEL` (108)
- `06 INSTALASI` (67)
- `07 FINISH INSTALASI` (25)
- `08 ON AIR` (778)
- `Site ID Tidak Ditemukan` (43)
- `XX CHANGE TO RADIO` (27)
- `XX DROP` (94)
- `XX HOLD ISSUE` (32)
- `XX ISSUE TSEL` (24)
- `XX REDESIGN` (28)

**Kolom `SUB PROGRES LAPANGAN` (kolom Z)** — 34 nilai unik, termasuk: `GOLIVE` (495),
`PENJADWALAN AANWIJZING/SURVEY` (94), `MENUNGGU ALPRO TOWER` (89), `COMMCASE P-3` (68),
`CANCEL/HOLD TSEL` (62), `MATERIAL TIDAK READY` (50), `TERMINASI` (40), `ISU PRIVATE AREA` (39),
`PROGRES QE` (38), `OGP INSTAL ONT` (35), `PU NAS` (33), `READY OA` (30),
`DELIVERY MATERIAL WH KE SITE` (30), dan lainnya.

### 2.3 Aturan Pencocokan Nilai (Matching Rule)

Nilai mentah pakai **prefix nomor** (contoh: `01 PERSIAPAN`, `08 UJI TERIMA`) **(TERVERIFIKASI)**.
Aturan matching:

1. Normalisasi: uppercase + trim + collapse whitespace.
2. Cocokkan pakai `includes()` substring match, urutan dari paling spesifik ke umum:
   - `APPROVED DROP` dulu (supaya tidak tertangkap oleh "DROP" generik)
   - `PROPOSED DROP` / `11 PROPOSED DROP`
   - lalu prefix-prefix numerik (`01`, `02`, dst)
   - `BISA PT1` terakhir sebelum fallback
3. Nilai tidak cocok → `"unknown"`, tetap ditampilkan di UI.

---

## 3. Bucket Umur Order (Aging)

Kolom aging **sudah tersedia** di sheet sebagai kolom `klaf durasi order` **(TERVERIFIKASI)** — tidak
perlu dihitung ulang di frontend. Tapi format penamaan bucket **berbeda antar tab**:

**HEM** (kolom AJ):
- `1.<7HR` — kurang dari 7 hari
- `2.8-14HR` — 8–14 hari
- `3.15-21HR` — 15–21 hari
- `4.22-30HR` — 22–30 hari
- `5.>1BLN` — lebih dari 1 bulan
- `6.>2BLN` — lebih dari 2 bulan

**OLO** (kolom AE):
- `1.<7HR`, `2.8-14HR`, `3.15-21HR`, `4.22-30HR` — sama seperti HEM
- `5.LEBIHI DARI 1 BLN` — **beda penamaan** dari HEM (`5.>1BLN`)

**NODE B**: tidak ada kolom aging eksplisit — tapi ada kolom `DURASI ORDER` (AB, number) yang bisa
dipakai untuk menghitung bucket jika diperlukan.

Parser harus menormalisasi nama bucket ke label display yang konsisten. Sorting by prefix angka
(`1.`, `2.`, dst).

Urutan warna: hijau (paling segar/baru) → kuning → oranye → merah (paling lama/paling bermasalah).

---

## 4. Rumus & Perhitungan Umum

- **Ach % Closed** (per Branch/Batch/Subkon) =
  `(jumlah order berstatus "Closed"/tahap final) / (total order dalam kelompok tersebut) × 100%`
- **Durasi order** (dalam hari) = `TANGGAL_SEKARANG - TANGGAL_SUBMIT_ORDER`, dibulatkan ke hari penuh.
  Pastikan parsing tanggal dari Google Sheets ditangani dengan benar — format gviz mengembalikan
  tanggal dalam bentuk khusus (`Date(YYYY,M,D)` sebagai string di dalam JSON), bukan objek `Date`
  langsung — perlu fungsi parsing khusus, bukan `new Date(rawValue)` langsung.
- **Target vs Realisasi** (Tiang/Galian/FO di modul NODE B) — ditampilkan sebagai perbandingan angka
  target vs angka real, dan/atau persentase pencapaian = `REAL / TARGET × 100%` (tangani kasus
  `TARGET = 0` supaya tidak divide-by-zero).

---

## 5. Pola Teknis: Pembacaan Kolom yang Tahan Perubahan

Karena spreadsheet sumber sering berubah struktur kolomnya (kolom ditambah/dipindah/nama diubah
sedikit), gunakan pola pencarian kolom **berdasarkan nama header**, bukan index posisi tetap:

```
function colIndex(cols, exactHeaderLabel, fallbackIndex) {
  // 1. Cari kolom dengan label persis sama (case-insensitive, trim)
  // 2. Kalau tidak ketemu, pakai fallbackIndex sebagai cadangan
  // 3. (disarankan) log warning kalau fallback terpakai, supaya ketahuan sheet berubah
}
```

Setiap fungsi parser tab (NODE B, HEM, OLO) mendefinisikan daftar kolom yang dibutuhkan di bagian atas
fungsi dengan pola ini, baru setelah itu melakukan iterasi baris data. Ini membuat parser tetap jalan
walau urutan kolom di sheet berubah, selama nama header-nya tidak berubah total.

---

## 6. Parsing Koordinat Lokasi & Mapping Regional

### 6.1 Koordinat

- **NODE B**: ada 2 kolom angka terpisah — `LAT SITE` (kolom I) dan `LONG SITE` (kolom J). **(TERVERIFIKASI)**
  - ⚠️ **Pembersihan Data Wajib**: sebagian data tidak diformat desimal (contoh: `-3200026` seharusnya `-3.200026`, `10185976` seharusnya `101.85976`).
  - Logic parsing: jika `Math.abs(lat) > 90`, bagi dengan `10^N` sampai masuk rentang `[-90, 90]`. Jika `Math.abs(lng) > 180`, bagi sampai masuk `[90, 140]` (rentang Indonesia).
  - Buang koordinat `(0, 0)` atau `null`.
- **HEM & OLO**: **TIDAK ADA** kolom koordinat di sheet. **(TERVERIFIKASI)**
  - Solusi: peta HEM & OLO (FR-20) mengambil koordinat dari data **NODE B** yang STO / District-nya cocok (hasil konfirmasi user).

### 6.2 Mapping Regional

Kolom regional **sudah ada di semua sheet** **(TERVERIFIKASI)**, tetapi penamaannya berbeda:

- **NODE B**: kolom `REGION` (kolom D) — nilai: `SBS`, `SBT`, `SBU` (sudah sesuai URL route).
- **HEM**: kolom `REGION` (kolom A) — nilai: `SUMBAGSEL`, `SUMBAGTENG`, `SUMBAGUT`.
- **OLO**: kolom `REGION` (kolom I) — nilai: `SUMBAGSEL`, `SUMBAGTENG`, `SUMBAGUT`.

Mapping ke Route Code:
- `SUMBAGUT` / `SBU` → Route `/sbu/`
- `SUMBAGTENG` / `SBT` → Route `/sbt/`
- `SUMBAGSEL` / `SBS` → Route `/sbs/`

### 6.3 Normalisasi District

District di tab NODE B bercampur kapitalisasi & whitespace (`"Banda Aceh\r"`, `"Batam\r\n"`, `"BENGKULU"`, `"lampung"`).
**Wajib di-trim & di-uppercase** saat parsing: `rawDistrict.trim().replace(/[\r\n]+/g, '').toUpperCase()`.

---

## 7. Catatan Umum Data Google Sheets via gviz

- Sel kosong bisa muncul sebagai `null`/`undefined` di objek respons — selalu berikan nilai default
  (string kosong `""` atau `"-"`) saat parsing, jangan biarkan `undefined` menjalar ke komponen UI.
- Baris yang identifier utamanya kosong (mis. Site ID / Nama LOP kosong) sebaiknya di-skip saat
  parsing — biasanya berarti baris kosong/formatting di sheet, bukan data valid.
- Kolom angka bisa datang sebagai string jika sel sumber diformat sebagai teks — selalu `Number(...)`
  eksplisit dengan fallback `|| 0` untuk kolom yang dipakai dalam kalkulasi.
