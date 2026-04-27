
'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS } from '@/lib/constants'
import CalendarGrid from './CalendarGrid'
import DayModal    from './DayModal'
import type { MonthData } from '@/types'

interface Props { year: number; month: number; monthData: MonthData }

export default function CalendarShell({ year, month, monthData }: Props) {
  const [selectedDay, setSelectedDay] = useState<number|null>(null)
  const label = `${MONTHS[month]} ${year}`

  return (
    <>
      {/* Month nav — note: changing month requires a new server fetch; use router.push */}
      <div className='flex items-center justify-center gap-4' role='navigation' aria-label='Bulan kalender'>
        <button className='w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-zinc-400' aria-label='Bulan sebelumnya' disabled>
          <ChevronLeft className='w-4 h-4' aria-hidden='true' />
        </button>
        <h2 className='mono text-base font-semibold text-zinc-100 min-w-[160px] text-center'>{label}</h2>
        <button className='w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all focus-visible:outline-2 focus-visible:outline-zinc-400' aria-label='Bulan berikutnya' disabled>
          <ChevronRight className='w-4 h-4' aria-hidden='true' />
        </button>
      </div>

      <div className='card p-4'>
        <CalendarGrid year={year} month={month} monthData={monthData} selectedDay={selectedDay} onSelectDay={setSelectedDay} />
      </div>

      <div className='flex flex-wrap gap-4 px-1 text-xs text-zinc-500' role='note' aria-label='Keterangan kalender'>
        {[
          ['bg-green-500/50','Profit hari'],['bg-red-500/50','Loss hari'],
          ['bg-amber-400','Journal'],['bg-blue-400','Psych test'],['bg-red-500','High impact news'],
        ].map(([c,l]) => (
          <span key={l} className='flex items-center gap-1.5'>
            <span className={`w-2 h-2 rounded-full ${c} inline-block`} aria-hidden='true' />
            {l}
          </span>
        ))}
      </div>

      {selectedDay && (
        <DayModal year={year} month={month} day={selectedDay} monthData={monthData} onClose={() => setSelectedDay(null)} />
      )}
    </>
  )
}
