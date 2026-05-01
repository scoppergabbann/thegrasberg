'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS } from '@/lib/constants'
import CalendarGrid from './CalendarGrid'
import DayModal    from './DayModal'
import type { MonthData, NewsEvent } from '@/types'

interface Props {
  year: number
  month: number
  monthData: MonthData
  newsByDate: Record<string, NewsEvent[]>
}

export default function CalendarShell({ year, month, monthData, newsByDate }: Props) {
  const router = useRouter()
  const [selDay, setSelDay] = useState<number | null>(null)

  function navigate(dir: number) {
    let m = month + dir
    let y = year
    if (m > 11) { m = 0;  y++ }
    if (m < 0)  { m = 11; y-- }
    setSelDay(null)
    router.push(`/?year=${y}&month=${m}`)
  }

  return (
    <>
      <div className='flex items-center justify-center gap-4' role='navigation' aria-label='Navigasi bulan'>
        <button onClick={() => navigate(-1)}
          className='w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400'
          aria-label='Bulan sebelumnya'>
          <ChevronLeft className='w-4 h-4' aria-hidden='true' />
        </button>
        <h2 className='mono text-base font-semibold text-zinc-100 min-w-[160px] text-center' aria-live='polite'>
          {MONTHS[month]} {year}
        </h2>
        <button onClick={() => navigate(1)}
          className='w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400'
          aria-label='Bulan berikutnya'>
          <ChevronRight className='w-4 h-4' aria-hidden='true' />
        </button>
      </div>

      <div className='card p-3 sm:p-4'>
        <CalendarGrid
          year={year} month={month}
          monthData={monthData}
          newsByDate={newsByDate}
          selectedDay={selDay}
          onSelectDay={setSelDay}
        />
      </div>

      <div className='flex flex-wrap gap-3 sm:gap-4 px-1 text-xs text-zinc-500' role='note'>
        {[
          ['bg-green-500/50','Profit'],
          ['bg-red-500/50',  'Loss'],
          ['bg-amber-400',   'Journal'],
          ['bg-blue-400',    'Psych test'],
          ['bg-red-500',     'High news'],
          ['bg-amber-500',   'Med news'],
        ].map(([c, l]) => (
          <span key={l} className='flex items-center gap-1.5'>
            <span className={`w-2 h-2 rounded-full ${c} inline-block`} aria-hidden='true' />
            {l}
          </span>
        ))}
      </div>

      {selDay && (
        <DayModal year={year} month={month} day={selDay} monthData={monthData} onClose={() => setSelDay(null)} />
      )}
    </>
  )
}
