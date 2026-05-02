import { getAllLessons } from '@/lib/db-lessons'
import LessonsClient from '@/components/lessons/LessonsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props { searchParams: { id?: string; source?: string; tag?: string } }

export default async function LessonsPage({ searchParams }: Props) {
  const lessons = await getAllLessons()

  return (
    <div className='max-w-5xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Lesson &amp; Learn</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Knowledge base dari YouTube, buku, podcast, dan literatur trader lain — agar bisa kamu baca kembali kapan saja
        </p>
      </div>
      <LessonsClient
        initialLessons={lessons}
        focusId={searchParams.id}
        focusSource={searchParams.source}
        focusTag={searchParams.tag}
      />
    </div>
  )
}
