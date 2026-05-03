'use client'

import { useEffect, useMemo, useState } from 'react'

type Tier = {
  upTo: number | null
  m2mCommission: number
  contractCommission: number
}

type State = {
  contractWeekly: number
  m2mWeekly: number
  enrollmentFee: number
  upsell: number
  upsellPercent: number
  avgM2mTenure: number
  hourlyRate: number
  hoursCap: number
  tiers: Tier[]
  monthlyAdSpend: number
  otherCosts: number
  signups: number
  contractPercent: number
  scenarioSlow: number
  scenarioTarget: number
  scenarioStretch: number
}

const DEFAULTS: State = {
  contractWeekly: 67,
  m2mWeekly: 84,
  enrollmentFee: 99,
  upsell: 0,
  upsellPercent: 0,
  avgM2mTenure: 5,
  hourlyRate: 20,
  hoursCap: 15,
  tiers: [
    { upTo: 30, m2mCommission: 100, contractCommission: 250 },
    { upTo: null, m2mCommission: 125, contractCommission: 325 },
  ],
  monthlyAdSpend: 2000,
  otherCosts: 0,
  signups: 30,
  contractPercent: 70,
  scenarioSlow: 20,
  scenarioTarget: 30,
  scenarioStretch: 45,
}

const STORAGE_KEY = 'closer-comp-v1'
const WEEKS_PER_MONTH = 4.33

const fmt$ = (n: number) =>
  (n < 0 ? '-' : '') +
  '$' +
  Math.abs(Math.round(n)).toLocaleString('en-US')

const fmt$2 = (n: number) =>
  (n < 0 ? '-' : '') +
  '$' +
  Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtPct = (n: number, digits = 1) =>
  `${(n * 100).toFixed(digits)}%`

type TierRow = {
  index: number
  signups: number
  contracts: number
  m2m: number
  contractComm: number
  m2mComm: number
  total: number
}

type Calc = {
  N: number
  contracts: number
  m2m: number
  tierRows: TierRow[]
  totalCommission: number
  hourlyEarnings: number
  totalTakeHome: number
  hoursWorkedMonthly: number
  effectiveHourly: number
  enrollmentRevenue: number
  netCommissionCost: number
  monthlyAdSpend: number
  otherCosts: number
  totalAcqCost: number
  cac: number
  contractFirstYearRev: number
  m2mFirstYearRev: number
  blendedFirstYearRev: number
  blendedMonthlyRev: number
  upsellRevenuePerSignup: number
  cacPctOfRev: number
  monthsToRecoup: number
  month1CashPerSignup: number
  month1TotalCash: number
}

function calculate(s: State, signupsOverride?: number): Calc {
  const N = signupsOverride ?? s.signups
  const pct = s.contractPercent / 100

  let cursor = 0
  let remaining = N
  let totalCommission = 0
  let totalContracts = 0
  let totalM2m = 0
  const tierRows: TierRow[] = []

  for (let i = 0; i < s.tiers.length; i++) {
    const tier = s.tiers[i]
    if (remaining <= 0) break
    const cap = tier.upTo ?? Infinity
    const tierCapacity = Math.max(0, cap - cursor)
    const tierSignups = Math.min(remaining, tierCapacity)
    if (tierSignups === 0) {
      cursor = cap
      continue
    }
    const contracts = Math.round(tierSignups * pct)
    const m2m = tierSignups - contracts
    const contractComm = contracts * tier.contractCommission
    const m2mComm = m2m * tier.m2mCommission
    const total = contractComm + m2mComm
    tierRows.push({
      index: i + 1,
      signups: tierSignups,
      contracts,
      m2m,
      contractComm,
      m2mComm,
      total,
    })
    totalCommission += total
    totalContracts += contracts
    totalM2m += m2m
    cursor += tierSignups
    remaining -= tierSignups
  }

  const hoursWorkedMonthly = s.hoursCap * WEEKS_PER_MONTH
  const hourlyEarnings = hoursWorkedMonthly * s.hourlyRate
  const totalTakeHome = hourlyEarnings + totalCommission
  const effectiveHourly = hoursWorkedMonthly > 0 ? totalTakeHome / hoursWorkedMonthly : 0

  const enrollmentRevenue = N * s.enrollmentFee
  const netCommissionCost = totalCommission - enrollmentRevenue
  const totalAcqCost = totalCommission + hourlyEarnings + s.monthlyAdSpend + s.otherCosts
  const cac = N > 0 ? totalAcqCost / N : 0

  const upsellRevenuePerSignup = (s.upsellPercent / 100) * s.upsell
  const contractFirstYearRev = s.contractWeekly * 52 + s.enrollmentFee + upsellRevenuePerSignup
  const m2mFirstYearRev = s.m2mWeekly * WEEKS_PER_MONTH * s.avgM2mTenure + s.enrollmentFee + upsellRevenuePerSignup
  const blendedFirstYearRev = pct * contractFirstYearRev + (1 - pct) * m2mFirstYearRev

  const blendedMonthlyRev = pct * (s.contractWeekly * WEEKS_PER_MONTH) + (1 - pct) * (s.m2mWeekly * WEEKS_PER_MONTH)
  const cacPctOfRev = blendedFirstYearRev > 0 ? cac / blendedFirstYearRev : 0
  const monthsToRecoup = blendedMonthlyRev > 0 ? cac / blendedMonthlyRev : 0

  const month1CashPerSignup = s.enrollmentFee + blendedMonthlyRev + upsellRevenuePerSignup
  const month1TotalCash = N * month1CashPerSignup

  return {
    N,
    contracts: totalContracts,
    m2m: totalM2m,
    tierRows,
    totalCommission,
    hourlyEarnings,
    totalTakeHome,
    hoursWorkedMonthly,
    effectiveHourly,
    enrollmentRevenue,
    netCommissionCost,
    monthlyAdSpend: s.monthlyAdSpend,
    otherCosts: s.otherCosts,
    totalAcqCost,
    cac,
    contractFirstYearRev,
    m2mFirstYearRev,
    blendedFirstYearRev,
    blendedMonthlyRev,
    upsellRevenuePerSignup,
    cacPctOfRev,
    monthsToRecoup,
    month1CashPerSignup,
    month1TotalCash,
  }
}

function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
  prefix,
  suffix,
  className = '',
}: {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span className="pointer-events-none absolute left-2 text-xs text-gray-500">{prefix}</span>
      )}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => {
          const v = e.target.value === '' ? 0 : Number(e.target.value)
          onChange(Number.isFinite(v) ? v : 0)
        }}
        className={`w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm tabular-nums focus:border-gray-900 focus:outline-none ${prefix ? 'pl-5' : ''} ${suffix ? 'pr-7' : ''}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2 text-xs text-gray-500">{suffix}</span>
      )}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</span>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Stat({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'green' | 'blue' | 'amber' | 'red'
}) {
  const toneClass =
    tone === 'green'
      ? 'text-emerald-700'
      : tone === 'blue'
        ? 'text-blue-700'
        : tone === 'amber'
          ? 'text-amber-700'
          : tone === 'red'
            ? 'text-rose-700'
            : 'text-gray-900'
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className={`text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  )
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 text-sm">
      <span className={muted ? 'text-gray-500' : 'text-gray-700'}>{label}</span>
      <span className={`tabular-nums ${muted ? 'text-gray-500' : 'font-medium text-gray-900'}`}>{value}</span>
    </div>
  )
}

export default function CloserCompPage() {
  const [state, setState] = useState<State>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setState({ ...DEFAULTS, ...parsed, tiers: parsed.tiers ?? DEFAULTS.tiers })
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state, hydrated])

  const update = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  const updateTier = (idx: number, patch: Partial<Tier>) =>
    setState((s) => ({
      ...s,
      tiers: s.tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }))

  const addTier = () => {
    if (state.tiers.length >= 4) return
    setState((s) => {
      const last = s.tiers[s.tiers.length - 1]
      const prev = s.tiers[s.tiers.length - 2]
      const newTiers = s.tiers.map((t, i) => (i === s.tiers.length - 1 ? { ...t, upTo: (prev?.upTo ?? 30) + 30 } : t))
      newTiers.push({
        upTo: null,
        m2mCommission: last.m2mCommission + 25,
        contractCommission: last.contractCommission + 75,
      })
      return { ...s, tiers: newTiers }
    })
  }

  const removeTier = (idx: number) => {
    if (state.tiers.length <= 1) return
    setState((s) => {
      const next = s.tiers.filter((_, i) => i !== idx)
      next[next.length - 1] = { ...next[next.length - 1], upTo: null }
      return { ...s, tiers: next }
    })
  }

  const reset = () => {
    setState(DEFAULTS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const calc = useMemo(() => calculate(state), [state])
  const slow = useMemo(() => calculate(state, state.scenarioSlow), [state])
  const target = useMemo(() => calculate(state, state.scenarioTarget), [state])
  const stretch = useMemo(() => calculate(state, state.scenarioStretch), [state])

  const cacWarning = calc.cacPctOfRev > 0.2

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Closer Compensation & CAC Model</h1>
            <p className="text-xs text-gray-500">All inputs editable. Numbers update live. Stored locally.</p>
          </div>
          <button
            onClick={reset}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Reset to defaults
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[360px_1fr]">
        {/* Inputs sidebar */}
        <aside className="space-y-4">
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contract weekly">
                <NumberInput value={state.contractWeekly} onChange={(v) => update('contractWeekly', v)} prefix="$" />
              </Field>
              <Field label="M2M weekly">
                <NumberInput value={state.m2mWeekly} onChange={(v) => update('m2mWeekly', v)} prefix="$" />
              </Field>
              <Field label="Enrollment fee">
                <NumberInput value={state.enrollmentFee} onChange={(v) => update('enrollmentFee', v)} prefix="$" />
              </Field>
              <Field label="Avg M2M tenure" hint="months">
                <NumberInput value={state.avgM2mTenure} onChange={(v) => update('avgM2mTenure', v)} step={0.5} suffix="mo" />
              </Field>
              <Field label="Upsell amount">
                <NumberInput value={state.upsell} onChange={(v) => update('upsell', v)} prefix="$" />
              </Field>
              <Field label="Upsell take rate">
                <NumberInput value={state.upsellPercent} onChange={(v) => update('upsellPercent', v)} suffix="%" max={100} min={0} />
              </Field>
            </div>
          </Section>

          <Section title="Closer Comp">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Hourly rate">
                <NumberInput value={state.hourlyRate} onChange={(v) => update('hourlyRate', v)} prefix="$" />
              </Field>
              <Field label="Hours/week cap">
                <NumberInput value={state.hoursCap} onChange={(v) => update('hoursCap', v)} suffix="hr" />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Tiers</span>
                <span className="text-[10px] text-gray-400">marginal — applies per signup</span>
              </div>
              <div className="overflow-hidden rounded border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium">Tier</th>
                      <th className="px-2 py-1.5 text-left font-medium">Up to</th>
                      <th className="px-2 py-1.5 text-left font-medium">M2M $</th>
                      <th className="px-2 py-1.5 text-left font-medium">Contract $</th>
                      <th className="px-1 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.tiers.map((tier, i) => {
                      const isLast = i === state.tiers.length - 1
                      return (
                        <tr key={i} className="border-t border-gray-200">
                          <td className="px-2 py-1.5 font-medium text-gray-700">{i + 1}</td>
                          <td className="px-1 py-1">
                            {isLast ? (
                              <span className="text-gray-500">∞</span>
                            ) : (
                              <NumberInput
                                value={tier.upTo ?? 0}
                                onChange={(v) => updateTier(i, { upTo: v })}
                                className="w-16"
                              />
                            )}
                          </td>
                          <td className="px-1 py-1">
                            <NumberInput
                              value={tier.m2mCommission}
                              onChange={(v) => updateTier(i, { m2mCommission: v })}
                              prefix="$"
                              className="w-20"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <NumberInput
                              value={tier.contractCommission}
                              onChange={(v) => updateTier(i, { contractCommission: v })}
                              prefix="$"
                              className="w-20"
                            />
                          </td>
                          <td className="px-1 py-1 text-right">
                            {state.tiers.length > 1 && (
                              <button
                                onClick={() => removeTier(i)}
                                className="rounded px-1 text-gray-400 hover:bg-gray-100 hover:text-rose-600"
                                aria-label="Remove tier"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {state.tiers.length < 4 && (
                <button
                  onClick={addTier}
                  className="mt-2 rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
                >
                  + Add tier
                </button>
              )}
            </div>
          </Section>

          <Section title="Acquisition">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monthly ad spend">
                <NumberInput value={state.monthlyAdSpend} onChange={(v) => update('monthlyAdSpend', v)} prefix="$" />
              </Field>
              <Field label="Other monthly costs">
                <NumberInput value={state.otherCosts} onChange={(v) => update('otherCosts', v)} prefix="$" />
              </Field>
            </div>
          </Section>

          <Section title="Performance">
            <Field label={`Signups this month: ${state.signups}`}>
              <input
                type="range"
                min={0}
                max={80}
                value={state.signups}
                onChange={(e) => update('signups', Number(e.target.value))}
                className="w-full accent-gray-900"
              />
            </Field>
            <Field label={`Contract mix: ${state.contractPercent}%  (M2M: ${100 - state.contractPercent}%)`}>
              <input
                type="range"
                min={0}
                max={100}
                value={state.contractPercent}
                onChange={(e) => update('contractPercent', Number(e.target.value))}
                className="w-full accent-gray-900"
              />
            </Field>
            <div className="text-xs text-gray-500">
              {calc.contracts} contracts · {calc.m2m} M2M
            </div>
          </Section>
        </aside>

        {/* Outputs */}
        <main className="space-y-6">
          {/* Closer Earnings */}
          <section className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Closer Earnings</h2>
              <span className="text-xs text-emerald-700/70">at {calc.N} signups · {state.contractPercent}% contracts</span>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Total take-home" value={fmt$(calc.totalTakeHome)} tone="green" />
              <Stat label="Hourly earnings" value={fmt$(calc.hourlyEarnings)} sub={`${calc.hoursWorkedMonthly.toFixed(1)} hrs @ ${fmt$(state.hourlyRate)}`} />
              <Stat label="Total commission" value={fmt$(calc.totalCommission)} sub={`${calc.contracts} × contract + ${calc.m2m} × M2M`} />
              <Stat label="Effective hourly" value={fmt$2(calc.effectiveHourly)} sub="take-home ÷ hours worked" />
            </div>

            <div className="mt-5 overflow-hidden rounded border border-emerald-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-emerald-50 text-xs uppercase tracking-wide text-emerald-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tier</th>
                    <th className="px-3 py-2 text-right font-medium">Signups</th>
                    <th className="px-3 py-2 text-right font-medium">Contracts</th>
                    <th className="px-3 py-2 text-right font-medium">M2M</th>
                    <th className="px-3 py-2 text-right font-medium">Contract $</th>
                    <th className="px-3 py-2 text-right font-medium">M2M $</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.tierRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-3 text-center text-xs text-gray-500">No signups in modeled month.</td>
                    </tr>
                  ) : (
                    calc.tierRows.map((row) => (
                      <tr key={row.index} className="border-t border-emerald-100 tabular-nums">
                        <td className="px-3 py-2 font-medium">Tier {row.index}</td>
                        <td className="px-3 py-2 text-right">{row.signups}</td>
                        <td className="px-3 py-2 text-right">{row.contracts}</td>
                        <td className="px-3 py-2 text-right">{row.m2m}</td>
                        <td className="px-3 py-2 text-right">{fmt$(row.contractComm)}</td>
                        <td className="px-3 py-2 text-right">{fmt$(row.m2mComm)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmt$(row.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Academy Cost */}
          <section className="rounded-lg border border-blue-200 bg-blue-50/40 p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-800">Academy Cost</h2>
              <span className="text-xs text-blue-700/70">acquisition + fulfillment cost of comp</span>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Cost per signup (CAC)" value={fmt$(calc.cac)} tone={cacWarning ? 'amber' : 'blue'} />
              <Stat label="Total acquisition cost" value={fmt$(calc.totalAcqCost)} />
              <Stat
                label="Net commission cost"
                value={fmt$(calc.netCommissionCost)}
                sub={calc.netCommissionCost < 0 ? 'enrollments cover commission' : 'after enrollment offset'}
                tone={calc.netCommissionCost < 0 ? 'green' : 'default'}
              />
              <Stat label="Enrollment fees collected" value={fmt$(calc.enrollmentRevenue)} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <Row label="Total commission" value={fmt$(calc.totalCommission)} />
                <Row label="Hourly cost" value={fmt$(calc.hourlyEarnings)} />
                <Row label="Ad spend" value={fmt$(calc.monthlyAdSpend)} />
                {state.otherCosts > 0 && <Row label="Other costs" value={fmt$(calc.otherCosts)} />}
              </div>
              <div>
                <Row label="Enrollment fees" value={fmt$(calc.enrollmentRevenue)} muted />
                <Row label="Net cost (acq − enroll)" value={fmt$(calc.totalAcqCost - calc.enrollmentRevenue)} />
                <Row label="Net cost per signup" value={fmt$(calc.N > 0 ? (calc.totalAcqCost - calc.enrollmentRevenue) / calc.N : 0)} />
              </div>
            </div>
          </section>

          {/* Unit Economics */}
          <section className="rounded-lg border border-blue-200 bg-white p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-800">Unit Economics</h2>
              <span className="text-xs text-gray-500">M2M tenure assumed at {state.avgM2mTenure} months — adjust in sidebar</span>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Stat label="Blended Y1 revenue / signup" value={fmt$(calc.blendedFirstYearRev)} tone="blue" />
              <Stat
                label="CAC % of Y1 revenue"
                value={fmtPct(calc.cacPctOfRev)}
                tone={cacWarning ? 'amber' : 'default'}
                sub={cacWarning ? '⚠ above 20%' : 'healthy'}
              />
              <Stat label="Months to recoup CAC" value={calc.monthsToRecoup.toFixed(1)} sub="CAC ÷ avg monthly rev" />
              <Stat label="Month 1 cash collected" value={fmt$(calc.month1TotalCash)} sub={`${fmt$(calc.month1CashPerSignup)} / signup`} />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
              <div>
                <Row label="Contract Y1 revenue" value={fmt$(calc.contractFirstYearRev)} />
                <Row
                  label="  weekly × 52"
                  value={fmt$(state.contractWeekly * 52)}
                  muted
                />
                <Row label="  + enrollment fee" value={fmt$(state.enrollmentFee)} muted />
                {calc.upsellRevenuePerSignup > 0 && (
                  <Row label="  + expected upsell" value={fmt$(calc.upsellRevenuePerSignup)} muted />
                )}
              </div>
              <div>
                <Row label="M2M Y1 revenue" value={fmt$(calc.m2mFirstYearRev)} />
                <Row
                  label={`  weekly × 4.33 × ${state.avgM2mTenure} mo`}
                  value={fmt$(state.m2mWeekly * WEEKS_PER_MONTH * state.avgM2mTenure)}
                  muted
                />
                <Row label="  + enrollment fee" value={fmt$(state.enrollmentFee)} muted />
                {calc.upsellRevenuePerSignup > 0 && (
                  <Row label="  + expected upsell" value={fmt$(calc.upsellRevenuePerSignup)} muted />
                )}
              </div>
            </div>
          </section>

          {/* Scenario Comparison */}
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Scenario Comparison</h2>
              <span className="text-xs text-gray-500">same comp structure · varied signup counts</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ScenarioCard
                label="Slow month"
                signups={state.scenarioSlow}
                onChange={(v) => update('scenarioSlow', v)}
                calc={slow}
                state={state}
              />
              <ScenarioCard
                label="Target"
                signups={state.scenarioTarget}
                onChange={(v) => update('scenarioTarget', v)}
                calc={target}
                state={state}
                emphasize
              />
              <ScenarioCard
                label="Stretch"
                signups={state.scenarioStretch}
                onChange={(v) => update('scenarioStretch', v)}
                calc={stretch}
                state={state}
              />
            </div>
          </section>

          <footer className="pt-2 pb-8 text-center text-xs text-gray-400">
            Internal modeling tool · all calculations client-side · changes saved to localStorage
          </footer>
        </main>
      </div>
    </div>
  )
}

function ScenarioCard({
  label,
  signups,
  onChange,
  calc,
  state,
  emphasize = false,
}: {
  label: string
  signups: number
  onChange: (n: number) => void
  calc: Calc
  state: State
  emphasize?: boolean
}) {
  const cacWarning = calc.cacPctOfRev > 0.2
  return (
    <div
      className={`rounded-lg border p-4 ${emphasize ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</span>
        <div className="flex items-center gap-1">
          <NumberInput value={signups} onChange={onChange} className="w-16" min={0} />
          <span className="text-xs text-gray-500">signups</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded border border-emerald-100 bg-emerald-50/40 p-2.5">
          <div className="mb-1 text-[10px] uppercase tracking-wide text-emerald-800">Closer</div>
          <div className="text-lg font-semibold tabular-nums text-emerald-700">{fmt$(calc.totalTakeHome)}</div>
          <div className="mt-1 text-[11px] text-gray-600">
            {fmt$(calc.hourlyEarnings)} hourly + {fmt$(calc.totalCommission)} commission
          </div>
          <div className="text-[11px] text-gray-600">{fmt$2(calc.effectiveHourly)}/hr effective</div>
        </div>

        <div className="rounded border border-blue-100 bg-blue-50/40 p-2.5">
          <div className="mb-1 text-[10px] uppercase tracking-wide text-blue-800">Academy</div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-gray-600">CAC</span>
            <span className={`text-lg font-semibold tabular-nums ${cacWarning ? 'text-amber-700' : 'text-blue-700'}`}>
              {fmt$(calc.cac)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-[11px] text-gray-600">
            <span>CAC / Y1 rev</span>
            <span className={`tabular-nums ${cacWarning ? 'text-amber-700 font-medium' : ''}`}>{fmtPct(calc.cacPctOfRev)}</span>
          </div>
          <div className="flex items-baseline justify-between text-[11px] text-gray-600">
            <span>Net commission cost</span>
            <span className="tabular-nums">{fmt$(calc.netCommissionCost)}</span>
          </div>
          <div className="flex items-baseline justify-between text-[11px] text-gray-600">
            <span>Months to recoup</span>
            <span className="tabular-nums">{calc.monthsToRecoup.toFixed(1)}</span>
          </div>
          <div className="flex items-baseline justify-between text-[11px] text-gray-600">
            <span>Month 1 cash</span>
            <span className="tabular-nums">{fmt$(calc.month1TotalCash)}</span>
          </div>
        </div>

        <div className="text-[11px] text-gray-500">
          {calc.contracts} contract · {calc.m2m} M2M @ {state.contractPercent}% mix
        </div>
      </div>
    </div>
  )
}
