# Remove News Feature — Setup Guide

## Files yang akan diREPLACE (6 file)

```
✏ types/index.ts                                ← Remove NewsImpact, NewsEvent
✏ lib/constants.ts                              ← Remove NEWS_DB & NEWS_TIPS
✏ app/(app)/page.tsx                            ← Remove fetchMonthEvents call
✏ components/calendar/CalendarShell.tsx         ← Remove newsByDate prop
✏ components/calendar/CalendarGrid.tsx          ← Remove news impact dot
✏ components/calendar/DayModal.tsx              ← Remove News tab (only Trades now)
```

## Files yang harus DIHAPUS dari project kamu

Setelah replace 6 file di atas, hapus file-file berikut karena sudah tidak dipakai lagi:

```bash
# Di terminal, dari root project:
rm lib/news-api.ts
rm components/news/NewsPanel.tsx
rmdir components/news 2>/dev/null  # hapus folder kalau kosong
```

Atau di Windows Explorer / VS Code:
- Hapus file `lib/news-api.ts`
- Hapus seluruh folder `components/news/`

## .env.local — Boleh hapus FINNHUB_API_KEY

Boleh hapus baris `FINNHUB_API_KEY=...` dari `.env.local`. App tetap jalan tanpa itu.
Kalau di-deploy ke Vercel: hapus juga env var `FINNHUB_API_KEY` di Settings → Environment Variables.

## Test

```bash
rm -rf .next
npm run dev
```

Buka http://localhost:3000 — kalender masih jalan, tapi:
- ❌ Tidak ada lagi dot merah/amber untuk news
- ❌ Tidak ada lagi tab "News" di modal hari
- ❌ Tidak ada lagi panel news dengan badge "Live"
- ✅ Tab modal cuma "Trades" (langsung tampil tanpa tab switcher)
- ✅ Legend di kalender cuma 4 item: Profit / Loss / Journal / Psych test

## Yang tidak terpengaruh

- Calendar dengan PNL harian: tetap jalan
- Trades, Journal, Psych Test, Analytics, All Trades, Calculator, Lessons: tetap jalan
- Authentication: tetap jalan
