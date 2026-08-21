'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react'
import { emitirFacturaAction, type EstadoEmision } from './actions'
import { formatearCuit } from '@/lib/cuit'
import { CONDICIONES_IVA_RECEPTOR, etiquetaCondicionIva } from '@/lib/arca-receptor'

export type EmisorOpcion = {
  id: string
  clave: string
  razon_social: string
  cuit: number
  pto_vta: number
  entorno: string
}

export type ClienteOpcion = {
  id: string
  brand_name: string
  razon_social: string | null
  cuit: string | null
  cond_iva_receptor: number | null
}

type Linea = { descripcion: string; cantidad: string; precio: string }

const LINEA_VACIA: Linea = { descripcion: '', cantidad: '1', precio: '' }

function hoy(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function NuevaFacturaForm({
  emisores,
  clientes,
}: {
  emisores: EmisorOpcion[]
  clientes: ClienteOpcion[]
}) {
  const [state, formAction, isPending] = useActionState<EstadoEmision | null, FormData>(
    emitirFacturaAction,
    null,
  )
  const [emisorId, setEmisorId] = useState(emisores[0]?.id ?? '')
  const [clienteId, setClienteId] = useState('')
  const [lineas, setLineas] = useState<Linea[]>([{ ...LINEA_VACIA }])

  const emisor = emisores.find(e => e.id === emisorId)
  const cliente = clientes.find(c => c.id === clienteId)

  const total = useMemo(
    () =>
      lineas.reduce((acc, l) => {
        const c = Number(l.cantidad)
        const p = Number(l.precio)
        return acc + (Number.isFinite(c) && Number.isFinite(p) ? c * p : 0)
      }, 0),
    [lineas],
  )

  const editar = (i: number, campo: keyof Linea, valor: string) =>
    setLineas(prev => prev.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)))

  const fechaHoy = hoy()

  if (emisores.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Ningún emisor tiene el CUIT cargado.{' '}
        <Link href="/admin/settings" className="font-medium underline">
          Cargalo en Configuración
        </Link>{' '}
        antes de facturar.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {emisor?.entorno === 'homologacion' && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{emisor.razon_social}</strong> está en homologación. Los comprobantes que emitas
          son de prueba y no tienen validez fiscal.
        </p>
      )}
      {emisor?.entorno === 'produccion' && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Producción.</strong> Esta factura es un comprobante fiscal real y entra en la
          declaración de {emisor.razon_social}. Un comprobante emitido no se borra: se corrige con
          nota de crédito.
        </p>
      )}

      {/* --- emisor y receptor ------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="emisor_id" className="mb-1 block text-sm font-medium text-gray-700">
            Emite
          </label>
          <select
            id="emisor_id"
            name="emisor_id"
            value={emisorId}
            onChange={e => setEmisorId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {emisores.map(e => (
              <option key={e.id} value={e.id}>
                {e.razon_social} — {formatearCuit(e.cuit)} — PV {e.pto_vta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="client_id" className="mb-1 block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            id="client_id"
            name="client_id"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Receptor suelto (cargar a mano)</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>
                {c.razon_social ?? c.brand_name}
                {c.cuit ? ` — ${formatearCuit(c.cuit)}` : ' — sin CUIT'}
              </option>
            ))}
          </select>
          {cliente && (
            <p className="mt-1 text-xs text-gray-500">
              {cliente.cuit ? formatearCuit(cliente.cuit) : 'Sin CUIT, va como consumidor final'} ·{' '}
              {etiquetaCondicionIva(cliente.cond_iva_receptor)}
            </p>
          )}
        </div>
      </div>

      {/* Receptor manual: solo cuando no se eligió un cliente cargado. */}
      {!clienteId && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="receptor_nombre" className="mb-1 block text-sm font-medium text-gray-700">
              Razón social del receptor
            </label>
            <input
              id="receptor_nombre"
              name="receptor_nombre"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="receptor_cuit" className="mb-1 block text-sm font-medium text-gray-700">
              CUIT <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              id="receptor_cuit"
              name="receptor_cuit"
              type="text"
              placeholder="20-12345678-9"
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <p className="mt-1 text-xs text-gray-500">Sin CUIT va como consumidor final.</p>
          </div>
          <div>
            <label
              htmlFor="receptor_cond_iva"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Condición frente al IVA
            </label>
            <select
              id="receptor_cond_iva"
              name="receptor_cond_iva"
              defaultValue={5}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              {CONDICIONES_IVA_RECEPTOR.map(c => (
                <option key={c.codigo} value={c.codigo}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="receptor_domicilio"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Domicilio <span className="font-normal text-gray-400">(solo para el PDF)</span>
            </label>
            <input
              id="receptor_domicilio"
              name="receptor_domicilio"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      )}

      {/* --- detalle ------------------------------------------------------ */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">Detalle</p>
        <div className="flex flex-col gap-2">
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                name="linea_descripcion"
                value={l.descripcion}
                onChange={e => editar(i, 'descripcion', e.target.value)}
                placeholder="Servicio de Diseño y Administración Web"
                className="col-span-12 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black sm:col-span-6"
              />
              <input
                name="linea_cantidad"
                value={l.cantidad}
                onChange={e => editar(i, 'cantidad', e.target.value)}
                type="number"
                step="any"
                min="0"
                placeholder="Cant."
                className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black sm:col-span-2"
              />
              <input
                name="linea_precio"
                value={l.precio}
                onChange={e => editar(i, 'precio', e.target.value)}
                type="number"
                step="any"
                min="0"
                placeholder="Precio unitario"
                className="col-span-7 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black sm:col-span-3"
              />
              <button
                type="button"
                onClick={() => setLineas(prev => prev.filter((_, j) => j !== i))}
                disabled={lineas.length === 1}
                aria-label="Quitar línea"
                title="Quitar línea"
                className="col-span-2 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 sm:col-span-1"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLineas(prev => [...prev, { ...LINEA_VACIA }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <Plus size={15} />
          Agregar línea
        </button>

        <p className="mt-3 text-right text-lg font-semibold text-gray-900">
          Total: ${total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* --- fechas ------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label htmlFor="fecha" className="mb-1 block text-sm font-medium text-gray-700">
            Fecha
          </label>
          <input
            id="fecha"
            name="fecha"
            type="date"
            defaultValue={fechaHoy}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="serv_desde" className="mb-1 block text-sm font-medium text-gray-700">
            Período desde
          </label>
          <input
            id="serv_desde"
            name="serv_desde"
            type="date"
            defaultValue={fechaHoy}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="serv_hasta" className="mb-1 block text-sm font-medium text-gray-700">
            Hasta
          </label>
          <input
            id="serv_hasta"
            name="serv_hasta"
            type="date"
            defaultValue={fechaHoy}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label htmlFor="vto_pago" className="mb-1 block text-sm font-medium text-gray-700">
            Vence el pago
          </label>
          <input
            id="vto_pago"
            name="vto_pago"
            type="date"
            defaultValue={fechaHoy}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-gray-500">
        El período es obligatorio en comprobantes de servicios. Si es un cobro puntual, van los tres
        con la misma fecha.
      </p>

      {state && !state.success && (
        <p className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      )}

      {state?.success && (
        <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
          <CheckCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            {state.mensaje}
            <Link href={`/admin/facturacion/${state.id}`} className="ml-2 font-medium underline">
              Ver el comprobante
            </Link>
          </span>
        </div>
      )}

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending || total <= 0}
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? 'Pidiendo CAE a ARCA...' : 'Emitir factura'}
        </button>
      </div>
    </form>
  )
}
