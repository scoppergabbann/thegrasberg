import { getAllNotes, getAllTrades } from '@/lib/db'
import JournalClient from '@/components/journal/JournalClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JournalPage({ searchParams }: { searchParams: { date?: string } }) {
  const [notes, trades] = await Promise.all([getAllNotes(), getAllTrades()])

  const tradeByDate: Record<string, { pnl: number; count: number }> = {}
  trades.forEach(t => {
    if (!tradeByDate[t.trade_date]) tradeByDate[t.trade_date] = { pnl: 0, count: 0 }
    tradeByDate[t.trade_date].pnl   += Number(t.pnl)
    tradeByDate[t.trade_date].count += 1
  })

  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Daily Journal</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Catatan harian terpisah dari trade. Tulis analisa, eksekusi, dan pelajaran setiap hari.
        </p>
      </div>
      <JournalClient
        initialNotes={notes}
        tradeByDate={tradeByDate}
        focusDate={searchParams.date}
      />
    </div>
  )
}
