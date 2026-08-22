import { Fragment, type ReactNode } from 'react'

/**
 * Convierte el texto del asesor en elementos con enlaces.
 *
 * Elementos React, nunca HTML inyectado. El texto viene de un modelo de
 * lenguaje, así que `dangerouslySetInnerHTML` acá es una inyección de scripts
 * esperando el prompt correcto.
 *
 * Las rutas internas se listan una por una. Un patrón abierto convertiría
 * alegremente una ruta alucinada en un enlace a un 404, y los modelos alucinan
 * rutas con entusiasmo.
 */

const RUTAS = '\\/(?:servicios|agencia|contacto|privacidad|terminos)(?:\\/[a-z0-9-]+)*'
const ENLACE = new RegExp(`((?:https?:\\/\\/|mailto:|tel:)[^\\s<>"']+|${RUTAS})`, 'g')

/**
 * Una ruta en medio de una frase se lee como un archivo, no como una
 * invitación. Se muestra con nombre.
 */
const NOMBRES: Record<string, string> = {
  '/contacto': 'pedir el diagnóstico',
  '/servicios': 'ver los servicios',
  '/agencia': 'conocer el estudio',
  '/privacidad': 'política de privacidad',
  '/terminos': 'términos y condiciones',
}

/**
 * Saca el markdown de la salida del modelo.
 *
 * El prompt lo prohíbe y el modelo lo pone igual: llegaban asteriscos a
 * pantalla, "**05 Optimización.**" tal cual. Una regla de prompt es una
 * preferencia, no una garantía, así que la garantía va acá.
 *
 * No se convierte a negrita: el panel es prosa plana a propósito, y una
 * respuesta con jerarquías tipográficas se lee como documento, no como alguien
 * contestando.
 */
function sinMarkdown(texto: string): string {
  return (
    texto
      // Enlaces: queda el destino, para que el enlazador de abajo lo tome y le
      // ponga su nombre propio.
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, etiqueta, destino) =>
        /^(https?:\/\/|mailto:|tel:|\/)/.test(destino) ? destino : etiqueta,
      )
      .replace(/(\*\*|__)(.+?)\1/g, "$2")
      .replace(/(?<![*\w])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![*\w])/g, "$1")
      .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
      // Encabezados y viñetas al principio de línea.
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}[-*+]\s+/gm, "")
      .replace(/^\s{0,3}>\s?/gm, "")
      // Reglas horizontales, que quedaban como una fila de guiones sueltos.
      .replace(/^\s{0,3}([-*_])\s?(?:\1\s?){2,}$/gm, "")
      .trim()
  )
}

export function textoConEnlaces(texto: string): ReactNode[] {
  const partes = sinMarkdown(texto).split(ENLACE)

  return partes.map((parte, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{parte}</Fragment>

    // La puntuación final queda fuera del ancla, para que una frase que
    // termina "...en /contacto." no enlace también el punto.
    const cola = parte.match(/[.,;:!?)\]]+$/)?.[0] ?? ''
    const destino = cola ? parte.slice(0, -cola.length) : parte
    const interno = destino.startsWith('/')

    return (
      <Fragment key={i}>
        <a
          href={destino}
          {...(interno ? {} : { target: '_blank', rel: 'noreferrer' })}
          className="text-ink underline decoration-gold/60 underline-offset-2 transition-colors duration-fast hover:decoration-gold"
        >
          {interno ? (NOMBRES[destino] ?? destino) : destino}
        </a>
        {cola}
      </Fragment>
    )
  })
}
