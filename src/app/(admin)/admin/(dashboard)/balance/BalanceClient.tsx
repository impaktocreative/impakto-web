'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronRight } from 'lucide-react'

type IncomeItem = {
  amount: number
  net_amount: number | null
  currency: string
  payment_date: string
  receiver: string | null
  service_name: string
  client_name: string
}

type ExpenseItem = {
  id: string
  expense_id: string
  amount: number
  currency: string
  payment_date: string
  paid_by: 'sergio' | 'rodrigo'
  notes: string | null
  expense_name: string
}

type MonthData = {
  monthKey: string
  label: string
  incomeSergioARS: number
  incomeRodrigoARS: number
  incomeSergioUSD: number
  incomeRodrigoUSD: number
  expenseSergioARS: number
  expenseRodrigoARS: number
  expenseSergioUSD: number
  expenseRodrigoUSD: number
  incomeDetails: IncomeItem[]
  expenseDetails: ExpenseItem[]
}

function formatCurrency(value: number, currency: 'ARS' | 'USD'): string {
  if (currency === 'USD') return `USD ${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
  return `$ ${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
}

function DetailRow({
  income,
  expense,
  rate,
}: {
  income?: IncomeItem
  expense?: ExpenseItem
  rate: number
}) {
  if (income) {
    const effectiveAmount = income.net_amount ?? income.amount
    const displayAmount = income.net_amount != null
      ? `${formatCurrency(income.amount, income.currency as 'ARS' | 'USD')} → ${formatCurrency(effectiveAmount, income.currency as 'ARS' | 'USD')}`
      : formatCurrency(income.amount, income.currency as 'ARS' | 'USD')

    return (
      <tr className="bg-gray-50/50 text-xs">
        <td></td>
        <td className="px-6 py-2 text-gray-500">{format(new Date(income.payment_date), 'dd/MM/yyyy')}</td>
        <td className="px-6 py-2">
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Ingreso</span>
        </td>
        <td className="px-6 py-2 text-gray-700">{income.client_name}</td>
        <td className="px-6 py-2 text-gray-700">{income.service_name}</td>
        <td className="px-6 py-2">
          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
            income.receiver === 'sergio' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {income.receiver === 'sergio' ? 'Sergio' : 'Rodrigo'}
          </span>
        </td>
        <td className="px-6 py-2 text-right text-green-600 font-medium">{displayAmount}</td>
      </tr>
    )
  }

  if (expense) {
    return (
      <tr className="bg-gray-50/50 text-xs">
        <td></td>
        <td className="px-6 py-2 text-gray-500">{format(new Date(expense.payment_date), 'dd/MM/yyyy')}</td>
        <td className="px-6 py-2">
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Egreso</span>
        </td>
        <td className="px-6 py-2 text-gray-700">—</td>
        <td className="px-6 py-2 text-gray-700">{expense.expense_name}</td>
        <td className="px-6 py-2">
          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
            expense.paid_by === 'sergio' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {expense.paid_by === 'sergio' ? 'Sergio' : 'Rodrigo'}
          </span>
        </td>
        <td className="px-6 py-2 text-right text-red-600 font-medium">
          - {formatCurrency(expense.amount, expense.currency as 'ARS' | 'USD')}
        </td>
      </tr>
    )
  }

  return null
}

export function BalanceClient({
  initialIncome,
  initialExpenses,
}: {
  initialIncome: IncomeItem[]
  initialExpenses: ExpenseItem[]
}) {
  const [usdRate, setUsdRate] = useState('1400')
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const monthsData = useMemo(() => {
    const rate = parseFloat(usdRate) || 1
    const monthsMap = new Map<string, MonthData>()

    for (const item of initialIncome) {
      const monthKey = item.payment_date.slice(0, 7)
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          monthKey,
          label: '',
          incomeSergioARS: 0,
          incomeRodrigoARS: 0,
          incomeSergioUSD: 0,
          incomeRodrigoUSD: 0,
          expenseSergioARS: 0,
          expenseRodrigoARS: 0,
          expenseSergioUSD: 0,
          expenseRodrigoUSD: 0,
          incomeDetails: [],
          expenseDetails: [],
        })
      }
      const m = monthsMap.get(monthKey)!
      const effective = item.net_amount ?? item.amount
      if (item.receiver === 'sergio') {
        if (item.currency === 'ARS') m.incomeSergioARS += effective
        else m.incomeSergioUSD += effective
      } else if (item.receiver === 'rodrigo') {
        if (item.currency === 'ARS') m.incomeRodrigoARS += effective
        else m.incomeRodrigoUSD += effective
      }
      m.incomeDetails.push(item)
    }

    for (const item of initialExpenses) {
      const monthKey = item.payment_date.slice(0, 7)
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          monthKey,
          label: '',
          incomeSergioARS: 0,
          incomeRodrigoARS: 0,
          incomeSergioUSD: 0,
          incomeRodrigoUSD: 0,
          expenseSergioARS: 0,
          expenseRodrigoARS: 0,
          expenseSergioUSD: 0,
          expenseRodrigoUSD: 0,
          incomeDetails: [],
          expenseDetails: [],
        })
      }
      const m = monthsMap.get(monthKey)!
      if (item.paid_by === 'sergio') {
        if (item.currency === 'ARS') m.expenseSergioARS += item.amount
        else m.expenseSergioUSD += item.amount
      } else {
        if (item.currency === 'ARS') m.expenseRodrigoARS += item.amount
        else m.expenseRodrigoUSD += item.amount
      }
      m.expenseDetails.push(item)
    }

    const sorted = Array.from(monthsMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

    for (const m of sorted) {
      const [y, mo] = m.monthKey.split('-').map(Number)
      m.label = format(new Date(y, mo - 1, 1), "MMMM yyyy", { locale: es })
    }

    return sorted
  }, [initialIncome, initialExpenses, usdRate])

  const totals = useMemo(() => {
    const rate = parseFloat(usdRate) || 1
    let totalIncomeARS = 0
    let totalIncomeUSD = 0
    let totalExpenseARS = 0
    let totalExpenseUSD = 0

    for (const m of monthsData) {
      totalIncomeARS += m.incomeSergioARS + m.incomeRodrigoARS
      totalIncomeUSD += m.incomeSergioUSD + m.incomeRodrigoUSD
      totalExpenseARS += m.expenseSergioARS + m.expenseRodrigoARS
      totalExpenseUSD += m.expenseSergioUSD + m.expenseRodrigoUSD
    }

    const totalNeto = (totalIncomeARS - totalExpenseARS) + (totalIncomeUSD - totalExpenseUSD) * rate
    return { totalIncomeARS, totalIncomeUSD, totalExpenseARS, totalExpenseUSD, totalNeto }
  }, [monthsData, usdRate])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Balance Mensual</h1>
          <p className="mt-1 text-sm text-gray-500">Historial de ingresos, egresos y balance de los últimos 12 meses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label htmlFor="usdRate" className="block text-xs font-medium text-gray-500 mb-1">Cotización USD</label>
            <input
              type="number"
              id="usdRate"
              value={usdRate}
              onChange={(e) => setUsdRate(e.target.value)}
              min={1}
              className="w-28 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Ingresos ARS</h4>
          <p className="text-lg font-bold text-green-600 mt-1">$ {totals.totalIncomeARS.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Ingresos USD</h4>
          <p className="text-lg font-bold text-green-600 mt-1">USD {totals.totalIncomeUSD.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Egresos ARS</h4>
          <p className="text-lg font-bold text-red-600 mt-1">$ {totals.totalExpenseARS.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Egresos USD</h4>
          <p className="text-lg font-bold text-red-600 mt-1">USD {totals.totalExpenseUSD.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-black rounded-xl shadow-sm p-4">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Neto Total (12m)</h4>
          <p className={`text-lg font-bold mt-1 ${totals.totalNeto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            $ {totals.totalNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-8 px-2 py-3"></th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Mes</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ingresos ARS</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Ingresos USD</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Egresos ARS</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Egresos USD</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Neto Sergio</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Neto Rodrigo</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Neto Total</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthsData.map((m) => {
                const rate = parseFloat(usdRate) || 1
                const sergioIncome = m.incomeSergioARS + m.incomeSergioUSD * rate
                const rodrigoIncome = m.incomeRodrigoARS + m.incomeRodrigoUSD * rate
                const sergioExpenses = m.expenseSergioARS + m.expenseSergioUSD * rate
                const rodrigoExpenses = m.expenseRodrigoARS + m.expenseRodrigoUSD * rate
                const sergioNeto = sergioIncome - sergioExpenses
                const rodrigoNeto = rodrigoIncome - rodrigoExpenses
                const netoTotal = sergioNeto + rodrigoNeto
                const mitad = netoTotal / 2
                const liquidacion = mitad - sergioNeto
                const isExpanded = expandedMonth === m.monthKey

                const totalIncomeArs = m.incomeSergioARS + m.incomeRodrigoARS
                const totalIncomeUsd = m.incomeSergioUSD + m.incomeRodrigoUSD
                const totalExpenseArs = m.expenseSergioARS + m.expenseRodrigoARS
                const totalExpenseUsd = m.expenseSergioUSD + m.expenseRodrigoUSD

                return (
                  <tr key={m.monthKey}>
                    {isExpanded ? (
                      <>
                        <td colSpan={10} className="p-0">
                          <table className="w-full">
                            <tbody>
                              <tr
                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={() => setExpandedMonth(null)}
                              >
                                <td className="w-8 px-2 py-4">
                                  <ChevronDown size={16} className="text-gray-400" />
                                </td>
                                <td className="px-4 py-4 font-medium text-gray-900 capitalize">{m.label}</td>
                                <td className="px-4 py-4 text-right text-green-600 font-medium">$ {totalIncomeArs.toLocaleString('es-AR')}</td>
                                <td className="px-4 py-4 text-right text-green-600 font-medium">USD {totalIncomeUsd.toLocaleString('es-AR')}</td>
                                <td className="px-4 py-4 text-right text-red-600 font-medium">$ {totalExpenseArs.toLocaleString('es-AR')}</td>
                                <td className="px-4 py-4 text-right text-red-600 font-medium">USD {totalExpenseUsd.toLocaleString('es-AR')}</td>
                                <td className={`px-4 py-4 text-right font-medium ${sergioNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  $ {sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                </td>
                                <td className={`px-4 py-4 text-right font-medium ${rodrigoNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  $ {rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                </td>
                                <td className={`px-4 py-4 text-right font-bold ${netoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  $ {netoTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                  {liquidacion > 0
                                    ? `R → S: $${liquidacion.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
                                    : liquidacion < 0
                                      ? `S → R: $${Math.abs(liquidacion).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
                                      : '✓'}
                                </td>
                              </tr>
                              {m.incomeDetails.length > 0 && (
                                <>
                                  <tr className="bg-gray-100/60 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <td className="w-8 px-2"></td>
                                    <td className="px-6 py-2">Fecha</td>
                                    <td className="px-6 py-2">Tipo</td>
                                    <td className="px-6 py-2">Cliente</td>
                                    <td className="px-6 py-2">Concepto</td>
                                    <td className="px-6 py-2">Recibe/Paga</td>
                                    <td className="px-6 py-2 text-right">Monto</td>
                                  </tr>
                                  {m.incomeDetails.map((inc, i) => (
                                    <DetailRow key={`inc-${i}`} income={inc} rate={rate} />
                                  ))}
                                </>
                              )}
                              {m.expenseDetails.length > 0 && (
                                <>
                                  {m.expenseDetails.map((exp, i) => (
                                    <DetailRow key={`exp-${i}`} expense={exp} rate={rate} />
                                  ))}
                                </>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="w-8 px-2 py-4">
                          <button
                            onClick={() => setExpandedMonth(m.monthKey)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-900 capitalize">{m.label}</td>
                        <td className="px-4 py-4 text-right text-green-600 font-medium">$ {totalIncomeArs.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-4 text-right text-green-600 font-medium">USD {totalIncomeUsd.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-4 text-right text-red-600 font-medium">$ {totalExpenseArs.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-4 text-right text-red-600 font-medium">USD {totalExpenseUsd.toLocaleString('es-AR')}</td>
                        <td className={`px-4 py-4 text-right font-medium ${sergioNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          $ {sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-4 text-right font-medium ${rodrigoNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          $ {rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-4 text-right font-bold ${netoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          $ {netoTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">
                          {liquidacion > 0
                            ? `R → S: $${liquidacion.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
                            : liquidacion < 0
                              ? `S → R: $${Math.abs(liquidacion).toLocaleString('es-AR', { maximumFractionDigits: 2 })}`
                              : '✓'}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
              {monthsData.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-gray-500">No hay datos en los últimos 12 meses.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden divide-y divide-gray-100">
          {monthsData.map((m) => {
            const rate = parseFloat(usdRate) || 1
            const sergioIncome = m.incomeSergioARS + m.incomeSergioUSD * rate
            const rodrigoIncome = m.incomeRodrigoARS + m.incomeRodrigoUSD * rate
            const sergioExpenses = m.expenseSergioARS + m.expenseSergioUSD * rate
            const rodrigoExpenses = m.expenseRodrigoARS + m.expenseRodrigoUSD * rate
            const sergioNeto = sergioIncome - sergioExpenses
            const rodrigoNeto = rodrigoIncome - rodrigoExpenses
            const netoTotal = sergioNeto + rodrigoNeto
            const mitad = netoTotal / 2
            const liquidacion = mitad - sergioNeto
            const isExpanded = expandedMonth === m.monthKey

            return (
              <div key={m.monthKey}>
                <button
                  onClick={() => setExpandedMonth(isExpanded ? null : m.monthKey)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 capitalize">{m.label}</span>
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Ingresos</p>
                        <p className="font-semibold text-green-700">$ {(m.incomeSergioARS + m.incomeRodrigoARS).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-green-600">USD {(m.incomeSergioUSD + m.incomeRodrigoUSD).toLocaleString('es-AR')}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500">Egresos</p>
                        <p className="font-semibold text-red-700">$ {(m.expenseSergioARS + m.expenseRodrigoARS).toLocaleString('es-AR')}</p>
                        <p className="text-xs text-red-600">USD {(m.expenseSergioUSD + m.expenseRodrigoUSD).toLocaleString('es-AR')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Neto Sergio: <span className={sergioNeto >= 0 ? 'text-green-600' : 'text-red-600'}>${sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></span>
                      <span>Neto Rodrigo: <span className={rodrigoNeto >= 0 ? 'text-green-600' : 'text-red-600'}>${rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</span></span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      <p className="font-semibold">
                        {liquidacion > 0
                          ? `Rodrigo debe pagar $${liquidacion.toLocaleString('es-AR', { maximumFractionDigits: 2 })} a Sergio`
                          : liquidacion < 0
                            ? `Sergio debe pagar $${Math.abs(liquidacion).toLocaleString('es-AR', { maximumFractionDigits: 2 })} a Rodrigo`
                            : 'Todo balanceado'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {monthsData.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay datos en los últimos 12 meses.</div>
          )}
        </div>
      </div>
    </div>
  )
}
