'use client'

import { useActionState, useMemo, useState, useTransition } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { crearAjusteAction, eliminarAjusteAction, saveUsdRateAction } from './actions'
import { IconButton } from '../../ui/IconButton'
import { cotizacionDe, type UsdRates } from '@/lib/usd-rate'
import { fechaLocal } from '@/lib/fecha'

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

type AdjustmentItem = {
  id: string
  month: string
  favor: 'sergio' | 'rodrigo'
  amount: number
  currency: string
  description: string
  created_at: string
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
  adjustments: AdjustmentItem[]
}

function mesVacio(monthKey: string): MonthData {
  return {
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
    adjustments: [],
  }
}

function formatCurrency(value: number, currency: 'ARS' | 'USD'): string {
  if (currency === 'USD') return `USD ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
  return `$ ${value.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

function DetailRow({
  income,
  expense,
}: {
  income?: IncomeItem
  expense?: ExpenseItem
}) {
  if (income) {
    const effectiveAmount = income.net_amount ?? income.amount
    const displayAmount = income.net_amount != null
      ? `${formatCurrency(income.amount, income.currency as 'ARS' | 'USD')} → ${formatCurrency(effectiveAmount, income.currency as 'ARS' | 'USD')}`
      : formatCurrency(income.amount, income.currency as 'ARS' | 'USD')

    return (
      <tr className="bg-gray-50/50 text-xs">
        <td></td>
        <td className="px-6 py-2 text-gray-500">{format(fechaLocal(income.payment_date), 'dd/MM/yyyy')}</td>
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
        <td className="px-6 py-2 text-gray-500">{format(fechaLocal(expense.payment_date), 'dd/MM/yyyy')}</td>
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

/** Cómo se lee la liquidación del mes: quién le transfiere a quién. */
function textoLiquidacion(liquidacion: number, largo = false): string {
  const monto = Math.abs(liquidacion).toLocaleString('es-AR', { maximumFractionDigits: 0 })
  if (Math.round(liquidacion) === 0) return largo ? 'Todo balanceado' : '✓'
  const deudor = liquidacion > 0 ? 'rodrigo' : 'sergio'
  if (largo) {
    return deudor === 'rodrigo'
      ? `Rodrigo debe pagar $${monto} a Sergio`
      : `Sergio debe pagar $${monto} a Rodrigo`
  }
  return deudor === 'rodrigo' ? `R → S: $${monto}` : `S → R: $${monto}`
}

/**
 * Ajustes de liquidación del mes.
 *
 * Todo lo que se acordó entre los socios y no pasó por ingresos ni por gastos:
 * un adelanto, algo que uno puso de su bolsillo, la mitad de un acuerdo de
 * palabra. El monto se aplica entero a la liquidación.
 */
function AjustesDelMes({
  month,
  label,
  adjustments,
  rate,
  ajusteNeto,
  crearAjuste,
  guardando,
  estado,
  onEliminar,
  borrando,
}: {
  month: string
  label: string
  adjustments: AdjustmentItem[]
  rate: number
  ajusteNeto: number
  crearAjuste: (formData: FormData) => void
  guardando: boolean
  estado: { success: boolean; message?: string } | null
  onEliminar: (id: string) => void
  borrando: boolean
}) {
  const campo =
    'mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-black'
  const etiqueta = 'block text-[11px] font-medium uppercase tracking-wide text-gray-500'

  return (
    <div className="border-b border-gray-200 bg-amber-50/40 px-6 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {/* El mes va en el título: el panel se dibuja arriba de su propia fila,
            así que sin nombrarlo se lee como si fuera del mes de más arriba. */}
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
          Ajustes de liquidación de {label}
        </h4>
        {ajusteNeto !== 0 && (
          <span className="text-xs text-gray-600">
            Neto:{' '}
            <span className="font-semibold text-gray-900">
              $ {Math.abs(ajusteNeto).toLocaleString('es-AR', { maximumFractionDigits: 0 })} a favor
              de {ajusteNeto > 0 ? 'Sergio' : 'Rodrigo'}
            </span>
          </span>
        )}
      </div>

      {adjustments.length > 0 && (
        <ul className="mt-2 divide-y divide-amber-200/60 border-y border-amber-200/60">
          {adjustments.map((a) => (
            // En el teléfono la descripción baja a su propio renglón. Apretada
            // entre el monto y la fecha quedaba en una columna de cuatro
            // palabras por línea.
            // El botón vive fuera del bloque que envuelve: si entra en el
            // mismo flex, un monto en dólares con su conversión lo empuja a un
            // renglón propio.
            <li key={a.id} className="flex items-start gap-2 py-2 text-xs">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`order-1 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium ${
                    a.favor === 'sergio' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {a.favor === 'sergio' ? 'Sergio' : 'Rodrigo'}
                </span>
                <span className="order-4 w-full min-w-0 text-gray-700 sm:order-2 sm:w-auto sm:flex-1">
                  {a.description}
                </span>
                <span className="order-2 shrink-0 text-[11px] text-gray-400 sm:order-3">
                  {format(new Date(a.created_at), 'dd/MM/yy')}
                </span>
                <span className="order-3 shrink-0 font-semibold tabular-nums text-gray-900 sm:order-4">
                  {a.currency === 'USD'
                    ? `USD ${a.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
                    : `$ ${a.amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
                  {a.currency === 'USD' && (
                    <span className="ml-1 text-[11px] font-normal text-gray-400">
                      ≈ $ {(a.amount * rate).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </span>
              </div>
              <IconButton
                icon={Trash2}
                label="Eliminar ajuste"
                tono="peligro"
                ocupado={borrando}
                onClick={() => onEliminar(a.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <form action={crearAjuste} className="mt-3 flex flex-wrap items-end gap-2">
        <input type="hidden" name="month" value={month} />
        <div className="flex flex-col">
          <label htmlFor={`favor-${month}`} className={etiqueta}>
            A favor de
          </label>
          <select id={`favor-${month}`} name="favor" defaultValue="sergio" className={campo}>
            <option value="sergio">Sergio</option>
            <option value="rodrigo">Rodrigo</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor={`monto-${month}`} className={etiqueta}>
            Monto
          </label>
          <input
            type="number"
            id={`monto-${month}`}
            name="amount"
            min={1}
            step="any"
            required
            placeholder="0"
            className={`${campo} w-32`}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={`moneda-${month}`} className={etiqueta}>
            Moneda
          </label>
          <select id={`moneda-${month}`} name="currency" defaultValue="ARS" className={campo}>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div className="flex min-w-[16rem] flex-1 flex-col">
          <label htmlFor={`detalle-${month}`} className={etiqueta}>
            De qué se trata
          </label>
          <input
            type="text"
            id={`detalle-${month}`}
            name="description"
            required
            maxLength={200}
            placeholder={`Ej: adelanto de ${label.split(' ')[0]}`}
            className={campo}
          />
        </div>
        <button
          type="submit"
          disabled={guardando}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
        >
          {guardando ? 'Guardando...' : 'Agregar'}
        </button>
        {estado?.message && (
          <span className={`text-xs ${estado.success ? 'text-emerald-600' : 'text-red-600'}`}>
            {estado.message}
          </span>
        )}
      </form>

      <p className="mt-2 text-[11px] text-gray-500">
        El monto se suma entero a la liquidación, después del reparto por mitades. No cambia
        ingresos ni egresos.
      </p>
    </div>
  )
}

export function BalanceClient({
  initialIncome,
  initialExpenses,
  initialAdjustments,
  usdRates,
}: {
  initialIncome: IncomeItem[]
  initialExpenses: ExpenseItem[]
  initialAdjustments: AdjustmentItem[]
  usdRates: UsdRates
}) {
  // Cada mes convierte con su propia cotización: los dólares de mayo no valen
  // los pesos de hoy. El total es la suma de los meses ya convertidos.
  const [rateState, saveRate, savingRate] = useActionState(saveUsdRateAction, null)
  const [ajusteState, crearAjuste, guardandoAjuste] = useActionState(crearAjusteAction, null)
  const [borrando, iniciarBorrado] = useTransition()
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)

  const eliminarAjuste = (id: string) => {
    if (!confirm('¿Eliminar este ajuste? La liquidación del mes vuelve a calcularse sin él.')) return
    iniciarBorrado(async () => {
      await eliminarAjusteAction(id)
    })
  }

  const monthsData = useMemo(() => {
    const monthsMap = new Map<string, MonthData>()

    // El mes en curso siempre está, aunque todavía no haya movimiento: es el
    // único modo de poder cargarle un ajuste el día 1.
    const mesActual = new Date().toISOString().slice(0, 7)
    monthsMap.set(mesActual, mesVacio(mesActual))

    for (const item of initialIncome) {
      const monthKey = item.payment_date.slice(0, 7)
      if (!monthsMap.has(monthKey)) monthsMap.set(monthKey, mesVacio(monthKey))
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
      if (!monthsMap.has(monthKey)) monthsMap.set(monthKey, mesVacio(monthKey))
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

    for (const a of initialAdjustments) {
      if (!monthsMap.has(a.month)) monthsMap.set(a.month, mesVacio(a.month))
      monthsMap.get(a.month)!.adjustments.push(a)
    }

    const sorted = Array.from(monthsMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey))

    for (const m of sorted) {
      const [y, mo] = m.monthKey.split('-').map(Number)
      m.label = format(new Date(y, mo - 1, 1), "MMMM yyyy", { locale: es })
    }

    return sorted
  }, [initialIncome, initialExpenses, initialAdjustments])

  /**
   * Las cuentas de cada mes, hechas una sola vez.
   *
   * Escritorio y móvil muestran lo mismo con distinta forma. Cuando cada uno
   * repetía la aritmética, cualquier cambio había que acertarlo dos veces.
   */
  const filas = useMemo(() => {
    return monthsData.map((m) => {
      const rate = cotizacionDe(m.monthKey, usdRates)

      const sergioNeto =
        m.incomeSergioARS + m.incomeSergioUSD * rate -
        (m.expenseSergioARS + m.expenseSergioUSD * rate)
      const rodrigoNeto =
        m.incomeRodrigoARS + m.incomeRodrigoUSD * rate -
        (m.expenseRodrigoARS + m.expenseRodrigoUSD * rate)
      const netoTotal = sergioNeto + rodrigoNeto

      // El ajuste se aplica entero y después del reparto por mitades. Si
      // entrara como un ingreso más, la mitad se le iría al otro socio y el
      // número que se cargó no sería el que termina moviéndose.
      const ajusteNeto = m.adjustments.reduce((suma, a) => {
        const enPesos = a.currency === 'USD' ? a.amount * rate : a.amount
        return suma + (a.favor === 'sergio' ? enPesos : -enPesos)
      }, 0)

      const liquidacionBase = netoTotal / 2 - sergioNeto
      const liquidacion = liquidacionBase + ajusteNeto

      return {
        ...m,
        rate,
        sergioNeto,
        rodrigoNeto,
        netoTotal,
        ajusteNeto,
        liquidacionBase,
        liquidacion,
        totalIncomeArs: m.incomeSergioARS + m.incomeRodrigoARS,
        totalIncomeUsd: m.incomeSergioUSD + m.incomeRodrigoUSD,
        totalExpenseArs: m.expenseSergioARS + m.expenseRodrigoARS,
        totalExpenseUsd: m.expenseSergioUSD + m.expenseRodrigoUSD,
      }
    })
  }, [monthsData, usdRates])

  const totals = useMemo(() => {
    let totalIncomeARS = 0
    let totalIncomeUSD = 0
    let totalExpenseARS = 0
    let totalExpenseUSD = 0
    let totalNeto = 0

    for (const f of filas) {
      totalIncomeARS += f.totalIncomeArs
      totalIncomeUSD += f.totalIncomeUsd
      totalExpenseARS += f.totalExpenseArs
      totalExpenseUSD += f.totalExpenseUsd

      // Cada mes se cierra con su cotización antes de sumarse al total. Los
      // ajustes no entran acá: mueven plata de un socio al otro, no cambian
      // cuánto entró al estudio.
      totalNeto += f.netoTotal
    }

    return { totalIncomeARS, totalIncomeUSD, totalExpenseARS, totalExpenseUSD, totalNeto }
  }, [filas])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Balance Mensual</h1>
          <p className="mt-1 text-sm text-gray-500">Historial de ingresos, egresos y balance de los últimos 12 meses.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500">Cotización USD</p>
          <p className="mt-0.5 text-sm text-gray-900">
            Una por mes · {Object.keys(usdRates.porMes).length} cargada(s)
          </p>
          <p className="text-[11px] text-gray-400">
            Los meses sin cargar heredan la anterior. Se edita abriendo el mes.
          </p>
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
            $ {totals.totalNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
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
              {filas.map((m) => {
                const { rate, sergioNeto, rodrigoNeto, netoTotal, liquidacion } = m
                const { totalIncomeArs, totalIncomeUsd, totalExpenseArs, totalExpenseUsd } = m
                const isExpanded = expandedMonth === m.monthKey

                return (
                  <tr key={m.monthKey}>
                    {isExpanded ? (
                      <>
                        <td colSpan={10} className="p-0">
                          {/* Cotización del mes. Solo afecta la conversión de
                              este mes: el total suma cada mes ya convertido. */}
                          <form
                            action={saveRate}
                            className="flex flex-wrap items-end gap-2 border-b border-gray-200 bg-gray-50 px-6 py-3"
                          >
                            <input type="hidden" name="month" value={m.monthKey} />
                            <div>
                              <label
                                htmlFor={`rate-${m.monthKey}`}
                                className="block text-[11px] font-medium uppercase tracking-wide text-gray-500"
                              >
                                Cotización de {m.label}
                              </label>
                              <input
                                type="number"
                                id={`rate-${m.monthKey}`}
                                name="rate"
                                defaultValue={rate}
                                min={1}
                                step="any"
                                className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={savingRate}
                              className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
                            >
                              {savingRate ? 'Guardando...' : 'Guardar'}
                            </button>
                            {!usdRates.porMes[m.monthKey] && (
                              <span className="text-[11px] text-gray-500">
                                Heredada — este mes todavía no tiene una propia.
                              </span>
                            )}
                            {rateState?.message && (
                              <span className={`text-xs ${rateState.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                {rateState.message}
                              </span>
                            )}
                          </form>
                          <AjustesDelMes
                            month={m.monthKey}
                            label={m.label}
                            adjustments={m.adjustments}
                            rate={rate}
                            ajusteNeto={m.ajusteNeto}
                            crearAjuste={crearAjuste}
                            guardando={guardandoAjuste}
                            estado={ajusteState}
                            onEliminar={eliminarAjuste}
                            borrando={borrando}
                          />
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
                                  $ {sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </td>
                                <td className={`px-4 py-4 text-right font-medium ${rodrigoNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  $ {rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </td>
                                <td className={`px-4 py-4 text-right font-bold ${netoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  $ {netoTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                </td>
                                <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                  {textoLiquidacion(liquidacion)}
                                  {m.ajusteNeto !== 0 && (
                                    <span className="ml-1 text-[11px] font-normal text-amber-600">
                                      · ajustada
                                    </span>
                                  )}
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
                                    <DetailRow key={`inc-${i}`} income={inc} />
                                  ))}
                                </>
                              )}
                              {m.expenseDetails.length > 0 && (
                                <>
                                  {m.expenseDetails.map((exp, i) => (
                                    <DetailRow key={`exp-${i}`} expense={exp} />
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
                          $ {sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`px-4 py-4 text-right font-medium ${rodrigoNeto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          $ {rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className={`px-4 py-4 text-right font-bold ${netoTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          $ {netoTotal.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">
                          {textoLiquidacion(liquidacion)}
                          {m.ajusteNeto !== 0 && (
                            <span className="ml-1 text-[11px] font-normal text-amber-600">
                              · ajustada
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-10 text-center text-gray-500">No hay datos en los últimos 12 meses.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden divide-y divide-gray-100">
          {filas.map((m) => {
            const { rate, sergioNeto, rodrigoNeto, liquidacion } = m
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
                      <span>Neto Sergio: <span className={sergioNeto >= 0 ? 'text-green-600' : 'text-red-600'}>${sergioNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></span>
                      <span>Neto Rodrigo: <span className={rodrigoNeto >= 0 ? 'text-green-600' : 'text-red-600'}>${rodrigoNeto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></span>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      <p className="font-semibold">{textoLiquidacion(liquidacion, true)}</p>
                      {m.ajusteNeto !== 0 && (
                        <p className="mt-0.5 text-xs text-amber-700">
                          Incluye ${Math.abs(m.ajusteNeto).toLocaleString('es-AR', { maximumFractionDigits: 0 })} de
                          ajustes a favor de {m.ajusteNeto > 0 ? 'Sergio' : 'Rodrigo'}.
                        </p>
                      )}
                    </div>
                    <div className="-mx-4 overflow-hidden">
                      <AjustesDelMes
                        month={m.monthKey}
                        label={m.label}
                        adjustments={m.adjustments}
                        rate={rate}
                        ajusteNeto={m.ajusteNeto}
                        crearAjuste={crearAjuste}
                        guardando={guardandoAjuste}
                        estado={ajusteState}
                        onEliminar={eliminarAjuste}
                        borrando={borrando}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {filas.length === 0 && (
            <div className="px-4 py-10 text-center text-gray-500 text-sm">No hay datos en los últimos 12 meses.</div>
          )}
        </div>
      </div>
    </div>
  )
}
