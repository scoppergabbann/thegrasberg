import { getAllPsychQuestions } from '@/lib/db'
import PsychQuestionsClient from '@/components/psych/PsychQuestionsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PsychQuestionsPage() {
  const questions = await getAllPsychQuestions()
  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Kelola Pertanyaan Psikotes</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Tambah, edit, atau nonaktifkan kriteria psikotes sesuai kebutuhanmu
        </p>
      </div>
      <PsychQuestionsClient initialQuestions={questions} />
    </div>
  )
}
