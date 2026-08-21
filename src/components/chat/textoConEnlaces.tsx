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

export function textoConEnlaces(texto: string): ReactNode[] {
  const partes = texto.split(ENLACE)

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
