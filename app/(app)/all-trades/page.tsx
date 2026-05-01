import { getAllTrades } from '@/lib/db'
import AllTradesClient from '@/components/all-trades/AllTradesClient'

// Always fetch fresh — no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AllTradesPage() {
  const trades = await getAllTrades()
  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>All Trades</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Riwayat trade dari Supabase · {trades.length} trades
        </p>
      </div>
      <AllTradesClient initialTrades={trades} />
    </div>
  )
}
