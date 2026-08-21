import {
  areasDeTrabajo,
  bioDirector,
  ejesDeCrecimiento,
  ejesDelEquipo,
  firmaTecnica,
  metodologia,
  perfilDeCliente,
  perfilesDeColaboracion,
  preguntasFrecuentes,
  procesoDeDiagnostico,
  programasEstrategicos,
  propuestaDeValor,
  relatoDeAgencia,
  senalesDeClienteIdeal,
  serviciosResumen,
  situacionesQueAtendemos,
} from '@/content/sitio'
import { HECHOS_OPERATIVOS } from './hechos'

/**
 * Lo que el asesor sabe.
 *
 * Regla central: el conocimiento no se escribe, se deriva. Todo lo de acá sale
 * de `@/content/sitio`, que es el mismo objeto que renderizan las páginas. Si
 * mañana cambia el copy de un programa, el asesor contesta distinto en el
 * mismo commit y nadie tiene que acordarse de actualizar un segundo texto.
 *
 * La única excepción es `HECHOS_OPERATIVOS`, que son datos de operación que no
 * viven en ninguna página.
 */

const POSICIONAMIENTO = `Impakto Creative dirige, diseña y construye la presencia de marcas que ya tienen negocio y necesitan que su comunicación esté a la altura. No es una agencia de volumen: el valor está en la dirección y el criterio, no en la cantidad de piezas. Los tres ejes que ordenan todo el trabajo son captación, conversión y retención.`

function desdeElContenido(): string {
  const bloques: string[] = []

  bloques.push(
    'Cómo se presenta el estudio:\n' + relatoDeAgencia.map((p) => `- ${p}`).join('\n'),
  )

  bloques.push(
    'Propuesta de valor:\n' +
      propuestaDeValor.map((v) => `- ${v.title}: ${v.description}`).join('\n'),
  )

  bloques.push(
    'Servicios (resumen):\n' +
      serviciosResumen.map((s) => `- ${s.title}: ${s.description}`).join('\n'),
  )

  bloques.push(
    'Ejes de crecimiento, la forma en que se ordena cualquier proyecto:\n' +
      ejesDeCrecimiento
        .map(
          (e) =>
            `- ${e.id} ${e.title}. ${e.promise}\n  Qué mejora: ${e.benefits.join('; ')}`,
        )
        .join('\n'),
  )

  // Los programas son lo que realmente se vende. Van completos, con alcance,
  // porque es de donde salen las respuestas concretas a "qué incluye".
  bloques.push(
    'Programas estratégicos (esto es lo que se contrata):\n' +
      programasEstrategicos
        .map((p) => `- ${p.title}\n  Para qué sirve: ${p.outcome}\n  Alcance: ${p.scope.join('; ')}`)
        .join('\n'),
  )

  bloques.push(
    'Áreas de trabajo, el detalle fino de lo que se hace:\n' +
      areasDeTrabajo.map((d) => `- ${d.title}: ${d.items.join('; ')}`).join('\n'),
  )

  bloques.push(
    'Los cuatro frentes del equipo:\n' +
      ejesDelEquipo.map((e) => `- ${e.title}: ${e.description}`).join('\n'),
  )

  bloques.push(
    'Metodología, del diagnóstico a la optimización:\n' +
      metodologia.map((p) => `- ${p.number} ${p.title}: ${p.description}`).join('\n'),
  )

  bloques.push(
    'Qué pasa en la sesión de diagnóstico:\n' +
      procesoDeDiagnostico.map((p) => `- ${p.step} ${p.title}: ${p.description}`).join('\n'),
  )

  // Las situaciones son la mejor herramienta de diagnóstico que tiene el
  // asesor: son las palabras con las que el visitante describe su problema
  // antes de saber qué servicio necesita.
  bloques.push(
    'Situaciones típicas por las que una empresa llega (usalas para reconocer el problema que el visitante está describiendo):\n' +
      situacionesQueAtendemos.map((p) => `- ${p}`).join('\n'),
  )

  bloques.push(
    'Con quién encaja el estudio:\n' +
      perfilDeCliente.map((p) => `- ${p}`).join('\n') +
      '\n' +
      senalesDeClienteIdeal.map((s) => `- ${s.title}: ${s.description}`).join('\n') +
      '\n' +
      perfilesDeColaboracion.map((p) => `- ${p}`).join('\n'),
  )

  // El FAQ es la mayor palanca de calidad disponible: respuestas cortas y
  // factuales, escritas en el registro en que la gente pregunta de verdad.
  bloques.push(
    'Preguntas frecuentes:\n' +
      preguntasFrecuentes.map((p) => `P: ${p.question}\nR: ${p.answer}`).join('\n\n'),
  )

  bloques.push('Dirección creativa:\n' + bioDirector.map((p) => `- ${p}`).join('\n'))

  bloques.push('Firma técnica del estudio: ' + firmaTecnica.join(', ') + '.')

  bloques.push(
    'Rutas del sitio que se pueden enlazar: / (home), /servicios, /agencia, /contacto (el formulario de diagnóstico), /privacidad, /terminos.',
  )

  return bloques.join('\n\n')
}

const CONOCIMIENTO = [POSICIONAMIENTO, desdeElContenido(), HECHOS_OPERATIVOS].join('\n\n')

export function getConocimientoDeMarca(): string {
  return CONOCIMIENTO
}

/**
 * Guarda contra el fallo silencioso, que es el fallo peligroso de este archivo.
 *
 * Si mañana alguien refactoriza `@/content/sitio` y un export queda vacío, el
 * asesor no se rompe: sigue contestando y simplemente deja de saber cosas. Sin
 * error, sin build roto y sin que nadie se entere hasta que un visitante
 * pregunta por un programa y le dicen que no existe. Esto lo hace ruidoso.
 */
export function verificarConocimiento(): void {
  const faltan: string[] = []
  if (!CONOCIMIENTO.includes('Dirección de marca y posicionamiento')) faltan.push('programas')
  if (!CONOCIMIENTO.includes('Captación')) faltan.push('ejes de crecimiento')
  if (!CONOCIMIENTO.includes('Diagnóstico')) faltan.push('metodología')
  if (!CONOCIMIENTO.includes('¿Con qué tipo de organizaciones')) faltan.push('preguntas frecuentes')
  if (!CONOCIMIENTO.includes('sesión de diagnóstico sin costo')) faltan.push('hechos operativos')

  if (faltan.length) {
    throw new Error(
      `El conocimiento del asesor perdió: ${faltan.join(', ')}. Revisá src/content/sitio.ts.`,
    )
  }
}
