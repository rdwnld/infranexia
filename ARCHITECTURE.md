# ARCHITECTURE.md — Dashboard Monitoring Regional Sumatera

Dokumen ini menjelaskan arsitektur teknis yang diusulkan. Bagian yang ditandai **[KONFIRMASI]** adalah
keputusan yang masih perlu disetujui user sebelum coding dimulai — AI agent **tidak boleh** menganggap
ini final tanpa konfirmasi eksplisit.

---

## 1. Prinsip Desain

1. **Client-side only** — tidak ada backend/server sendiri di Fase 1. Semua fetch data langsung dari
   browser ke Google Sheets.
2. **Read-only** — dashboard tidak pernah menulis balik ke sumber data.
3. **Resilient terhadap perubahan struktur sheet** — kolom dibaca berdasarkan nama header, bukan posisi
   tetap (lihat Bagian 5).
4. **Modular per domain** — kode untuk NODE B, HEM, OLO dan untuk tiap sub-regional dipisah rapi, tidak
   ada file "dewa" berisi semua logic.
5. **Filter sebagai state terpusat per halaman**, bukan tersebar di banyak variabel lepas.

---

## 2. Tech Stack Final (Terverifikasi)

| Layer | Pilihan | Status |
|---|---|---|
| Bahasa | JavaScript (ES2020+) | Final (React JS) |
| Build tool | Vite | Final |
| Framework UI | React 18+ (function components + hooks) | Final |
| Routing | React Router v6 | Final |
| State management | React Context + `useReducer` per domain | Final |
| Data fetching | Fetch native via `gviz/tq` (JSONP / JSON direct) | Final |
| Chart | Recharts | Final (pilihan terverifikasi) |
| Peta | Leaflet via `react-leaflet` | Final |
| Styling | Tailwind CSS | Final |
| Tabel besar | `@tanstack/react-table` | Final |
| Testing | Vitest + React Testing Library | Final |
| Deploy target | Vercel / Netlify | Final |

### 2.1 Sumber Data & GID Tab (Terverifikasi)

Spreadsheet ID: `1sQuMVrp-GAZu4TrUO5bn3Ul5fLELgNa_rIWDGAI-ujU`

| Modul | Tab GID | Fetch URL | Skala Data | Headers Row |
|---|---|---|---|---|
| NODE B | `636051156` | `.../gviz/tq?tqx=out:json&gid=636051156` | ~1.346 baris | Default (row 1 header) |
| HEM | `1129058778` | `.../gviz/tq?tqx=out:json&gid=1129058778&headers=1` | ~1.136 baris | Headers=1 (row 1 header data) |
| OLO | `1544967736` | `.../gviz/tq?tqx=out:json&gid=1544967736&headers=1` | ~137 baris | Headers=1 (row 1 header data) |

---

## 3. Struktur Folder (Usulan)

```
src/
  main.jsx
  App.jsx                      # Router + layout utama
  routes/
    RegionLayout.jsx           # Layout per sub-regional (SBU/SBT/SBS) + tab navigasi modul
  regions/
    regionConfig.js            # Definisi 3 sub-regional + mapping Branch->Regional
  modules/
    nodeb/
      NodeBPage.jsx
      components/
        SiteOverviewPanel.jsx
        StatusByBranchPanel.jsx
        SubStatusPanel.jsx
        BatchOrderPanel.jsx
        SiteMapPanel.jsx
      hooks/
        useNodeBData.js        # fetch + parse tab NODE B
        useNodeBFilters.js     # reducer filter state khusus NODE B
      nodeb.parser.js          # fungsi parsing baris mentah -> objek terstruktur
      nodeb.types.js           # (atau JSDoc typedefs) bentuk data NodeBRow
    hem/
      HemPage.jsx
      components/
        ProfilingOrderPanel.jsx
        StatusDeploymentPanel.jsx
        DistrictMatrixPanel.jsx
        AgingParetoPanel.jsx
        SubStatusPanel.jsx
        AchClosedPanel.jsx
        FocusListPanel.jsx
        OrderMapPanel.jsx
      hooks/
        useHemData.js
        useHemFilters.js
      hem.parser.js
      hem.stageRules.js        # logic klasifikasi 7-tahap + sub-tahap (lihat skill.md)
    olo/
      ...                      # struktur identik dengan hem/, karena bentuk data & panel sama
  shared/
    data/
      gvizClient.js            # helper generik: loadSheet(sheetName) -> Promise<raw rows>
      columnLookup.js          # helper: cari index kolom by nama header, dengan fallback index
    components/
      ChartWrapper.jsx
      MapWrapper.jsx
      FilterChecklist.jsx
      DataTable.jsx
      LoadingState.jsx
      ErrorState.jsx
    hooks/
      useGoogleSheet.js        # wrapper umum di atas gvizClient + loading/error state
    utils/
      formatters.js            # format angka, tanggal, persentase
      agingBuckets.js           # klasifikasi umur order (lihat skill.md)
  styles/
    (tergantung pilihan CSS Modules/Tailwind)
```

Catatan: modul `hem/` dan `olo/` sengaja punya struktur identik karena bentuk data dan panelnya sama
persis (hanya beda sumber tab dan tema warna) — pertimbangkan apakah keduanya cukup dijadikan **satu
modul generik** (`modules/hemOloShared/`) yang di-*parametrize* dengan config sumber data, supaya tidak
duplikasi logic. Keputusan ini diserahkan ke saat implementasi, tergantung seberapa mirip struktur
kolom keduanya setelah Data Discovery (lihat `workflow.md`).

---

## 4. Alur Data (Data Flow)

```
Google Sheets (gviz/tq JSONP)
        │
        ▼
gvizClient.loadSheet(tabName)         # ambil raw JSON table (cols + rows)
        │
        ▼
<module>.parser.js                    # ubah raw rows -> array objek terstruktur
        │                             #   - lookup kolom by nama header (columnLookup.js)
        │                             #   - normalisasi tipe (angka, tanggal, string)
        │                             #   - skip baris kosong/invalid
        ▼
use<Module>Data hook                  # simpan hasil parse di state/context, expose loading/error
        │
        ▼
use<Module>Filters hook (reducer)     # terapkan filter aktif (single-select + multi-select)
        │
        ▼
Panel components                      # render chart/tabel/peta dari data yang sudah difilter
        │
        ▼
User interaction (klik chart/tabel)   # dispatch action ke reducer filter -> ulangi dari langkah filter
```

Prinsip penting: **parsing hanya dijalankan sekali per fetch** (bukan setiap render), sedangkan
**filtering dijalankan ulang tiap filter berubah**, idealnya di-memoize (`useMemo`) berdasarkan data
mentah + state filter.

---

## 5. Pola Pembacaan Kolom (Column Lookup)

Karena struktur kolom sumber data bisa berubah (nama tab, urutan kolom, dsb.), **jangan** mengakses
kolom lewat index tetap secara langsung. Gunakan helper generik:

```
columnLookup.js
  colIndex(cols, exactHeaderLabel, fallbackIndex) -> number
```

Logic-nya: cari kolom yang label header-nya cocok persis (case-insensitive, trim spasi) dengan
`exactHeaderLabel`; kalau tidak ketemu, pakai `fallbackIndex` sebagai cadangan (dan idealnya log
warning ke console supaya ketahuan kalau sheet berubah). Semua fungsi parser (`nodeb.parser.js`,
`hem.parser.js`, `olo.parser.js`) wajib pakai pola ini, **bukan** `row[5]` langsung.

Ini penting karena tab HEM dan OLO kemungkinan besar punya jumlah kolom dan urutan yang berbeda satu
sama lain meskipun bentuk datanya konsep-nya sama (lihat `skill.md` untuk daftar nama kolom yang perlu
dicek).

---

## 6. State Management — Filter Engine

Setiap halaman modul (NODE B / HEM / OLO) punya reducer filter sendiri dengan bentuk state serupa:

```js
{
  singleSelect: {                 // filter dari klik chart/tabel — hanya 1 nilai aktif per dimensi
    branch: null,
    status: null,
    stage: null,
    // ...dimensi lain sesuai modul
  },
  multiSelect: {                  // filter checklist — bisa banyak nilai aktif sekaligus
    branch: new Set(),
    status: new Set(),
  },
  localToggles: {                 // toggle per-card yang TIDAK memicu filter ulang seluruh halaman
    ach GroupBy: "branch",        // contoh
  }
}
```

Aturan:
- `singleSelect` dan `multiSelect` **digabung dengan AND** saat menghitung data terfilter untuk
  seluruh halaman.
- `localToggles` hanya memengaruhi cara satu panel menampilkan data yang **sudah** difilter — tidak
  memicu perhitungan ulang filter global.
- Klik ulang pada nilai `singleSelect` yang sama = set jadi `null` (toggle off).
- Sediakan action `RESET_FILTERS` yang mengembalikan `singleSelect` dan `multiSelect` ke default.

Implementasi disarankan pakai `useReducer` + selector function (`getFilteredRows(state, rawRows)`)
yang di-memoize, dipanggil oleh tiap panel yang butuh data terfilter.

---

## 7. Navigasi Regional

Router (React Router) disarankan dengan struktur URL:

```
/:regional/:modul
contoh: /sbu/node-b, /sbt/hem, /sbs/olo
```

`regionConfig.js` menyimpan definisi 3 sub-regional dan (setelah tersedia — lihat PRD Bagian 10 #1)
mapping Branch/District → sub-regional, dipakai untuk memfilter data mentah per regional sebelum masuk
ke pipeline filter modul.

---

## 8. Peta (Map)

- Library: Leaflet via `react-leaflet`.
- Setiap modul (NODE B/HEM/OLO) punya `MapWrapper` yang menerima array titik `{lat, lng, label, color,
  status}` sebagai props — parsing koordinat mentah (format string, mis. `"lat,lng"` atau
  `"lng lat"` — **wajib dicek per sumber data**, jangan asumsikan format seragam) dilakukan di layer
  parser, bukan di komponen peta.
- Marker warna mengikuti mapping status/stage yang didefinisikan di `skill.md`.

---

## 9. Chart

- Library: Chart.js via `react-chartjs-2`.
- Wrapper generik `ChartWrapper.jsx` untuk konfigurasi tema warna konsisten (palet warna didefinisikan
  di satu tempat, `shared/utils/theme.js` atau setara).
- Chart yang dibutuhkan: donut/pie (Site Overview), bar (Ach Closed ranking), pareto/bar horizontal
  (aging), tree/flow custom (Status Deployment — kemungkinan perlu komponen custom, bukan built-in
  Chart.js, karena bentuknya flowchart bukan chart standar).

---

## 10. Error & Loading Handling

- Setiap fetch tab data dibungkus try/catch; kegagalan satu tab **tidak** boleh membuat seluruh
  dashboard gagal total — tampilkan modul yang gagal sebagai state error tersendiri, modul lain tetap
  jalan.
- Timeout wajar untuk tiap fetch (contoh: 20 detik), dengan pesan error yang actionable (contoh:
  "Gagal memuat data. Pastikan sheet sudah di-share ke publik.").
- Tombol "Coba lagi" / refresh manual di tiap state error.

---

## 11. Keamanan

- Semua teks dari sumber data dirender lewat JSX biasa (`{value}`), **tidak** lewat
  `dangerouslySetInnerHTML`, supaya React otomatis meng-escape HTML/JS berbahaya.
- Tidak menyimpan kredensial apapun di kode (tidak butuh API key untuk gviz).
- Jika nanti ditambah autentikasi (lihat PRD Bagian 10 #4), autentikasi dilakukan di layer terpisah,
  tidak mempengaruhi arsitektur data-fetching di atas.

---

## 12. Performa

- `useMemo`/`useCallback` di titik kalkulasi berat (agregasi per branch, sorting, filtering ribuan
  baris).
- Render tabel besar dengan virtualisasi jika jumlah baris > ~500 (perlu dikonfirmasi skala data
  sebenarnya — lihat PRD Bagian 10 #6).
- Hindari re-fetch data dari Google Sheets pada setiap perubahan filter — fetch sekali per
  sesi/refresh, filter dilakukan di client dari data yang sudah di-cache di memory.
