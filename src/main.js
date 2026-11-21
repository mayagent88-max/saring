import { initializeApp } from "firebase/app";
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
  InferenceMode,
} from "firebase/ai";
import { firebaseConfig } from "./firebase-config.js";

// Dev only: App Check debug token ("saring-local-dev", dibuat 20 Nov 2026).
// Token dibaca dari file .env lokal (VITE_APPCHECK_DEBUG_TOKEN) —
// JANGAN commit token ke repo; .env sudah masuk .gitignore.
// (Firebase AI Logic mewajibkan App Check; debug token diterima untuk
// submission hackathon.)
if (import.meta.env.VITE_APPCHECK_DEBUG_TOKEN) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;
}

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });

// PREFER_ON_DEVICE: Gemini Nano di perangkat kalau tersedia, kalau tidak
// otomatis fallback ke cloud (default: gemini-3.5-flash-lite, SDK v13).
// On-device hanya single-turn text generation — pas untuk Saring yang
// sekali-tembak per cek, bukan chatbot.
const quickModel = getGenerativeModel(ai, {
  mode: InferenceMode.PREFER_ON_DEVICE,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        level: { type: "string", enum: ["aman", "waspada", "bahaya"] },
        reason: { type: "string" },
        safeAction: { type: "string" },
      },
      required: ["level", "reason", "safeAction"],
    },
  },
});

// Analisis dalam: selalu cloud, laporan panjang. Dipakai hanya kalau user
// menekan tombolnya (input dikirim ke cloud — tampilkan itu di UI).
const deepModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
  model: "gemini-3-flash-preview",
});

const SYSTEM = `Kamu pemeriksa keamanan link/pesan. Nilai SATU input (URL atau teks)
dan jawab HANYA dengan JSON: level (aman/waspada/bahaya), reason (1-2 kalimat,
bahasa Indonesia), safeAction (satu langkah aman konkret). Tanda bahaya:
janji hadiah/uang gratis, desakan waktu, minta seed/private key, domain
meniru brand terkenal, shortlink tanpa konteks, minta connect wallet +
approve tanpa jelas. Kalau ragu antara dua level, pilih yang lebih tinggi.`;

export async function quickCheck(input) {
  const result = await quickModel.generateContent(
    `${SYSTEM}\n\nInput untuk diperiksa:\n${input}`,
  );
  const verdict = JSON.parse(result.response.text());
  // inferenceSource: "ON_DEVICE" atau "IN_CLOUD" (SDK v12.5.0+).
  return { ...verdict, source: result.response.inferenceSource ?? "unknown" };
}

export async function deepCheck(input) {
  const result = await deepModel.generateContent(
    `Buat laporan analisis penipuan berbahasa Indonesia untuk input ini.
Struktur: 1) Vonis + skor keyakinan, 2) Pola penipuan yang cocok (sebutkan
namanya kalau ada: phishing, fake airdrop, drainer, dsb), 3) Bukti dari teks/
URL-nya, 4) Langkah aman. Jangan beri instruksi yang membantu penipuan.\n\nInput:\n${input}`,
  );
  return { report: result.response.text(), source: "IN_CLOUD" };
}
