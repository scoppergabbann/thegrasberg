// ──────────────────────────────────────────────────────────────────
// Forex pip & lot calculations
// ──────────────────────────────────────────────────────────────────

export interface PairSpec {
  symbol:    string
  pipDecimal: number      // posisi desimal pip (0.0001 → 4, 0.01 → 2)
  pipValuePerLot: number  // USD value of 1 pip per 1.0 standard lot (account in USD)
  digits:    number       // jumlah digit setelah koma untuk display
  category:  'major' | 'cross' | 'jpy' | 'metal' | 'index' | 'crypto' | 'energy'
}

// Standar pip values (1.0 standard lot = 100,000 units, USD account)
// Untuk pair non-USD-quote, ini approximate pakai harga rata-rata
export const PAIR_SPECS: Record<string, PairSpec> = {
  // Major pairs (xxxUSD or USDxxx)
  EURUSD: { symbol:'EURUSD', pipDecimal:4, pipValuePerLot:10,    digits:5, category:'major' },
  GBPUSD: { symbol:'GBPUSD', pipDecimal:4, pipValuePerLot:10,    digits:5, category:'major' },
  AUDUSD: { symbol:'AUDUSD', pipDecimal:4, pipValuePerLot:10,    digits:5, category:'major' },
  NZDUSD: { symbol:'NZDUSD', pipDecimal:4, pipValuePerLot:10,    digits:5, category:'major' },
  USDCAD: { symbol:'USDCAD', pipDecimal:4, pipValuePerLot:7.30,  digits:5, category:'major' },
  USDCHF: { symbol:'USDCHF', pipDecimal:4, pipValuePerLot:11.20, digits:5, category:'major' },

  // JPY pairs (pip = 0.01)
  USDJPY: { symbol:'USDJPY', pipDecimal:2, pipValuePerLot:6.60,  digits:3, category:'jpy' },
  EURJPY: { symbol:'EURJPY', pipDecimal:2, pipValuePerLot:6.60,  digits:3, category:'jpy' },
  GBPJPY: { symbol:'GBPJPY', pipDecimal:2, pipValuePerLot:6.60,  digits:3, category:'jpy' },
  AUDJPY: { symbol:'AUDJPY', pipDecimal:2, pipValuePerLot:6.60,  digits:3, category:'jpy' },

  // Cross pairs
  EURGBP: { symbol:'EURGBP', pipDecimal:4, pipValuePerLot:12.50, digits:5, category:'cross' },
  EURAUD: { symbol:'EURAUD', pipDecimal:4, pipValuePerLot:6.50,  digits:5, category:'cross' },
  GBPAUD: { symbol:'GBPAUD', pipDecimal:4, pipValuePerLot:6.50,  digits:5, category:'cross' },

  // Metals — gold pip = 0.01 ($1.00 move = 100 pips), silver pip = 0.001
  XAUUSD: { symbol:'XAUUSD', pipDecimal:2, pipValuePerLot:10,    digits:2, category:'metal' },
  XAGUSD: { symbol:'XAGUSD', pipDecimal:3, pipValuePerLot:5,     digits:3, category:'metal' },

  // Indices — 1 point = $1 per lot (typical)
  US30:   { symbol:'US30',   pipDecimal:0, pipValuePerLot:1,     digits:2, category:'index' },
  NAS100: { symbol:'NAS100', pipDecimal:0, pipValuePerLot:1,     digits:2, category:'index' },
  SPX500: { symbol:'SPX500', pipDecimal:0, pipValuePerLot:1,     digits:2, category:'index' },
  GER40:  { symbol:'GER40',  pipDecimal:0, pipValuePerLot:1,     digits:2, category:'index' },

  // Crypto
  BTCUSD: { symbol:'BTCUSD', pipDecimal:0, pipValuePerLot:1,     digits:2, category:'crypto' },
  ETHUSD: { symbol:'ETHUSD', pipDecimal:1, pipValuePerLot:1,     digits:2, category:'crypto' },

  // Energy
  USOIL:  { symbol:'USOIL',  pipDecimal:2, pipValuePerLot:10,    digits:2, category:'energy' },
}

export const ALL_PAIRS = Object.keys(PAIR_SPECS)

export function getPairSpec(symbol: string): PairSpec {
  return PAIR_SPECS[symbol] || PAIR_SPECS.EURUSD
}

// Convert price difference to pips
export function priceDiffToPips(priceDiff: number, spec: PairSpec): number {
  return priceDiff * Math.pow(10, spec.pipDecimal)
}

// Convert pips to price difference
export function pipsToPriceDiff(pips: number, spec: PairSpec): number {
  return pips / Math.pow(10, spec.pipDecimal)
}

// PnL in USD given lot size, pips, and pair spec
export function calcPnl(lots: number, pips: number, spec: PairSpec): number {
  return lots * pips * spec.pipValuePerLot
}

// Position sizing: how many lots needed to risk a specific $ amount over given pips
export function calcLotsFromRisk(riskAmount: number, slPips: number, spec: PairSpec): number {
  if (slPips <= 0 || spec.pipValuePerLot === 0) return 0
  return riskAmount / (slPips * spec.pipValuePerLot)
}

export interface CalcInput {
  pair:       string
  direction:  'BUY' | 'SELL'
  entryPrice: number
  slPrice:    number
  tpPrice:    number
  spread:     number   // in pips
  lotSize:    number
  accountBalance: number
  riskPercent:    number
}

export interface CalcResult {
  spec:           PairSpec
  slPips:         number      // distance entry → SL in pips (positive)
  tpPips:         number      // distance entry → TP in pips (positive)
  rrRatio:        number      // reward / risk
  rrLabel:        string      // "1 : 2.5"
  potentialLoss:  number      // USD if SL hit
  potentialGain:  number      // USD if TP hit
  spreadCost:     number      // USD cost to enter (1 lot example)
  riskAmount:     number      // riskPercent% of accountBalance
  recommendedLots: number     // lots that match risk amount
  pipValue:       number      // USD per pip at given lot size
  isValid:        boolean     // SL/TP arah benar?
  validationMsg:  string
}

export function calculate(input: CalcInput): CalcResult {
  const spec   = getPairSpec(input.pair)
  const isBuy  = input.direction === 'BUY'

  // Distance dari entry ke SL/TP (price)
  const slDiff = isBuy ? input.entryPrice - input.slPrice  : input.slPrice  - input.entryPrice
  const tpDiff = isBuy ? input.tpPrice    - input.entryPrice : input.entryPrice - input.tpPrice

  // Convert ke pips (positif untuk arah benar)
  const slPips = priceDiffToPips(slDiff, spec)
  const tpPips = priceDiffToPips(tpDiff, spec)

  // Validasi: SL/TP arah benar?
  let isValid = true
  let validationMsg = ''
  if (input.entryPrice && input.slPrice && slPips <= 0) {
    isValid = false
    validationMsg = isBuy
      ? 'Untuk BUY: Stop Loss harus DI BAWAH entry price'
      : 'Untuk SELL: Stop Loss harus DI ATAS entry price'
  } else if (input.entryPrice && input.tpPrice && tpPips <= 0) {
    isValid = false
    validationMsg = isBuy
      ? 'Untuk BUY: Take Profit harus DI ATAS entry price'
      : 'Untuk SELL: Take Profit harus DI BAWAH entry price'
  }

  const rrRatio = slPips > 0 ? tpPips / slPips : 0
  const rrLabel = rrRatio > 0 ? `1 : ${rrRatio.toFixed(2)}` : '—'

  const potentialLoss = calcPnl(input.lotSize, slPips, spec)
  const potentialGain = calcPnl(input.lotSize, tpPips, spec)
  const spreadCost    = calcPnl(input.lotSize, input.spread, spec)
  const pipValue      = input.lotSize * spec.pipValuePerLot

  const riskAmount       = (input.accountBalance * input.riskPercent) / 100
  const recommendedLots  = slPips > 0 ? calcLotsFromRisk(riskAmount, slPips, spec) : 0

  return {
    spec, slPips, tpPips, rrRatio, rrLabel,
    potentialLoss, potentialGain, spreadCost,
    riskAmount, recommendedLots, pipValue,
    isValid, validationMsg,
  }
}
