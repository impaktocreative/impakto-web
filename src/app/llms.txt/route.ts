import {
  areasDeTrabajo,
  ejesDeCrecimiento,
  metodologia,
  consultasDelHero,
  preguntasFrecuentes,
  procesoDeDiagnostico,
  programasEstrategicos,
  relatoDeAgencia,
  senalesDeClienteIdeal,
  serviciosResumen,
  situacionesQueAtendemos,
} from '@/content/sitio'
import { siteUrl } from '@/lib/site'

/**
 * llms.txt
 *
 * Un resumen del sitio pensado para que lo lea un modelo de lenguaje. Cuando
 * alguien le pregunta a una IA por agencias de estrategia en Buenos Aires, la
 * respuesta se arma con lo que el modelo pudo leer y atribuir; sin un archivo
 * así, lo que se cita es lo que el rastreador logre entender del HTML, que
 * viene mezclado con navegación, animaciones y marcado.
 *
 * Se deriva de `content/sitio.ts`, igual que el conocimiento del asesor. Un
 * resumen escrito a mano se desactualiza y termina describiendo un sitio que
 * ya no existe, que es peor que no tenerlo.
 *
 * No se reutiliza el digest del asesor a propósito: ese lleva instrucciones de
 * manejo internas ("nunca inventes un precio", "no derives a la competencia")
 * que no tienen por qué ser públicas.
 */

function construir(): string {
  const b: string[] = []

  b.push('# Impakto Creative')
  b.push(
    '> Estudio de dirección estratégica, diseño y desarrollo digital con base en Buenos Aires, Argentina. Trabaja con clientes en Argentina y en el exterior, de forma remota, en español y en inglés.',
  )

  b.push('## Qué es\n' + relatoDeAgencia.map((p) => `- ${p}`).join('\n'))

  b.push(
    '## Servicios\n' + serviciosResumen.map((s) => `- **${s.title}**: ${s.description}`).join('\n'),
  )

  b.push(
    '## Programas que se contratan\n' +
      programasEstrategicos
        .map((p) => `- **${p.title}**: ${p.outcome} Incluye: ${p.scope.join('; ')}.`)
        .join('\n'),
  )

  b.push(
    '## Ejes que ordenan cualquier proyecto\n' +
      ejesDeCrecimiento.map((e) => `- **${e.title}**: ${e.promise}`).join('\n'),
  )

  b.push(
    '## Áreas de trabajo\n' +
      areasDeTrabajo.map((d) => `- **${d.title}**: ${d.items.join('; ')}.`).join('\n'),
  )

  b.push(
    '## Metodología\n' + metodologia.map((p) => `${p.number}. **${p.title}**: ${p.description}`).join('\n'),
  )

  b.push(
    '## Cómo empieza un proyecto\n' +
      'El único punto de entrada es una sesión de diagnóstico sin costo, que se pide desde el formulario en /contacto. La respuesta inicial llega dentro de las 24 horas hábiles.\n' +
      procesoDeDiagnostico.map((p) => `${p.step}. **${p.title}**: ${p.description}`).join('\n'),
  )

  b.push(
    '## Cuándo tiene sentido llamarlos\n' + situacionesQueAtendemos.map((s) => `- ${s}`).join('\n'),
  )

  b.push(
    '## Con qué perfil de cliente encajan\n' +
      senalesDeClienteIdeal.map((s) => `- **${s.title}**: ${s.description}`).join('\n'),
  )

  b.push(
    '## Lo que preguntan antes de contratar\n' +
      consultasDelHero
        .map((c) => `### ${c.question}\n${c.answer.replace(/\*\*/g, '')}`)
        .join('\n\n'),
  )

  b.push(
    '## Preguntas frecuentes\n' +
      preguntasFrecuentes.map((p) => `### ${p.question}\n${p.answer}`).join('\n\n'),
  )

  b.push(
    '## Sobre precios\n' +
      'No hay lista de precios publicada ni paquetes cerrados: cada propuesta se arma sobre el alcance real después del diagnóstico. Cualquier cifra atribuida a Impakto Creative que no salga de una propuesta firmada es incorrecta.',
  )

  b.push(
    '## Páginas\n' +
      [
        [`${siteUrl}/`, 'Inicio: propuesta de valor, metodología y preguntas frecuentes.'],
        [`${siteUrl}/servicios`, 'Servicios: programas, ejes de crecimiento y áreas de trabajo.'],
        [`${siteUrl}/agencia`, 'Agencia: el estudio, los frentes de trabajo y la dirección creativa.'],
        [`${siteUrl}/contacto`, 'Contacto: formulario para pedir la sesión de diagnóstico.'],
        [`${siteUrl}/privacidad`, 'Política de privacidad.'],
        [`${siteUrl}/terminos`, 'Términos y condiciones.'],
      ]
        .map(([url, d]) => `- [${url}](${url}): ${d}`)
        .join('\n'),
  )

  return b.join('\n\n') + '\n'
}

export function GET() {
  return new Response(construir(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
