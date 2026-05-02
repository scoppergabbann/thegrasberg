'use client'
import { useEffect, useRef } from 'react'
import { X, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { MONTHS } from '@/lib/constants'
import TradesPanel from './TradesPanel'
import type { MonthData } from '@/types'

interface Props { year: number; month: number; day: number; monthData: MonthData; onClose: () => void }

export default function DayModal({ year, month, day, monthData, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dow = new Date(year, month, day).getDay()
  const dateStr = `${'Min Sen Sel Rab Kam Jum Sab'.split(' ')[dow]}, ${day} ${MONTHS[month]} ${year}`

  const hasNote  = !!monthData.notes[key]
  const hasPsych = !!monthData.psychResults[key]

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && ref.current) {
        const els = Array.from(ref.current.querySelectorAll<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        ))
        const [first, last] = [els[0], els[els.length - 1]]
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();(e.shiftKey ? last : first).focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:p-4 sm:pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='modal-title'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} className='w-full sm:max-w-xl bg-[#111] border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col'>
        <div className='flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800 shrink-0'>
          <h2 id='modal-title' className='mono text-sm font-semibold truncate'>{dateStr}</h2>
          <button
            ref={closeRef} onClick={onClose}
            className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400 shrink-0 ml-2'
            aria-label='Tutup dialog'
          >
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        {/* Quick links to Journal/Psych jika ada di hari ini */}
        {(hasNote || hasPsych) && (
          <div className='px-4 sm:px-5 py-3 border-b border-zinc-800 shrink-0 flex flex-wrap gap-2'>
            {hasNote && (
              <Link
                href={`/journal?date=${key}`}
                className='inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-amber-950 text-amber-400 border border-amber-900 hover:bg-amber-900 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500'
              >
                <span className='w-1.5 h-1.5 rounded-full bg-amber-400' aria-hidden='true' />
                Lihat Journal
                <ExternalLink className='w-3 h-3' aria-hidden='true' />
              </Link>
            )}
            {hasPsych && (
              <Link
                href={`/psych-history?date=${key}`}
                className='inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-blue-950 text-blue-400 border border-blue-900 hover:bg-blue-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500'
              >
                <span className='w-1.5 h-1.5 rounded-full bg-blue-400' aria-hidden='true' />
                Lihat Psych Test
                <ExternalLink className='w-3 h-3' aria-hidden='true' />
              </Link>
            )}
          </div>
        )}

        <div className='overflow-y-auto flex-1'>
          <TradesPanel year={year} month={month} day={day} dateKey={key} existingTrades={monthData.trades[key] || []} />
        </div>
      </div>
    </div>
  )
}
