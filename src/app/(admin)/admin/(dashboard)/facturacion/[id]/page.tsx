import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { formatearCuit } from '@/lib/cuit'
import { etiquetaCondicionIva } from '@/lib/arca-receptor'
import { fechaLocal } from '@/lib/fecha'
import { urlQR } from '@/lib/arca/qr'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BotonImprimir } from './BotonImprimir'

export const metadata = { title: 'Comprobante' }

type Linea = { descripcion: string; cantidad: number; precioUnitario: number }

type EmisorComprobante = {
  razon_social: string
  cuit: number
  domicilio: string | null
  condicion_fiscal: string
  pie_comprobante: string | null
  ingresos_brutos: string | null
  inicio_actividades: string | null
}

const NOMBRE_CBTE: Record<number, { nombre: string; letra: string; codigo: string }> = {
  1: { nombre: 'FACTURA', letra: 'A', codigo: '001' },
  6: { nombre: 'FACTURA', letra: 'B', codigo: '006' },
  11: { nombre: 'FACTURA', letra: 'C', codigo: '011' },
  13: { nombre: 'NOTA DE CRÉDITO', letra: 'C', codigo: '013' },
}

function pesos(n: number): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function unico<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] ?? null : v
}

export default async function ComprobantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: c } = await supabase
    .from('arca_comprobantes')
    .select(
      `id, numero, pto_vta, cbte_tipo, estado, entorno, cae, cae_vto, doc_tipo, doc_nro,
       cond_iva_receptor, receptor_nombre, receptor_domicilio, concepto, detalle,
       importe_total, importe_neto, moneda, observaciones, created_at,
       arca_emisores ( razon_social, cuit, domicilio, condicion_fiscal, pie_comprobante,
                       ingresos_brutos, inicio_actividades )`,
    )
    .eq('id', id)
    .single()

  if (!c) notFound()

  // Supabase tipa la relación anidada como array; normalizeRelation la aplana.
  const emisor = unico(c.arca_emisores as unknown as EmisorComprobante | EmisorComprobante[] | null)

  const tipo = NOMBRE_CBTE[c.cbte_tipo] ?? {
    nombre: 'COMPROBANTE',
    letra: '',
    codigo: String(c.cbte_tipo).padStart(3, '0'),
  }
  const lineas: Linea[] = (c.detalle as { lineas?: Linea[] } | null)?.lineas ?? []
  const fecha = fechaLocal(c.created_at)
  const autorizado = c.estado === 'autorizado' && c.cae

  // El QR de la RG 4892 codifica los datos del comprobante para que cualquiera
  // pueda verificarlo contra ARCA. Solo tiene sentido si hay CAE.
  const qr =
    autorizado && emisor
      ? await QRCode.toDataURL(
          urlQR({
            fecha: format(fecha, 'yyyy-MM-dd'),
            cuit: Number(emisor.cuit),
            ptoVta: c.pto_vta,
            tipoCmp: c.cbte_tipo,
            nroCmp: c.numero,
            importe: Number(c.importe_total),
            moneda: c.moneda ?? 'PES',
            tipoDocRec: c.doc_tipo,
            nroDocRec: Number(c.doc_nro),
            codAut: c.cae!,
          }),
          { margin: 1, width: 220 },
        )
      : null

  const observaciones = (c.observaciones ?? []) as { Code: number; Msg: string }[]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/admin/facturacion"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Volver a Facturación
        </Link>
        <BotonImprimir />
      </div>

      {c.entorno === 'homologacion' && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 print:hidden">
          Comprobante de <strong>homologación</strong>. Es una prueba y no tiene validez fiscal.
        </p>
      )}

      {!autorizado && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 print:hidden">
          <p className="font-medium">Este comprobante no está autorizado ({c.estado}).</p>
          {observaciones.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5 text-xs">
              {observaciones.map((o, i) => (
                <li key={i}>
                  [{o.Code}] {o.Msg}
                </li>
              ))}
            </ul>
          )}
          {c.estado === 'pendiente' && (
            <p className="mt-2 text-xs">
              Puede tener CAE en ARCA aunque no lo hayamos recibido. No lo vuelvas a emitir sin
              verificarlo primero.
            </p>
          )}
        </div>
      )}

      {/* --- el comprobante ------------------------------------------------ */}
      <article className="border border-gray-300 bg-white p-8 text-sm text-gray-900 print:border-0 print:p-0">
        <header className="relative border-b-2 border-gray-900 pb-4">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 border border-gray-900 bg-white px-3 py-1 text-center">
            <p className="text-2xl font-bold leading-none">{tipo.letra}</p>
            <p className="text-[10px] leading-tight">COD. {tipo.codigo}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-lg font-bold uppercase">{emisor?.razon_social}</p>
              {emisor?.domicilio && <p className="mt-1 text-xs">{emisor.domicilio}</p>}
              <p className="mt-2 text-xs">
                Condición frente al IVA:{' '}
                {emisor?.condicion_fiscal === 'monotributo'
                  ? 'Responsable Monotributo'
                  : emisor?.condicion_fiscal === 'exento'
                    ? 'IVA Sujeto Exento'
                    : 'Responsable Inscripto'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold">{tipo.nombre}</p>
              <p className="mt-1 font-mono text-sm">
                Punto de Venta: {String(c.pto_vta).padStart(5, '0')} &nbsp; Comp. Nro:{' '}
                {String(c.numero).padStart(8, '0')}
              </p>
              <p className="mt-2 text-xs">
                Fecha de Emisión: {format(fecha, 'dd/MM/yyyy')}
              </p>
              <p className="text-xs">CUIT: {formatearCuit(emisor?.cuit ?? '')}</p>
              {emisor?.ingresos_brutos && (
                <p className="text-xs">Ingresos Brutos: {emisor.ingresos_brutos}</p>
              )}
              {emisor?.inicio_actividades && (
                <p className="text-xs">
                  Inicio de Actividades: {format(fechaLocal(emisor.inicio_actividades), 'dd/MM/yyyy')}
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="border-b border-gray-300 py-4">
          <p className="text-xs">
            <span className="text-gray-500">Apellido y Nombre / Razón Social: </span>
            <span className="font-medium">{c.receptor_nombre ?? 'Consumidor Final'}</span>
          </p>
          <p className="text-xs">
            <span className="text-gray-500">
              {c.doc_tipo === 80 ? 'CUIT: ' : 'Documento: '}
            </span>
            {c.doc_tipo === 80 ? formatearCuit(String(c.doc_nro)) : String(c.doc_nro)}
          </p>
          {c.receptor_domicilio && (
            <p className="text-xs">
              <span className="text-gray-500">Domicilio: </span>
              {c.receptor_domicilio}
            </p>
          )}
          <p className="text-xs">
            <span className="text-gray-500">Condición frente al IVA: </span>
            {etiquetaCondicionIva(c.cond_iva_receptor)}
          </p>
        </section>

        <table className="w-full border-collapse py-4 text-xs">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="py-2">Producto / Servicio</th>
              <th className="py-2 text-right">Cantidad</th>
              <th className="py-2 text-right">Precio Unit.</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{l.descripcion}</td>
                <td className="py-2 text-right">{l.cantidad}</td>
                <td className="py-2 text-right">{pesos(l.precioUnitario)}</td>
                <td className="py-2 text-right">{pesos(l.cantidad * l.precioUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 text-sm">
            <div className="flex justify-between border-t border-gray-900 py-2 font-bold">
              <span>Importe Total:</span>
              <span>${pesos(Number(c.importe_total))}</span>
            </div>
          </div>
        </div>

        <footer className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-gray-300 pt-4">
          {qr && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={qr} alt="Código QR del comprobante" className="h-28 w-28" />
          )}
          <div className="text-right text-xs">
            {autorizado ? (
              <>
                <p className="font-semibold">CAE N°: {c.cae}</p>
                <p>
                  Fecha de Vto. de CAE:{' '}
                  {c.cae_vto ? format(fechaLocal(c.cae_vto), 'dd/MM/yyyy') : '—'}
                </p>
                <p className="mt-1 text-gray-500">Comprobante Autorizado</p>
              </>
            ) : (
              <p className="font-semibold text-red-600">SIN CAE — {c.estado}</p>
            )}
          </div>
        </footer>

        {emisor?.pie_comprobante && (
          <p className="mt-6 text-center text-[11px] text-gray-500">{emisor.pie_comprobante}</p>
        )}
      </article>

      <p className="mt-4 text-xs text-gray-400 print:hidden">
        Emitido el {format(fechaLocal(c.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}.
      </p>
    </div>
  )
}
