'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, BookOpen, Brain, BarChart3, List, Calculator, TrendingUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href:'/',              icon:CalendarDays, label:'Calendar',      desc:'PNL harian' },
  { href:'/calculator',    icon:Calculator,   label:'Calculator',    desc:'Risk/Reward' },
  { href:'/journal',       icon:BookOpen,     label:'Daily Journal', desc:'Analisa & refleksi' },
  { href:'/psych-history', icon:Brain,        label:'Psych History', desc:'Riwayat psikotes' },
  { href:'/analytics',     icon:BarChart3,    label:'Analytics',     desc:'Statistik performa' },
  { href:'/all-trades',    icon:List,         label:'All Trades',    desc:'Semua trade' },
]

interface Props {
  open:        boolean
  mobileOpen:  boolean
  onMobileClose: () => void
}

export default function Sidebar({ open, mobileOpen, onMobileClose }: Props) {
  const path = usePathname()

  return (
    <>
      {mobileOpen && (
        <div className='fixed inset-0 z-40 bg-black/60 lg:hidden' onClick={onMobileClose} aria-hidden='true' />
      )}

      <aside
        id='primary-nav'
        className={cn(
          'bg-[#0d0d0d] border-r border-zinc-800 flex flex-col py-5 px-3 shrink-0 transition-all duration-200 ease-out',
          'fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          open ? 'lg:w-56' : 'lg:w-16',
        )}
        aria-label='Navigasi utama'
      >
        <div className='px-2 mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-2 min-w-0'>
            <div className='w-7 h-7 rounded-lg bg-green-950 border border-green-800 flex items-center justify-center shrink-0' aria-hidden='true'>
              <TrendingUp className='w-3.5 h-3.5 text-green-400' />
            </div>
            <div className={cn('min-w-0 transition-opacity', !open && 'lg:opacity-0 lg:invisible lg:w-0')}>
              <p className='mono text-sm font-semibold text-green-400 leading-none truncate'>FX Journal</p>
              <p className='text-xs text-zinc-600 mt-0.5'>v2 · Supabase</p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className='lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800'
            aria-label='Tutup menu'
          >
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <nav aria-label='Menu navigasi'>
          <ul className='space-y-1' role='list'>
            {NAV.map(({ href, icon:Icon, label, desc }) => {
              const active = path === href
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onMobileClose}
                    className={cn('nav-link w-full', active && 'active', !open && 'lg:justify-center lg:px-2')}
                    aria-current={active ? 'page' : undefined}
                    title={!open ? label : undefined}
                  >
                    <Icon className='w-4 h-4 shrink-0' aria-hidden='true' />
                    <div className={cn('min-w-0 transition-all', !open && 'lg:hidden')}>
                      <p className='text-sm font-medium leading-none'>{label}</p>
                      <p className='text-xs text-zinc-500 mt-0.5 truncate'>{desc}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={cn('mt-auto px-2 pt-4 border-t border-zinc-800 transition-all', !open && 'lg:hidden')}>
          <p className='text-xs text-zinc-600 leading-relaxed'>
            Data tersimpan di <span className='text-zinc-500'>Supabase</span>.
          </p>
        </div>
      </aside>
    </>
  )
}
