# ⚔ Final Fantasy Chess v2

Browser-based chess game dengan tema Final Fantasy — dimainkan langsung di browser, tanpa install apapun.

🎮 **Play online:** https://aliv255.github.io/Repo_1/

---

## Fitur

- **2 tema bidak:**
  - ⚔️ FF7 vs FF8 — foto karakter asli (Cloud, Tifa, Squall, Rinoa, dll)
  - 🐉 Monster Theme — SVG custom (Bahamut, Shiva, Ifrit, Chocobo, Moogle, dll)
- **Chess engine lengkap:** semua aturan gerak, castling, en passant, pawn promotion
- **Check & Checkmate detection** dengan visual pulse merah
- **Animasi:** capture flash, piece appear, check pulse, game over overlay
- **Captured pieces bar** — tampilkan bidak yang sudah ditangkap
- **Move log** dengan algebraic notation (e4, Nf3+, Qxd5#)
- **Undo** langkah terakhir
- **Papan artistik** dengan dekorasi pohon pinus & frame kayu

## File Structure

```
Repo_1/
├── index.html        — struktur HTML utama
├── css/style.css     — semua styling & animasi
├── js/
│   ├── pieces.js     — SVG renderers, foto FF, THEMES config
│   └── game.js       — chess engine & UI logic
└── imgs/             — foto karakter FF7 & FF8 (personal use)
```

## Tech Stack

- Pure HTML + CSS + JavaScript (zero dependencies)
- Deployed via GitHub Pages

---

*Dibuat untuk belajar Claude Code & Linear integration.*
