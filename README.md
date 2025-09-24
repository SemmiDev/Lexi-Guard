# 🚀 Getting Started

## ⚙️ Environment Variables

Buat file `.env.local` di root project dengan isi berikut:

```env
# ========== NextAuth ==========
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# ========== Google OAuth ==========
# URL redirect setelah login menggunakan Google
GOOGLE_LOGIN_REDIRECT=http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ========== MongoDB Connection ==========
MONGODB_URI=

# ========== Google Gemini API ==========
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

> 💡 **Tips**
>
> * `NEXTAUTH_SECRET` bisa dibuat dengan menjalankan perintah:
>
>   ```bash
>   openssl rand -base64 32
>   ```
> * Pastikan variabel `MONGODB_URI` sudah benar sesuai akun MongoDB kamu.
> * Untuk `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET`, dapatkan dari [Google Cloud Console](https://console.cloud.google.com/).
> * API Key Gemini bisa didapat dari [Google AI Studio](https://aistudio.google.com/).

---

## ▶️ Menjalankan Project

Jalankan development server:

```bash
# dengan npm
npm run dev

# dengan yarn
yarn dev

# dengan pnpm
pnpm dev

# dengan bun
bun dev
```

Lalu buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📂 Struktur Project (opsional untuk dev baru)

```bash
.
├── app/                # Next.js App Router
├── components/         # Reusable UI Components
├── lib/                # Helpers, utils, dan konfigurasi
├── public/             # Static assets
└── .env.local          # Environment variables
```
