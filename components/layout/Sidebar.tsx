'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays, BookOpen, Brain, BarChart3, List,
  Calculator, TrendingUp, X, ClipboardList, Settings, LogOut, User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { actionLogout } from '@/lib/auth-actions'

const NAV = [
  { href:'/',                icon:CalendarDays,  label:'Calendar',         desc:'PNL & trade harian',         section:'Trading' },
  { href:'/calculator',      icon:Calculator,    label:'Calculator',       desc:'Risk/Reward',                section:'Trading' },
  { href:'/all-trades',      icon:List,          label:'All Trades',       desc:'Riwayat semua trade',        section:'Trading' },
  { href:'/psych-test',      icon:Brain,         label:'Psych Test',       desc:'Cek mental sebelum trading', section:'Mental' },
  { href:'/journal',         icon:BookOpen,      label:'Daily Journal',    desc:'Refleksi harian',            section:'Mental' },
  { href:'/psych-history',   icon:ClipboardList, label:'Psych History',    desc:'Riwayat hasil psikotes',     section:'History' },
  { href:'/analytics',       icon:BarChart3,     label:'Analytics',        desc:'Statistik performa',         section:'History' },
  { href:'/psych-questions', icon:Settings,      label:'Pertanyaan Psych', desc:'Kelola kriteria',            section:'Pengaturan' },
]

interface Props {
  username: string
  open: boolean
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ username, open, mobileOpen, onMobileClose }: Props) {
  const path = usePathname()

  const grouped: Record<string, typeof NAV> = {}
  NAV.forEach(item => {
    if (!grouped[item.section]) grouped[item.section] = []
    grouped[item.section].push(item)
  })

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
          open ? 'lg:w-60' : 'lg:w-16',
        )}
        aria-label='Navigasi utama'
      >
        <div className='px-2 mb-5 flex items-center justify-between'>
          <div className='flex items-center gap-2 min-w-0'>
            <div className='w-7 h-7 rounded-lg bg-green-950 border border-green-800 flex items-center justify-center shrink-0' aria-hidden='true'>
              <TrendingUp className='w-3.5 h-3.5 text-green-400' />
            </div>
            <div className={cn('min-w-0 transition-opacity', !open && 'lg:opacity-0 lg:invisible lg:w-0')}>
              <p className='mono text-sm font-semibold text-green-400 leading-none truncate'>FX Journal</p>
              <p className='text-xs text-zinc-600 mt-0.5'>v3 · Modular</p>
            </div>
          </div>

          <button onClick={onMobileClose}
            className='lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800'
            aria-label='Tutup menu'>
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <nav aria-label='Menu navigasi' className='flex-1 overflow-y-auto'>
          <div className='space-y-4'>
            {Object.entries(grouped).map(([section, items]) => (
              <div key={section}>
                <p className={cn('px-3 mb-1.5 text-xs font-semibold text-zinc-600 uppercase tracking-wider', !open && 'lg:hidden')}>
                  {section}
                </p>
                <ul className='space-y-0.5' role='list'>
                  {items.map(({ href, icon: Icon, label, desc }) => {
                    const active = path === href
                    return (
                      <li key={href}>
                        <Link href={href} onClick={onMobileClose}
                          className={cn('nav-link w-full', active && 'active', !open && 'lg:justify-center lg:px-2')}
                          aria-current={active ? 'page' : undefined}
                          title={!open ? label : undefined}>
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
              </div>
            ))}
          </div>
        </nav>

        {/* User section + Logout */}
        <div className='mt-auto pt-3 border-t border-zinc-800'>
          <div className={cn(
            'flex items-center gap-2 px-2 py-2 rounded-lg',
            !open && 'lg:justify-center lg:px-2'
          )}>
            <div className='w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0' aria-hidden='true'>
              <User className='w-3.5 h-3.5 text-zinc-400' />
            </div>
            <div className={cn('min-w-0 flex-1 transition-all', !open && 'lg:hidden')}>
              <p className='text-sm font-medium text-zinc-200 truncate'>{username}</p>
              <p className='text-xs text-zinc-600'>Signed in</p>
            </div>
          </div>
          <form action={actionLogout}>
            <button
              type='submit'
              className={cn(
                'mt-1 nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-950/40',
                !open && 'lg:justify-center lg:px-2'
              )}
              title={!open ? 'Logout' : undefined}
            >
              <LogOut className='w-4 h-4 shrink-0' aria-hidden='true' />
              <span className={cn('text-sm font-medium', !open && 'lg:hidden')}>Logout</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
