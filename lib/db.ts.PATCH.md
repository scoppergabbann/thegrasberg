# PATCH untuk lib/db.ts

Buka file `lib/db.ts` di project kamu.

## Cari function `getMonthTrades` dan `getAllTrades`
Pastikan select `*` (yang artinya semua field termasuk yang baru: setup_type, entry_price, sl_price, tp_price).
**Kalau sudah pakai `select('*')` tidak perlu diubah** — field baru otomatis ke-fetch.

## Cari function `addTrade`

```ts
export async function addTrade(trade: Omit<Trade, 'id' | 'created_at'>): Promise<Trade> {
  const { data, error } = await supabase
    .from('trades').insert(trade).select().single()
  if (error) throw error
  return { ...data, pnl: Number(data.pnl) } as Trade
}
```

**Kalau persis seperti di atas, sudah OK.** Karena `insert(trade)` akan langsung mengirim semua field termasuk yang baru.

## Tidak ada perubahan kode yang diperlukan di db.ts ✓

Asal pakai `select('*')` dan `insert(trade)`, semua field baru auto-handle oleh Supabase.
