import { getActivePsychQuestions, getAllPsych } from '@/lib/db'
import PsychTestClient from '@/components/psych/PsychTestClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PsychTestPage() {
  const [questions, history] = await Promise.all([
    getActivePsychQuestions(),
    getAllPsych(),
  ])

  // Today's existing result if any
  const today = new Date().toISOString().slice(0, 10)
  const todayResult = history.find(r => r.result_date === today) ?? null

  return (
    <div className='max-w-3xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Psychology Test</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Cek kesiapan mental sebelum trading. Jawab jujur untuk hasil akurat.
        </p>
      </div>
      <PsychTestClient questions={questions} todayResult={todayResult} />
    </div>
  )
}
