'use client'

import { useUIControls } from '@/components/ui/UIControls'
import Sidebar from './Sidebar'
import Header  from './Header'
import type { GlobalStats } from '@/types'
import type { ReactNode } from 'react'

interface Props {
  stats:    GlobalStats
  children: ReactNode
}

export default function AppShell({ stats, children }: Props) {
  const { fz, zoomIn, zoomOut, reset, sidebarOpen, setSidebar, mobileOpen, setMobileOpen } = useUIControls()

  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar
        open={sidebarOpen}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className='flex flex-col flex-1 overflow-hidden min-w-0'>
        <Header
          stats={stats}
          fz={fz} zoomIn={zoomIn} zoomOut={zoomOut} reset={reset}
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebar(!sidebarOpen)}
          toggleMobile={() => setMobileOpen(true)}
        />
        <main id='main-content' className='flex-1 overflow-y-auto p-3 sm:p-6' tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
