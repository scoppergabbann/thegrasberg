'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { actionLogin, type LoginState } from '@/lib/auth-actions'

const initialState: LoginState = {}

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useFormState(actionLogin, initialState)
  const [showPwd, setShowPwd] = useState(false)

  return (
    <form action={formAction} className='space-y-4'>
      <input type='hidden' name='next' value={next} />

      <div>
        <label htmlFor='username' className='block text-xs text-zinc-500 font-medium mb-1.5'>
          Username
        </label>
        <input
          id='username' name='username' type='text' required autoFocus
          autoComplete='username'
          className='form-input'
          placeholder='admin'
        />
      </div>

      <div>
        <label htmlFor='password' className='block text-xs text-zinc-500 font-medium mb-1.5'>
          Password
        </label>
        <div className='relative'>
          <input
            id='password' name='password' required
            type={showPwd ? 'text' : 'password'}
            autoComplete='current-password'
            className='form-input pr-10'
            placeholder='••••••'
          />
          <button
            type='button'
            onClick={() => setShowPwd(s => !s)}
            className='absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-zinc-400'
            aria-label={showPwd ? 'Sembunyikan password' : 'Tampilkan password'}
            tabIndex={-1}
          >
            {showPwd
              ? <EyeOff className='w-4 h-4' aria-hidden='true' />
              : <Eye    className='w-4 h-4' aria-hidden='true' />}
          </button>
        </div>
      </div>

      {state.error && (
        <div role='alert' className='flex items-start gap-2 p-2.5 rounded-lg bg-red-950/40 border border-red-900 text-red-300'>
          <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />
          <p className='text-xs leading-relaxed'>{state.error}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full inline-flex items-center justify-center gap-2 py-2.5 bg-green-950 border border-green-700 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-900 transition-all focus-visible:outline-2 focus-visible:outline-green-500 disabled:opacity-50'
    >
      {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
      {pending ? 'Memeriksa...' : 'Sign In'}
    </button>
  )
}
