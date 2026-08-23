/**
 * Contenido del sitio público.
 *
 * Estos objetos son la única copia: los renderizan los componentes de
 * marketing y los lee `lib/chat/knowledge.ts` para armar lo que el asesor
 * sabe. Esa doble lectura es a propósito.
 *
 * Un texto de conocimiento escrito a mano se desactualiza en dos semanas y el
 * asistente empieza a ofrecer cosas que ya no existen. Derivándolo de acá, un
 * cambio de copy en una página cambia lo que el asesor contesta en el mismo
 * commit, sin que nadie tenga que acordarse.
 *
 * Al agregar contenido nuevo que el visitante pueda preguntar, va acá y se
 * importa, no se escribe dentro del componente.
 */

// ── Home ────────────────────────────────────────────────────────────────────

export const propuestaDeValor = [
  {
    index: "01",
    title: "Dirección clara",
    description:
      "Definimos prioridades y enfoque para que tu marca avance con una lógica estratégica concreta y medible.",
  },
  {
    index: "02",
    title: "Sistema coherente",
    description:
      "Alineamos mensaje, diseño y estructura digital para sostener una percepción más sólida y confiable.",
  },
  {
    index: "03",
    title: "Impacto comercial",
    description:
      "El esfuerzo cae donde el negocio lo necesita: en cómo llegan, en qué encuentran o en por qué se quedan.",
  },
];

export const serviciosResumen = [
  {
    title: "Estrategia y posicionamiento",
    description:
      "Dirección comunicacional y criterio de marca para organizaciones que requieren una base estratégica clara para escalar.",
  },
  {
    title: "Diseño y desarrollo web",
    description:
      "Sitios y plataformas orientados a proyectar autoridad, ordenar la experiencia digital y mejorar desempeño comercial.",
  },
  {
    title: "Comunicación y contenido comercial",
    description:
      "Mensajes, piezas y materiales desarrollados para expresar valor con precisión ejecutiva en cada punto de contacto.",
  },
  {
    title: "Sistemas digitales y automatización",
    description:
      "Estructuras funcionales que fortalecen procesos, contacto y eficiencia operativa a escala.",
  },
];

export const metodologia = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Analizamos contexto, audiencia y percepción actual para detectar dónde tu marca puede ganar más tracción.",
  },
  {
    number: "02",
    title: "Dirección",
    description:
      "Definimos enfoque estratégico, narrativa y prioridades para que cada frente avance con el mismo criterio.",
  },
  {
    number: "03",
    title: "Desarrollo",
    description:
      "Construimos piezas, estructuras y experiencias conectadas entre sí para evitar dispersión y retrabajo.",
  },
  {
    number: "04",
    title: "Implementación",
    description:
      "Ejecutamos con orden operativo para que la mejora se vea en la percepción de marca y en la conversión.",
  },
  {
    number: "05",
    title: "Optimización",
    description:
      "Medimos, ajustamos y refinamos para sostener resultados y escalar con más seguridad.",
  },
];

export const situacionesQueAtendemos = [
  "La marca evolucionó y su presentación actual ya no representa su nivel.",
  "El ecosistema digital quedó por debajo del estándar de la organización.",
  "La comunicación perdió coherencia entre unidades, canales y soportes.",
  "La inversión en marketing no se está notando en las ventas.",
  "La operación creció y faltan herramientas: gestión interna, seguimiento de clientes, venta online.",
  "Los equipos de marketing y ventas no operan con un marco unificado de comunicación.",
];

export const perfilDeCliente = [
  "Necesitan una estrategia de comunicación robusta y bien articulada.",
  "Valoran criterio, proceso y decisiones respaldadas por análisis.",
  "Buscan crecer con una presencia de marca sólida y consistente.",
  "Priorizan resultados sostenibles por encima de soluciones tácticas de corto plazo.",
];

export const preguntasFrecuentes = [
  {
    question: "¿Con qué tipo de organizaciones y alcances trabaja Impakto Creative?",
    answer:
      "Trabajamos con marcas, empresas y equipos directivos que requieren dirección estratégica, consistencia de marca y ejecución con estándar en múltiples frentes.",
  },
  {
    question: "¿Cómo abordan proyectos con múltiples unidades, mercados o líneas de negocio?",
    answer:
      "Iniciamos con un diagnóstico integral para priorizar frentes críticos, alinear criterios entre equipos y definir una hoja de ruta por etapas con objetivos medibles.",
  },
  {
    question: "¿Qué nivel de involucramiento requiere el equipo interno del cliente?",
    answer:
      "El involucramiento se define por etapa. Establecemos una dinámica ejecutiva con responsables claros, instancias de validación y decisiones oportunas para sostener velocidad y calidad.",
  },
  {
    question: "¿Cómo aseguran consistencia en captación, conversión y retención?",
    answer:
      "La metodología integra estos tres pilares desde el diseño de la estrategia. Cada decisión de mensaje, experiencia y sistema se evalúa por su impacto en captación, conversión y retención.",
  },
  {
    question: "¿Cómo gestionan aprobaciones y toma de decisiones con múltiples stakeholders?",
    answer:
      "Definimos una gobernanza de proyecto desde el inicio, con responsables por frente, hitos de aprobación y criterios de decisión para sostener trazabilidad y velocidad ejecutiva.",
  },
  {
    question: "¿Pueden colaborar con agencias de marketing o equipos internos ya existentes?",
    answer:
      "Sí. Participamos como socio estratégico y de ejecución en proyectos compartidos, integrando conocimiento con agencias y equipos internos para fortalecer el resultado final.",
  },
];

/**
 * Las marcas de clientes.
 *
 * Fuente única: la lee la cinta de la home y la grilla de la página de agencia.
 * Antes cada una tenía su propia lista, y la de agencia se quedó en ocho marcas
 * con correcciones de escala escritas a mano mientras la otra ya iba por
 * treinta y una normalizadas.
 *
 * Los archivos viven en `logos/clientes/cinta/`: están normalizados por área de
 * tinta, así que ninguna necesita ajuste individual. El orden alterna rubros
 * para que dos marcas del mismo sector no caigan pegadas.
 */
export const marcasClientes = [
  { file: "vargas.webp", name: "Vargas" },
  { file: "chevrolet.webp", name: "Chevrolet" },
  { file: "restorando.webp", name: "Restorando" },
  { file: "grupo-san-nicolas-salud.webp", name: "Grupo San Nicolás Salud" },
  { file: "salomon.webp", name: "Salomon" },
  { file: "carballal.webp", name: "Carballal Propiedades" },
  { file: "little-ranch-hotel-spa.webp", name: "Little Ranch Hotel & Spa" },
  { file: "venfarma.webp", name: "Venfarma" },
  { file: "llongueras.webp", name: "Llongueras" },
  { file: "3m-supermercados.webp", name: "3M Supermercados" },
  { file: "black-donkey.webp", name: "Black Donkey" },
  { file: "san-jorge-automoviles.webp", name: "San Jorge Automóviles" },
  { file: "the-nails-bar.webp", name: "The Nails Bar" },
  { file: "red-argentina-de-salud.webp", name: "Red Argentina de Salud" },
  { file: "terra-nostra.webp", name: "Terra Nostra" },
  { file: "multipasta.webp", name: "Multipasta" },
  { file: "neicha.webp", name: "Neicha" },
  { file: "si-turismo-bariloche.webp", name: "Sí Turismo Bariloche" },
  { file: "doctor-k.webp", name: "Doctor K" },
  { file: "honky-tonk.webp", name: "Honky Tonk" },
  { file: "regala.webp", name: "Regala" },
  { file: "la-crockery.webp", name: "La Crockery" },
  { file: "thaun.webp", name: "Thaun" },
  { file: "you-mujer.webp", name: "You Mujer" },
  { file: "hotel-san-martin.webp", name: "Hotel San Martín" },
  { file: "buttonia.webp", name: "Buttonia" },
  { file: "cirse.webp", name: "Cirse" },
  { file: "doris-machin.webp", name: "Doris Machin" },
  { file: "san-carlos.webp", name: "San Carlos" },
  { file: "rebecca.webp", name: "Rebecca" },
  { file: "honky-tonk-woman.webp", name: "Honky Tonk Woman" },
];

/**
 * Las consultas del hero.
 *
 * Es una conversación real, no un carrusel de argumentos. Las preguntas son
 * las que hace alguien que ya evaluó proveedores y llega con reparos, no las
 * que le convendría hacer al vendedor. Cada respuesta arranca con un criterio
 * concreto, una distinción o un límite, porque eso es lo único que demuestra
 * oficio en dos líneas. Un adjetivo no demuestra nada.
 *
 * Regla al agregar una: si la respuesta se puede copiar y pegar en el sitio de
 * cualquier otra agencia sin cambiarle una palabra, no sirve.
 *
 * Vive acá y no dentro del componente porque el hero muestra una sola a la vez
 * y la respuesta espera un cambio de estado: en el HTML servido no hay ninguna
 * completa. Derivándolas desde acá entran al llms.txt y al conocimiento del
 * asesor, que es donde un modelo puede leerlas y citarlas.
 */
export const consultasDelHero = [
  {
    question: "Ya trabajamos con una agencia. ¿Qué harían distinto?",
    answer:
      "Revisamos las decisiones antes que las piezas. Rara vez el problema es el volumen de producción; casi siempre es que **el criterio cambia según quién ejecute**.",
  },
  {
    question: "¿Cómo determinan si el problema es la web o es nuestra propuesta?",
    answer:
      "Lo evaluamos en dos planos: qué perfil llega y qué claridad encuentra al llegar. Si el perfil no es el correcto, el sitio no lo resuelve. Si lo es y no avanza, **el problema está en el sitio**.",
  },
  {
    question: "¿Por qué empiezan por estrategia y no directamente por diseño?",
    answer:
      "Porque el diseño expresa una decisión ya tomada. Cuando esa decisión no existe, el diseño la define por defecto y la marca queda **sin argumento para sostenerla** ante su directorio.",
  },
  {
    question: "Tenemos varias unidades de negocio y cada una comunica distinto.",
    answer:
      "Eso se resuelve con jerarquía, no con un manual. Definimos qué determina la marca madre y qué queda a criterio de cada unidad. Sin ese límite explícito, **el manual deja de aplicarse** en semanas.",
  },
  {
    question: "¿En cuánto tiempo se ven resultados?",
    answer:
      "La percepción cambia desde la salida. El impacto comercial depende del volumen de oportunidades que maneje la compañía: con ciclos de venta largos, **un trimestre no es muestra suficiente** para concluir.",
  },
  {
    question: "¿Trabajan con nuestro equipo interno o lo reemplazan?",
    answer:
      "Trabajamos con el equipo. Aportamos dirección y criterio externo; **el conocimiento del negocio ya está adentro** y es lo más difícil de reconstruir desde afuera.",
  },
  {
    question: "¿Qué necesitan de nuestra parte para comenzar?",
    answer:
      "Un interlocutor con capacidad de decisión. Es la única condición que no se puede delegar, y **define el ritmo del proyecto** más que cualquier otro factor.",
  },
  {
    question: "¿Cómo definen la inversión de un proyecto?",
    answer:
      "Por alcance, y el alcance surge del diagnóstico, que no tiene costo. Anticipar una cifra antes de esa conversación **sería un número sin respaldo**.",
  },
];

// ── Servicios ───────────────────────────────────────────────────────────────

export const ejesDeCrecimiento = [
  {
    id: "01",
    title: "Captación",
    promise: "Atraer mejores oportunidades con una presencia más clara, sólida y confiable.",
    benefits: [
      "Posicionamiento más claro frente al cliente correcto",
      "Mayor calidad de consultas y prospectos",
      "Percepción premium alineada al nivel real del negocio",
    ],
  },
  {
    id: "02",
    title: "Conversión",
    promise: "Transformar interés en decisiones concretas con menos fricción y más claridad comercial.",
    benefits: [
      "Mensajes que explican valor sin ruido",
      "Recorridos digitales orientados a acción",
      "Mejor rendimiento comercial de web, landings y materiales",
    ],
  },
  {
    id: "03",
    title: "Retención",
    promise: "Sostener relaciones más consistentes para mejorar recurrencia, confianza y recomendación.",
    benefits: [
      "Comunicación coherente en todos los puntos de contacto",
      "Sistemas y procesos que mejoran experiencia del cliente",
      "Mayor estabilidad del crecimiento en el tiempo",
    ],
  },
];

export const programasEstrategicos = [
  {
    title: "Dirección de marca y posicionamiento",
    outcome:
      "Define una base estratégica para que cada decisión visual, verbal y comercial responda a una misma lógica.",
    scope: [
      "Diagnóstico de marca y contexto competitivo",
      "Propuesta de valor y enfoque comunicacional",
      "Criterios de identidad verbal y visual",
      "Hoja de ruta por etapas de negocio",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Ecosistema digital para captación y conversión",
    outcome:
      "Construye una presencia digital con estándar high ticket para atraer, convertir y sostener mejor el valor percibido.",
    scope: [
      "Diseño y desarrollo web institucional",
      "Landing pages orientadas a objetivo comercial",
      "Sistemas web y aplicaciones a medida",
      "Arquitectura de contenidos y experiencia",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Comunicación comercial y contenido",
    outcome:
      "Ordena mensajes, piezas y narrativa para que la marca comunique con precisión y cierre con más claridad.",
    scope: [
      "Copy comercial para web y campañas",
      "Diseño publicitario y editorial",
      "Contenido para puntos de venta y canales digitales",
      "Estrategias de comunicación por etapa",
    ],
    cta: "Pedir diagnóstico",
  },
  {
    title: "Automatización, IA y optimización de procesos",
    outcome:
      "Mejora velocidad operativa y consistencia comercial sin perder control estratégico.",
    scope: [
      "Automatizaciones y flujos operativos",
      "Integración de IA aplicada a tareas clave",
      "Sistemas de seguimiento y respuesta",
      "Optimización continua basada en datos",
    ],
    cta: "Pedir diagnóstico",
  },
];

export const areasDeTrabajo = [
  {
    title: "Marca y comunicación",
    items: [
      "Diseño de marcas y branding",
      "Identidad visual y dirección de arte",
      "Estrategias de comunicación",
      "Comunicación comercial y publicitaria",
      "Diseño editorial y punto de venta",
    ],
  },
  {
    title: "Marketing y contenido",
    items: [
      "Marketing orientado a objetivos de negocio",
      "Generación de contenidos",
      "Copy para captación y conversión",
      "Estrategias de venta",
      "Diseño de piezas para campañas",
    ],
  },
  {
    title: "Desarrollo digital",
    items: [
      "Desarrollo web institucional",
      "Landing pages de alto rendimiento",
      "Desarrollo de sistemas web",
      "Desarrollo de aplicaciones",
      "Arquitectura de experiencia y contenidos",
    ],
  },
  {
    title: "IA, automatización y operación",
    items: [
      "Automatizaciones de procesos",
      "Inteligencia artificial aplicada",
      "Integración de canales y datos",
      "Optimización operativa continua",
      "Sistemas para seguimiento comercial",
    ],
  },
];

export const perfilesDeColaboracion = [
  "Empresas que buscan resultados sostenibles",
  "Equipos internos con foco en crecimiento",
  "Direcciones y liderazgos con necesidad de orden",
  "Agencias y partners para proyectos en conjunto",
];

export const senalesDeClienteIdeal = [
  {
    title: "Valoran dirección, no volumen",
    description:
      "Empresas que priorizan decisiones con criterio por encima de producción masiva sin estrategia.",
  },
  {
    title: "Buscan elevar percepción y rendimiento",
    description:
      "Marcas que necesitan alinear su nivel comercial con una presencia digital y comunicacional más sólida.",
  },
  {
    title: "Entienden el valor del proceso",
    description:
      "Equipos que quieren una relación profesional, ordenada y orientada a resultados sostenibles.",
  },
];

// ── Agencia ─────────────────────────────────────────────────────────────────

export const relatoDeAgencia = [
  "Impakto Creative nace desde una convicción clara: las marcas no escalan por volumen de acciones, escalan cuando existe dirección, criterio y consistencia en cada punto de contacto.",
  "Integramos estrategia, diseño, desarrollo y visión comercial en un mismo sistema de trabajo para tomar decisiones con profundidad y ejecutar con precisión.",
  "Combinamos experiencia senior con tecnología de vanguardia, incluida IA aplicada con criterio, para convertir contexto complejo en pasos concretos de crecimiento.",
];

export const ejesDelEquipo = [
  {
    title: "Estrategia y comunicación",
    description:
      "Diagnóstico de contexto, posicionamiento y narrativa para definir decisiones de marca con foco y jerarquía.",
  },
  {
    title: "Diseño y desarrollo digital",
    description:
      "Diseño y sistema digital alineados para construir experiencias consistentes con el estándar de cada organización.",
  },
  {
    title: "Contenido y dirección editorial",
    description:
      "Arquitectura de mensajes, tono y contenido para sostener una comunicación sólida entre canales y etapas comerciales.",
  },
  {
    title: "Tecnología y mejora continua",
    description:
      "Optimización continua con herramientas de vanguardia para acelerar resultados sin perder criterio estratégico.",
  },
];

export const firmaTecnica = [
  "Dirección estratégica",
  "Diseño editorial",
  "Motion systems",
  "Next.js 16",
  "React 19",
  "Framer Motion",
  "Automatización IA",
  "Arquitectura digital",
];

export const bioDirector = [
  "Rodrigo Zarza lidera la dirección creativa del estudio con una mirada que articula estrategia, sensibilidad estética y criterio de negocio.",
  "Su trabajo parte de una lectura profunda de cada marca para diseñar narrativas claras, sistemas visuales consistentes y decisiones con valor de largo plazo.",
  "Acompaña cada proyecto desde la primera sesión hasta la implementación, con los colaboradores que haga falta sumar en el camino.",
];

// ── Contacto ────────────────────────────────────────────────────────────────

export const procesoDeDiagnostico = [
  {
    step: "01",
    title: "Contexto de negocio",
    description:
      "Revisamos situación actual, objetivos y restricciones para entender dónde está hoy el mayor punto de fricción.",
  },
  {
    step: "02",
    title: "Prioridades estratégicas",
    description:
      "Definimos qué conviene resolver primero para generar impacto real con criterio comercial y operativo.",
  },
  {
    step: "03",
    title: "Hoja de ruta",
    description:
      "Proponemos una estructura de trabajo clara, con etapas, alcance y próximos pasos para ejecutar con control.",
  },
];
