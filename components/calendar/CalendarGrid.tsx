
import { cn } from '@/lib/utils'
import { NEWS_DB } from '@/lib/constants'
import type { MonthData } from '@/types'

const DAYS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function newsImpact(key: string) {
  const ev = NEWS_DB[key] || []
  return ev.some(e=>e.impact==='high') ? 'high' : ev.some(e=>e.impact==='medium') ? 'medium' : ev.length ? 'low' : 'none'
}

interface Props { year:number; month:number; monthData:MonthData; selectedDay:number|null; onSelectDay:(d:number)=>void }

export default function CalendarGrid({ year, month, monthData, selectedDay, onSelectDay }: Props) {
  const firstDay = new Date(year,month,1).getDay()
  const dim      = new Date(year,month+1,0).getDate()
  const today    = new Date()
  const isNow    = today.getFullYear()===year && today.getMonth()===month

  return (
    <div role='grid' aria-label='Kalender trading'>
      <div className='grid grid-cols-7 gap-1 mb-1' role='row'>
        {DAYS.map(d => <div key={d} className='text-center py-1.5 text-[10px] font-semibold text-zinc-500 mono uppercase tracking-wider' role='columnheader'>{d}</div>)}
      </div>
      <div className='grid grid-cols-7 gap-1'>
        {Array.from({length:firstDay}).map((_,i) => <div key={`e${i}`} aria-hidden='true' />)}
        {Array.from({length:dim},(_,i)=>i+1).map(day => {
          const key    = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const trades = monthData.trades[key] || []
          const pnl    = trades.reduce((a,t)=>a+Number(t.pnl),0)
          const hasNote  = !!monthData.notes[key]
          const hasPsych = !!monthData.psychResults[key]
          const ni     = newsImpact(key)
          const dow    = new Date(year,month,day).getDay()
          const wknd   = dow===0||dow===6
          const isToday= isNow && today.getDate()===day
          const isSel  = selectedDay===day
          const hasT   = trades.length > 0

          return (
            <button key={day} role='gridcell'
              aria-label={`${day} ${MONTH_ID[month]} ${year}${hasT?`, PNL ${pnl>=0?'+':''}$${Math.abs(pnl).toFixed(2)}`:''}${hasNote?', ada journal':''}${ni!=='none'?`, news ${ni}`:''}`}
              aria-pressed={isSel} onClick={()=>onSelectDay(day)}
              className={cn(
                'relative min-h-[76px] rounded-lg border p-1.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-green-500 hover:border-zinc-600',
                wknd ? 'bg-[#0d0d0d] border-zinc-800/50' : 'bg-[#111] border-zinc-800',
                hasT && pnl>=0  && 'bg-green-950/40 border-green-900/60',
                hasT && pnl<0   && 'bg-red-950/40 border-red-900/60',
                hasNote && 'border-amber-700/50',
                isToday && 'ring-1 ring-zinc-500',
                isSel   && 'ring-2 ring-green-500',
              )}>
              <span className={cn('mono text-[11px] font-medium block', isToday?'text-white':'text-zinc-400')}>{day}</span>
              {hasT && (
                <>
                  <span className={cn('mono text-[10px] font-semibold block mt-1', pnl>=0?'text-green-400':'text-red-400')}>
                    {pnl>=0?'+':''}${Math.abs(pnl).toFixed(2)}
                  </span>
                  <span className='text-[9px] text-zinc-500 block'>{trades.length}T</span>
                </>
              )}
              <div className='absolute top-1.5 right-1.5 flex flex-col gap-0.5 items-end'>
                {hasNote  && <span className='w-1.5 h-1.5 rounded-full bg-amber-400' aria-hidden='true' />}
                {hasPsych && <span className='w-1.5 h-1.5 rounded-full bg-blue-400'  aria-hidden='true' />}
              </div>
              {ni!=='none' && (
                <span className={cn('absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full', ni==='high'?'bg-red-500':ni==='medium'?'bg-amber-500':'bg-zinc-500')} aria-hidden='true' />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
