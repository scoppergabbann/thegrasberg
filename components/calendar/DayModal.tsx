
'use client'
import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { MONTHS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import TradesPanel  from './TradesPanel'
import NewsPanel    from '../news/NewsPanel'
import JournalPanel from '../journal/JournalPanel'
import PsychTest    from '../psych/PsychTest'
import type { MonthData } from '@/types'

type Tab = 'trades'|'news'|'journal'|'psych'
const TABS: {id:Tab;label:string}[] = [
  {id:'trades',  label:'Trades'},
  {id:'news',    label:'News'},
  {id:'journal', label:'Journal'},
  {id:'psych',   label:'Psych Test'},
]

interface Props { year:number; month:number; day:number; monthData:MonthData; onClose:()=>void }

export default function DayModal({ year, month, day, monthData, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('trades')
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const dow = new Date(year,month,day).getDay()
  const dateStr = `${'Minggu Senin Selasa Rabu Kamis Jumat Sabtu'.split(' ')[dow]}, ${day} ${MONTHS[month]} ${year}`

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && ref.current) {
        const els = Array.from(ref.current.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'))
        const [first, last] = [els[0], els[els.length-1]]
        if (e.shiftKey ? document.activeElement===first : document.activeElement===last) {
          e.preventDefault();(e.shiftKey ? last : first).focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='modal-title'
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div ref={ref} className='w-full max-w-xl bg-[#111] border border-zinc-700 rounded-2xl shadow-2xl'>
        <div className='flex items-center justify-between px-5 py-4 border-b border-zinc-800'>
          <h2 id='modal-title' className='mono text-sm font-semibold'>{dateStr}</h2>
          <button ref={closeRef} onClick={onClose}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400'
            aria-label='Tutup dialog'>
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>
        <div className='flex border-b border-zinc-800' role='tablist' aria-label='Panel hari ini'>
          {TABS.map(t => (
            <button key={t.id} role='tab' id={`tab-${t.id}`}
              aria-selected={tab===t.id} aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn('flex-1 py-2.5 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green-500',
                tab===t.id ? 'text-green-400 border-b-2 border-green-500' : 'text-zinc-500 hover:text-zinc-300')}>
              {t.label}
            </button>
          ))}
        </div>
        <div className='max-h-[72vh] overflow-y-auto'>
          {tab==='trades'  && <TradesPanel  year={year} month={month} day={day} dateKey={key} existingTrades={monthData.trades[key]||[]} />}
          {tab==='news'    && <NewsPanel    year={year} month={month} day={day} />}
          {tab==='journal' && <JournalPanel year={year} month={month} day={day} existing={monthData.notes[key]||null} />}
          {tab==='psych'   && <PsychTest    year={year} month={month} day={day} existing={monthData.psychResults[key]||null} />}
        </div>
      </div>
    </div>
  )
}
