import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import { TrendingUp } from 'lucide-react'

export const metadata = { title: 'Login — FX Journal' }

interface Props { searchParams: { next?: string } }

export default function LoginPage({ searchParams }: Props) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4'>
      <div className='w-full max-w-sm'>
        <div className='flex items-center justify-center mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-green-950 border border-green-800 flex items-center justify-center' aria-hidden='true'>
              <TrendingUp className='w-5 h-5 text-green-400' />
            </div>
            <div>
              <p className='mono text-base font-semibold text-green-400 leading-none'>FX Journal</p>
              <p className='text-xs text-zinc-600 mt-0.5'>Forex Trading Tracker</p>
            </div>
          </div>
        </div>

        <div className='card p-5 sm:p-6'>
          <h1 className='text-base font-semibold text-zinc-100 mb-1'>Sign In</h1>
          <p className='text-xs text-zinc-500 mb-5'>Masuk untuk akses jurnal trading kamu</p>

          <Suspense>
            <LoginForm next={searchParams.next ?? '/'} />
          </Suspense>
        </div>

        <p className='text-center text-xs text-zinc-600 mt-6'>
          Data tersimpan di Supabase · Session aktif 7 hari
        </p>
      </div>
    </div>
  )
}
