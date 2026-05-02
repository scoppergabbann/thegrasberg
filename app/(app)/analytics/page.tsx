import { getAllTrades, getAllNotes, getAllPsych } from '@/lib/db'
import AnalyticsClient from '@/components/analytics/AnalyticsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnalyticsPage({ searchParams }: { searchParams: { range?: string; tab?: string } }) {
  const [trades, notes, psych] = await Promise.all([
    getAllTrades(), getAllNotes(), getAllPsych(),
  ])
  return (
    <div className='max-w-6xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Analytics</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Trading performance, psikologi, risk management, dan behavior tracking
        </p>
      </div>
      <AnalyticsClient
        trades={trades} notes={notes} psych={psych}
        initialRange={searchParams.range ?? 'all'}
        initialTab={searchParams.tab ?? 'overview'}
      />
    </div>
  )
}
