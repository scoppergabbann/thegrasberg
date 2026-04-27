
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, BookOpen, Brain, BarChart3, List, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href:'/',              icon:CalendarDays, label:'Calendar',      desc:'PNL harian' },
  { href:'/journal',       icon:BookOpen,     label:'Daily Journal', desc:'Analisa & refleksi' },
  { href:'/psych-history', icon:Brain,        label:'Psych History', desc:'Riwayat psikotes' },
  { href:'/analytics',     icon:BarChart3,    label:'Analytics',     desc:'Statistik performa' },
  { href:'/all-trades',    icon:List,         label:'All Trades',    desc:'Semua trade' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className='w-56 shrink-0 bg-[#0d0d0d] border-r border-zinc-800 flex flex-col py-5 px-3' aria-label='Navigasi utama'>
      <div className='px-2 mb-6'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 rounded-lg bg-green-950 border border-green-800 flex items-center justify-center' aria-hidden='true'>
            <TrendingUp className='w-3.5 h-3.5 text-green-400' />
          </div>
          <div>
            <p className='mono text-sm font-semibold text-green-400 leading-none'>FX Journal</p>
            <p className='text-[10px] text-zinc-600 mt-0.5'>v2 · Supabase</p>
          </div>
        </div>
      </div>
      <nav aria-label='Menu navigasi'>
        <ul className='space-y-1' role='list'>
          {NAV.map(({ href, icon:Icon, label, desc }) => {
            const active = path === href
            return (
              <li key={href}>
                <Link href={href} className={cn('nav-link w-full', active && 'active')} aria-current={active ? 'page' : undefined}>
                  <Icon className='w-4 h-4 shrink-0' aria-hidden='true' />
                  <div className='min-w-0'>
                    <p className='text-[13px] font-medium leading-none'>{label}</p>
                    <p className='text-[10px] text-zinc-500 mt-0.5 truncate'>{desc}</p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className='mt-auto px-2 pt-4 border-t border-zinc-800'>
        <p className='text-[10px] text-zinc-600 leading-relaxed'>
          Data disimpan di <span className='text-zinc-500'>Supabase</span> — aman & persisten di semua device.
        </p>
      </div>
    </aside>
  )
}
