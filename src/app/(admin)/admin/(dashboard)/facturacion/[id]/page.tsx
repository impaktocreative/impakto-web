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

const CONCEPTO: Record<number, string> = {
  1: 'Productos',
  2: 'Servicios',
  3: 'Productos y Servicios',
}

const CONDICION_EMISOR: Record<string, string> = {
  monotributo: 'Responsable Monotributo',
  exento: 'IVA Sujeto Exento',
}

function pesos(n: number): string {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function unico<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null
  return Array.isArray(v) ? v[0] ?? null : v
}

/** Rótulo de sección: versalitas sobre filete. Ordena sin agregar cajas. */
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b border-neutral-900 pb-1 text-[7.5pt] font-semibold uppercase tracking-[0.16em] text-neutral-500">
      {children}
    </p>
  )
}

/** Par etiqueta/valor de una sola línea. La etiqueta no compite con el dato. */
function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <p className="flex gap-1.5 leading-[1.5]">
      <span className="shrink-0 text-neutral-500">{etiqueta}</span>
      <span className="font-medium text-neutral-900">{children}</span>
    </p>
  )
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

  // Supabase tipa la relación anidada como array; unico() la aplana.
  const emisor = unico(c.arca_emisores as unknown as EmisorComprobante | EmisorComprobante[] | null)

  const tipo = NOMBRE_CBTE[c.cbte_tipo] ?? {
    nombre: 'COMPROBANTE',
    letra: '',
    codigo: String(c.cbte_tipo).padStart(3, '0'),
  }
  const lineas: Linea[] = (c.detalle as { lineas?: Linea[] } | null)?.lineas ?? []
  const fecha = fechaLocal(c.created_at)
  const autorizado = c.estado === 'autorizado' && c.cae
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precioUnitario, 0)

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
          { margin: 0, width: 320 },
        )
      : null

  const observaciones = (c.observaciones ?? []) as { Code: number; Msg: string }[]

  return (
    <div className="mx-auto max-w-[210mm]">
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

      {/* ── La hoja ──────────────────────────────────────────────────────────
          Mide un A4 real y no un ancho de pantalla: lo que se ve es lo que se
          imprime, sin una segunda maqueta que mantener. El texto va en puntos
          y no en píxeles, que es la unidad del papel. */}
      <article className="hoja-comprobante relative mx-auto w-[210mm] min-h-[297mm] bg-white px-[15mm] py-[14mm] text-[8.5pt] leading-[1.45] text-neutral-900 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.35)] ring-1 ring-neutral-200 print:shadow-none print:ring-0">
        {/* Marca de agua de prueba. Va dentro de la hoja y también se imprime:
            un comprobante de homologación que sale por la impresora sin nada
            que lo distinga es un problema esperando a pasar. */}
        {c.entorno === 'homologacion' && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <span className="-rotate-[28deg] text-[54pt] font-bold uppercase tracking-[0.2em] text-neutral-900/[0.055]">
              Sin validez fiscal
            </span>
          </span>
        )}

        <div className="relative flex min-h-[269mm] flex-col">
          {/* ── Encabezado ───────────────────────────────────────────────────
              Dos mitades separadas por una vertical, con el recuadro de la
              letra montado sobre la línea. Es la disposición canónica de un
              comprobante argentino, y respetarla es parte de que se lea como
              un documento fiscal y no como un recibo cualquiera. */}
          <header className="relative border-b-[1.5px] border-neutral-900 pb-5">
            <div
              aria-hidden={!tipo.letra}
              className="absolute left-1/2 top-[-6mm] z-10 flex h-[17mm] w-[17mm] -translate-x-1/2 flex-col items-center justify-center border-[1.5px] border-neutral-900 bg-white"
            >
              <span className="text-[26pt] font-bold leading-none tracking-tight">{tipo.letra}</span>
              <span className="mt-1 text-[6.5pt] font-medium tracking-[0.08em] text-neutral-600">
                COD. {tipo.codigo}
              </span>
            </div>

            <div className="grid grid-cols-2">
              <div className="pr-[14mm]">
                <p className="text-[13pt] font-bold uppercase leading-tight tracking-tight">
                  {emisor?.razon_social}
                </p>
                <div className="mt-3 space-y-0.5">
                  {emisor?.domicilio && <Dato etiqueta="Domicilio">{emisor.domicilio}</Dato>}
                  <Dato etiqueta="Condición frente al IVA">
                    {CONDICION_EMISOR[emisor?.condicion_fiscal ?? ''] ?? 'Responsable Inscripto'}
                  </Dato>
                </div>
              </div>

              <div className="border-l border-neutral-300 pl-[14mm]">
                <p className="text-[13pt] font-bold uppercase leading-tight tracking-tight">
                  {tipo.nombre}
                </p>
                <p className="mt-1.5 text-[11pt] font-semibold tabular-nums tracking-tight">
                  {String(c.pto_vta).padStart(5, '0')}
                  <span className="mx-1.5 font-normal text-neutral-400">–</span>
                  {String(c.numero).padStart(8, '0')}
                </p>
                <div className="mt-3 space-y-0.5">
                  <Dato etiqueta="Fecha de emisión">
                    <span className="tabular-nums">{format(fecha, 'dd/MM/yyyy')}</span>
                  </Dato>
                  <Dato etiqueta="CUIT">
                    <span className="tabular-nums">{formatearCuit(emisor?.cuit ?? '')}</span>
                  </Dato>
                  {emisor?.ingresos_brutos && (
                    <Dato etiqueta="Ingresos Brutos">
                      <span className="tabular-nums">{emisor.ingresos_brutos}</span>
                    </Dato>
                  )}
                  {emisor?.inicio_actividades && (
                    <Dato etiqueta="Inicio de actividades">
                      <span className="tabular-nums">
                        {format(fechaLocal(emisor.inicio_actividades), 'dd/MM/yyyy')}
                      </span>
                    </Dato>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ── Receptor ─────────────────────────────────────────────────── */}
          <section className="mt-6">
            <Rotulo>Datos del receptor</Rotulo>
            <div className="mt-2.5 grid grid-cols-2 gap-x-[14mm] gap-y-0.5">
              <Dato etiqueta="Razón social">{c.receptor_nombre ?? 'Consumidor Final'}</Dato>
              <Dato etiqueta={c.doc_tipo === 80 ? 'CUIT' : 'Documento'}>
                <span className="tabular-nums">
                  {c.doc_tipo === 80 ? formatearCuit(String(c.doc_nro)) : String(c.doc_nro)}
                </span>
              </Dato>
              {c.receptor_domicilio && <Dato etiqueta="Domicilio">{c.receptor_domicilio}</Dato>}
              <Dato etiqueta="Condición frente al IVA">
                {etiquetaCondicionIva(c.cond_iva_receptor)}
              </Dato>
              {CONCEPTO[c.concepto] && <Dato etiqueta="Concepto">{CONCEPTO[c.concepto]}</Dato>}
            </div>
          </section>

          {/* ── Detalle ──────────────────────────────────────────────────────
              Las cifras van en cifras tabulares: sin eso las columnas de
              importes no alinean sus unidades y la tabla se lee torcida. */}
          <section className="mt-7">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-[1.5px] border-neutral-900 text-[7.5pt] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  <th className="w-[52%] py-2 text-left font-semibold">Producto o servicio</th>
                  <th className="py-2 text-right font-semibold">Cant.</th>
                  <th className="py-2 text-right font-semibold">Precio unit.</th>
                  <th className="py-2 text-right font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lineas.map((l, i) => (
                  <tr key={i} className="border-b border-neutral-200 break-inside-avoid align-top">
                    <td className="py-2.5 pr-4">{l.descripcion}</td>
                    <td className="py-2.5 text-right tabular-nums">{l.cantidad}</td>
                    <td className="py-2.5 text-right tabular-nums">{pesos(l.precioUnitario)}</td>
                    <td className="py-2.5 text-right font-medium tabular-nums">
                      {pesos(l.cantidad * l.precioUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Totales ────────────────────────────────────────────────────── */}
          <section className="mt-5 flex justify-end break-inside-avoid">
            <div className="w-[78mm]">
              {lineas.length > 1 && (
                <div className="flex items-baseline justify-between py-1.5 text-neutral-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">$ {pesos(subtotal)}</span>
                </div>
              )}
              <div className="mt-1 flex items-baseline justify-between border-t-[1.5px] border-neutral-900 bg-neutral-900 px-3 py-2.5 text-white">
                <span className="text-[7.5pt] font-semibold uppercase tracking-[0.16em]">
                  Importe total
                </span>
                <span className="text-[12pt] font-bold tabular-nums tracking-tight">
                  $ {pesos(Number(c.importe_total))}
                </span>
              </div>
            </div>
          </section>

          {/* ── Autorización ─────────────────────────────────────────────────
              El QR y el CAE son lo que vuelve verificable al comprobante, así
              que cierran la hoja con su propio bloque en vez de quedar como
              una nota al pie. */}
          <footer className="mt-auto flex items-start justify-between gap-[10mm] border-t border-neutral-300 pt-8 break-inside-avoid">
            <div className="flex items-start gap-4">
              {qr ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qr} alt="Código QR del comprobante" className="h-[26mm] w-[26mm]" />
              ) : (
                <div className="flex h-[26mm] w-[26mm] items-center justify-center border border-dashed border-neutral-300 text-center text-[7pt] text-neutral-400">
                  Sin QR
                </div>
              )}
              <p className="max-w-[52mm] pt-1 text-[7pt] leading-[1.5] text-neutral-500">
                Comprobante autorizado por ARCA. El código QR permite verificarlo contra los
                registros del organismo.
              </p>
            </div>

            <div className="min-w-[62mm] text-right">
              {autorizado ? (
                <>
                  <p className="text-[7.5pt] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    CAE N°
                  </p>
                  <p className="mt-0.5 text-[13pt] font-bold tabular-nums leading-none tracking-tight">
                    {c.cae}
                  </p>
                  <p className="mt-2 text-neutral-600">
                    Vencimiento del CAE{' '}
                    <span className="font-medium tabular-nums text-neutral-900">
                      {c.cae_vto ? format(fechaLocal(c.cae_vto), 'dd/MM/yyyy') : '—'}
                    </span>
                  </p>
                </>
              ) : (
                <p className="text-[10pt] font-bold uppercase tracking-[0.1em] text-red-600">
                  Sin CAE · {c.estado}
                </p>
              )}
            </div>
          </footer>

          {emisor?.pie_comprobante && (
            <p className="mt-6 border-t border-neutral-200 pt-3 text-center text-[7pt] leading-relaxed text-neutral-500">
              {emisor.pie_comprobante}
            </p>
          )}
        </div>
      </article>

      <p className="mt-4 text-xs text-gray-400 print:hidden">
        Emitido el {format(fechaLocal(c.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })}.
        {c.entorno === 'homologacion' && ' Comprobante de homologación: es una prueba y no tiene validez fiscal.'}
      </p>
    </div>
  )
}
