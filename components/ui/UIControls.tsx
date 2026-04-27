'use client'

import { useEffect, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_FZ      = 'fxj_font_zoom'
const STORAGE_SIDEBAR = 'fxj_sidebar_open'

export function useUIControls() {
  const [fz, setFz]                = useState(1)        // font zoom multiplier
  const [sidebarOpen, setSidebar]  = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  /* Restore from localStorage on mount */
  useEffect(() => {
    const savedFz   = parseFloat(localStorage.getItem(STORAGE_FZ) || '1')
    const savedSide = localStorage.getItem(STORAGE_SIDEBAR)
    if (!isNaN(savedFz)) setFz(savedFz)
    if (savedSide !== null) setSidebar(savedSide === '1')
  }, [])

  /* Apply font zoom CSS variable */
  useEffect(() => {
    document.documentElement.style.setProperty('--fz', String(fz))
    localStorage.setItem(STORAGE_FZ, String(fz))
  }, [fz])

  useEffect(() => {
    localStorage.setItem(STORAGE_SIDEBAR, sidebarOpen ? '1' : '0')
  }, [sidebarOpen])

  /* Auto-close mobile sidebar on route change */
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener('hashchange', close)
    return () => window.removeEventListener('hashchange', close)
  }, [])

  const zoomIn  = useCallback(() => setFz(v => Math.min(1.5,  +(v + 0.1).toFixed(2))), [])
  const zoomOut = useCallback(() => setFz(v => Math.max(0.85, +(v - 0.1).toFixed(2))), [])
  const reset   = useCallback(() => setFz(1), [])

  return { fz, zoomIn, zoomOut, reset, sidebarOpen, setSidebar, mobileOpen, setMobileOpen }
}

interface ToolbarProps {
  fz: number
  zoomIn:  () => void
  zoomOut: () => void
  reset:   () => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  toggleMobile:  () => void
}

export function Toolbar({ fz, zoomIn, zoomOut, reset, sidebarOpen, toggleSidebar, toggleMobile }: ToolbarProps) {
  return (
    <div className='flex items-center gap-1 shrink-0' role='toolbar' aria-label='View controls'>
      {/* Mobile: hamburger to open sidebar */}
      <button
        onClick={toggleMobile}
        className='icon-btn lg:hidden'
        aria-label='Buka menu navigasi'
      >
        <Menu className='w-4 h-4' aria-hidden='true' />
      </button>

      {/* Desktop: collapse/expand sidebar */}
      <button
        onClick={toggleSidebar}
        className='icon-btn hidden lg:flex'
        aria-label={sidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
        aria-pressed={!sidebarOpen}
      >
        {sidebarOpen ? <PanelLeftClose className='w-4 h-4' aria-hidden='true' /> : <PanelLeft className='w-4 h-4' aria-hidden='true' />}
      </button>

      <div className='w-px h-5 bg-zinc-800 mx-1' aria-hidden='true' />

      {/* Zoom group */}
      <button onClick={zoomOut} disabled={fz <= 0.85}
        className='icon-btn disabled:opacity-30 disabled:cursor-not-allowed'
        aria-label='Perkecil ukuran font'>
        <ZoomOut className='w-4 h-4' aria-hidden='true' />
      </button>

      <button onClick={reset}
        className='icon-btn min-w-[48px] text-xs font-mono font-semibold'
        aria-label={`Reset zoom — saat ini ${Math.round(fz * 100)}%`}
        title='Reset to 100%'>
        {Math.round(fz * 100)}%
      </button>

      <button onClick={zoomIn} disabled={fz >= 1.5}
        className='icon-btn disabled:opacity-30 disabled:cursor-not-allowed'
        aria-label='Perbesar ukuran font'>
        <ZoomIn className='w-4 h-4' aria-hidden='true' />
      </button>
    </div>
  )
}
