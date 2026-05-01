import CalculatorClient from '@/components/calculator/CalculatorClient'

export const metadata = { title: 'Trade Calculator — FX Journal' }

export default function CalculatorPage() {
  return (
    <div className='max-w-5xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Trade Calculator</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>
          Hitung risk &amp; reward, position sizing, dan estimasi profit/loss sebelum entry
        </p>
      </div>
      <CalculatorClient />
    </div>
  )
}
