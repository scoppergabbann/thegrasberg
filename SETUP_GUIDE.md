# Setup Supabase untuk FX Journal

## Step 1 — Buat Project Supabase
1. Pergi ke https://supabase.com → Sign Up gratis
2. Klik "New Project"
3. Isi nama project: "fx-journal"
4. Buat password database (simpan!)
5. Pilih region: Singapore (ap-southeast-1) — paling dekat
6. Klik "Create new project" → tunggu ~2 menit

## Step 2 — Buat Tables (jalankan di SQL Editor Supabase)
Pergi ke: Project → SQL Editor → New Query → paste SQL di bawah → Run

## Step 3 — Ambil credentials
Pergi ke: Project → Settings → API
Copy:
- Project URL  → masuk ke NEXT_PUBLIC_SUPABASE_URL
- anon public key → masuk ke NEXT_PUBLIC_SUPABASE_ANON_KEY

## Step 4 — Buat file .env.local di root project
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

## Step 5 — npm install && npm run dev
