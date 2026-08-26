---
inclusion: always
---

# To-Do List Life Dashboard — Project Context

## Tentang Project
Dashboard produktivitas pribadi berbasis web statis. Dibuat oleh Ilham Dian Almahri sebagai tugas CodingCamp.

## Stack
- HTML5 (semantic)
- CSS3 (CSS Variables, Flexbox, Grid, Media Queries)
- Vanilla JavaScript (ES6+, no framework)
- Browser LocalStorage API

## Struktur File
```
CodingCamp-24August26-DianAlmahri/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── .kiro/
```

## Aturan Penting
- Jangan gunakan framework (React, Vue, Angular, Bootstrap)
- Jangan tambah file CSS atau JS baru — hanya boleh ada 1 file masing-masing
- Jangan gunakan backend atau database
- Semua data disimpan di LocalStorage

## LocalStorage Keys
- `lifeDashboardTasks` — array task to-do
- `lifeDashboardName` — nama pengguna
- `lifeDashboardTheme` — tema aktif (`light` / `dark`)
- `lifeDashboardLinks` — array quick links

## Fitur Utama
- Greeting + jam real-time + tanggal (Indonesia)
- Focus Timer 25 menit (Pomodoro) dengan Start / Stop / Reset
- To-Do List: tambah, edit, hapus, selesaikan, filter
- Quick Links: tambah dan hapus link favorit
- Light / Dark Mode toggle
- Custom nama pengguna
- Pencegahan task duplikat (case-insensitive)

## Konvensi Kode
- `'use strict'` di awal script.js
- Fungsi dikelompokkan berdasarkan tanggung jawab
- Nama variabel dan fungsi deskriptif dalam bahasa Inggris
- Tidak ada komentar berlebihan dalam kode
- Gunakan `escapeHtml()` saat menyisipkan data pengguna ke innerHTML
- Gunakan `lsGet()` dan `lsSet()` untuk semua operasi LocalStorage
- Gunakan `showToast()` untuk feedback, bukan `alert()`

## Target Browser
Chrome, Firefox, Edge, Safari (modern)

## Responsive Breakpoints
- Desktop: > 900px
- Tablet: ≤ 900px
- Mobile: ≤ 600px
- Small mobile: ≤ 380px
