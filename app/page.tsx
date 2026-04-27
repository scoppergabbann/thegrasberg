import { getMonthTrades, getMonthNotes, getMonthPsych } from '@/lib/db'
import CalendarShell from '@/components/calendar/CalendarShell'
import type { MonthData } from '@/types'

interface Props {
  searchParams: { year?: string; month?: string }
}

export default async function CalendarPage({ searchParams }: Props) {
  const now   = new Date()
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()))
  const month = parseInt(searchParams.month ?? String(now.getMonth()))

  const [trades, notes, psych] = await Promise.all([
    getMonthTrades(year, month),
    getMonthNotes(year, month),
    getMonthPsych(year, month),
  ])

  const tradeMap: MonthData['trades'] = {}
  trades.forEach(t => {
    if (!tradeMap[t.trade_date]) tradeMap[t.trade_date] = []
    tradeMap[t.trade_date].push(t)
  })
  const noteMap: MonthData['notes'] = {}
  notes.forEach(n => { noteMap[n.note_date] = n })
  const psychMap: MonthData['psychResults'] = {}
  psych.forEach(p => { psychMap[p.result_date] = p })

  const monthData: MonthData = { trades: tradeMap, notes: noteMap, psychResults: psychMap }

  const totalPnl = trades.reduce((a, t) => a + Number(t.pnl), 0)
  const wins     = trades.filter(t => Number(t.pnl) > 0).length
  const winRate  = trades.length ? Math.round(wins / trades.length * 100) : 0

  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Trading Calendar</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>Klik tanggal untuk tambah trade, lihat news, atau tulis journal</p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3' role='region' aria-label='Statistik bulan ini'>
        {[
          { label:'Month PNL',    value: (totalPnl >= 0 ? '+' : '') + '$' + Math.abs(totalPnl).toFixed(2), cls: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
          { label:'Total Trades', value: String(trades.length),  cls: 'text-zinc-200' },
          { label:'Win Rate',     value: `${winRate}%`,          cls: winRate >= 50 ? 'text-green-400' : 'text-red-400' },
          { label:'Journal Days', value: String(notes.length),   cls: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className='stat-card'>
            <p className={`mono text-base sm:text-lg font-semibold ${s.cls}`}>{s.value}</p>
            <p className='text-xs text-zinc-500 mt-0.5'>{s.label}</p>
          </div>
        ))}
      </div>

      <CalendarShell year={year} month={month} monthData={monthData} />
    </div>
  )
}
