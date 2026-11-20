# Saring — #BuildHybridAI 2026

Cek link/pesan mencurigakan. Tempel URL/teks → vonis instan privat dari
Gemini Nano di perangkat (on-device), tombol "Analisis dalam" lari ke cloud
Gemini Flash untuk laporan panjang.

- Platform: Web (Chrome)
- Stack: Firebase AI Logic (JS SDK v13), `InferenceMode.PREFER_ON_DEVICE`
  (fallback cloud default `gemini-3.5-flash-lite`), App Check (debug token
  saat dev — diterima untuk submission).
- Deadline submit: **1 Des 2026 05:00 WIB** (30 Nov 14:00 PT). Target
  internal: submit 30 Nov siang WIB.
- Hadiah total $30.000 (juara 1 $10.000, $3.000 best app per platform).

## Status (20 Nov 2026, disiapkan Tia)

- [x] Ide + spek di `~/workspace/tia/projects/buildhybridai-2026.md`
- [x] Skeleton app ini (UI + routing hybrid + output JSON terstruktur)
- [ ] Firebase project + AI Logic + Gemini Developer API (langkah 1, console)
- [ ] App Check debug token (langkah 1)
- [ ] Repo GitHub publik + push (langkah 2, token klasik `tia` sudah
      terverifikasi 19 Nov bisa bikin repo via API)
- [ ] `npm install` + smoke test on-device di Chromium lokal (v157, ≥139)
- [ ] Build 21–24 Nov, poles 25–27, video + submit 28–29 Nov

## 1. Firebase project (console, ~10 menit)

1. console.firebase.google.com → Add project (nama bebas, mis. `saring-ai`).
2. Build → AI Logic → Get started → pilih **Gemini Developer API**
   (gratis, tanpa billing).
3. App Check: aktifkan, daftarkan app Web, pakai **debug token** untuk dev.
   Debug token diterima untuk submission hackathon.
4. Project settings → Your apps → Web app → salin config ke
   `src/firebase-config.js`.
5. Aktifkan debug token di `src/main.js` (hapus komentar di baris
   `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true`) hanya saat dev lokal.

## 2. Repo publik + push

Repo: `mayagent88-max/saring` (publik). Buat via token klasik `tia`
(connector `custom.github`, helper
`~/workspace/custom-connectors/custom.github/bin/github-api.py` —
tokennya di vault, jangan tulis nilainya di mana pun), lalu:

```bash
cd ~/workspace/goals/buildhybridai-2026-hackathon/files/saring
git init -b main
git add . && git commit -m "Saring skeleton: hybrid on-device + cloud check"
git remote add origin https://github.com/mayagent88-max/saring.git
git push -u origin main
```

## 3. Jalankan lokal

```bash
npm install
npm run dev
```

Buka di Chrome desktop ≥139 (Chromium lokal v157 sudah cukup).
On-device pertama kali mengunduh model Gemini Nano — tunggu sampai siap;
kalau belum siap, SDK otomatis fallback ke cloud dan UI menandainya.

## Catatan desain (buat juri)

- On-device = single-turn text generation saja (bukan chat) — UI memang
  sekali-tembak per cek, sesuai batas Firebase AI Logic web.
- `inferenceSource` (`ON_DEVICE`/`IN_CLOUD`) ditampilkan di hasil, jadi
  juri melihat routing hybrid-nya bekerja.
- Analisis dalam (cloud) hanya jalan kalau user menekan tombolnya, dan UI
  bilang jelas bahwa teks dikirim ke cloud.
- Jangan kirim seed/private key/PII ke cloud — Saring memeriksa link/pesan,
  bukan kredensial.
