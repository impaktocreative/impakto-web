'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { crearNotaAction, editarNotaAction, eliminarNotaAction } from './actions'
import { IconButton } from '../../ui/IconButton'

type Nota = {
  id: string
  body: string
  created_at: string
  updated_at: string
}

const CAMPO =
  'w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 ' +
  'placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10'

/**
 * Cuándo se escribió.
 *
 * Hoy y ayer se dicen con esa palabra: en un bloc que se mira todos los días,
 * "hoy 14:32" ubica de un vistazo y una fecha completa hay que leerla.
 */
function cuando(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return `Hoy · ${format(d, 'HH:mm')}`
  if (isYesterday(d)) return `Ayer · ${format(d, 'HH:mm')}`
  return format(d, "d 'de' MMMM 'de' yyyy · HH:mm", { locale: es })
}

/** Una edición cuenta como tal recién pasado un segundo de la creación. */
function fueEditada(n: Nota): boolean {
  return new Date(n.updated_at).getTime() - new Date(n.created_at).getTime() > 1000
}

/**
 * Cuándo se editó, en corto.
 *
 * Sin hora y sin año: repetir la fecha completa dejaba un pie de tres fechas y
 * dos horas, más largo que varias de las notas.
 */
function cuandoSeEdito(iso: string): string {
  const d = new Date(iso)
  if (isToday(d)) return 'hoy'
  if (isYesterday(d)) return 'ayer'
  return `el ${format(d, "d 'de' MMMM", { locale: es })}`
}

function Tarjeta({
  nota,
  editando,
  onEditar,
  onCancelar,
  onEliminar,
  ocupado,
}: {
  nota: Nota
  editando: boolean
  onEditar: () => void
  onCancelar: () => void
  onEliminar: () => void
  ocupado: boolean
}) {
  const [estado, guardar, guardando] = useActionState(editarNotaAction, null)
  const areaRef = useRef<HTMLTextAreaElement>(null)

  // Al entrar en edición el cursor va al final, no al principio: se abre para
  // seguir escribiendo mucho más seguido que para corregir la primera palabra.
  useEffect(() => {
    if (!editando) return
    const area = areaRef.current
    if (!area) return
    area.focus()
    area.setSelectionRange(area.value.length, area.value.length)
  }, [editando])

  // El servidor ya revalidó y la nota llega actualizada por props: lo único
  // que queda es cerrar el editor.
  useEffect(() => {
    if (estado?.success) onCancelar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  if (editando) {
    return (
      <form action={guardar} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
        <input type="hidden" name="id" value={nota.id} />
        <textarea
          ref={areaRef}
          name="body"
          rows={5}
          maxLength={5000}
          defaultValue={nota.body}
          className={CAMPO}
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
          >
            <Check size={15} />
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <X size={15} />
            Cancelar
          </button>
          {estado?.message && !estado.success && (
            <span className="text-xs text-red-600">{estado.message}</span>
          )}
        </div>
      </form>
    )
  }

  return (
    <article className="group rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5 transition-shadow hover:shadow-md">
      {/* whitespace-pre-wrap: la nota se guarda con los saltos que le puso
          quien la escribió, y una lista sin ellos es un párrafo pegoteado. */}
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800">
        {nota.body}
      </p>
      {/* Los botones van en la línea de la fecha y no al lado del texto: en el
          teléfono le comían noventa píxeles de ancho y la nota quedaba en una
          columna de cinco palabras. */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="min-w-0 text-[11px] text-gray-400">
          {cuando(nota.created_at)}
          {fueEditada(nota) && (
            <span className="ml-1.5">· editada {cuandoSeEdito(nota.updated_at)}</span>
          )}
        </p>
        {/* Aparecen al pasar por encima. En el teléfono no hay hover, así que
            ahí quedan siempre visibles. */}
        <div className="flex shrink-0 gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
          <IconButton icon={Pencil} label="Editar nota" onClick={onEditar} />
          <IconButton
            icon={Trash2}
            label="Eliminar nota"
            tono="peligro"
            ocupado={ocupado}
            onClick={onEliminar}
          />
        </div>
      </div>
    </article>
  )
}

export function NotasClient({ initialNotas }: { initialNotas: Nota[] }) {
  const [estado, crear, creando] = useActionState(crearNotaAction, null)
  const [borrando, iniciarBorrado] = useTransition()
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // El campo se vacía recién cuando el servidor confirmó. Limpiarlo al enviar
  // se lleva puesto el texto si la acción falla.
  useEffect(() => {
    if (estado?.success) formRef.current?.reset()
  }, [estado])

  const eliminar = (id: string) => {
    if (!confirm('¿Eliminar esta nota? No se puede recuperar.')) return
    iniciarBorrado(async () => {
      await eliminarNotaAction(id)
    })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Notas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bloc compartido del panel. Lo que hay que acordarse, lo que se habló, lo que hay que
          revisar.
        </p>
      </div>

      <form
        ref={formRef}
        action={crear}
        className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5"
      >
        <label htmlFor="nota-nueva" className="sr-only">
          Escribir una nota
        </label>
        <textarea
          id="nota-nueva"
          name="body"
          rows={4}
          maxLength={5000}
          required
          placeholder="Escribí una nota…"
          className={CAMPO}
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={creando}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-300"
          >
            {creando ? 'Guardando...' : 'Guardar nota'}
          </button>
          {estado?.message && (
            <span className={`text-xs ${estado.success ? 'text-emerald-600' : 'text-red-600'}`}>
              {estado.message}
            </span>
          )}
        </div>
      </form>

      {initialNotas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
          <p className="text-sm text-gray-500">Todavía no hay notas.</p>
          <p className="mt-1 text-xs text-gray-400">La primera que escribas aparece acá.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialNotas.map((n) => (
            <Tarjeta
              key={n.id}
              nota={n}
              editando={editandoId === n.id}
              onEditar={() => setEditandoId(n.id)}
              onCancelar={() => setEditandoId(null)}
              onEliminar={() => eliminar(n.id)}
              ocupado={borrando}
            />
          ))}
        </div>
      )}
    </div>
  )
}
