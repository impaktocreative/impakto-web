# AEO — Impakto Creative

Auditoría y corrección para que los motores de respuesta accedan al contenido,
lo entiendan y lo citen. No se tocó diseño, copy ni identidad.

23 de agosto de 2026. Dominio: `www.impaktocreative.com`.

---

## 1. Diagnóstico

| Punto | Antes | Después | Impacto | Archivo |
|---|---|---|---|---|
| Rutas públicas: renderizado | 6 estáticas | igual | — | salida de `next build` |
| Consultas del hero en el HTML | **ausentes** | en `FAQPage` | **alto** | `components/home/Hero.tsx` |
| Acordeón del FAQ | OK: `<details>` nativo, respuestas en el DOM | igual | — | `components/home/FAQ.tsx` |
| Texto fragmentado en `<span>` | OK: separador es `" "` real, no CSS | igual | — | `Hero.tsx:79` |
| `dynamic(ssr:false)` | ninguno | igual | — | — |
| Metadata | completa en las 6 | igual | — | — |
| `hreflang` | no aplica: un solo idioma | igual | — | — |
| JSON-LD | Organization, Service, OfferCatalog, ProfessionalService, ContactPoint, BreadcrumbList | + `FAQPage` de 14 | medio | `(marketing)/page.tsx` |
| `sameAs` | **ausente** | ausente | medio | pendiente del dueño |
| `priceCurrency` | no aplica: los `Offer` no declaran precio | igual | — | `(marketing)/servicios/page.tsx` |
| `robots.txt` | comodín, sin exclusiones | recuperación nombrada, `/api/` y `/admin/` fuera | medio | `app/robots.ts` |
| `sitemap.xml` | 6 URLs con `lastmod` | igual | — | `app/sitemap.ts` |
| `llms.txt` | ruta derivada | + consultas del hero | medio | `app/llms.txt/route.ts` |
| `h1` por página | 1 | 1 | — | verificado en HTML servido |
| Landmarks | `main` 1, `nav` 1, `header` 1, `footer` 1, `article` 12, `section` 10 | igual | — | — |
| `alt` | 0 ausentes sobre 73 | igual | — | — |
| `X-Robots-Tag: noindex` | ninguno | ninguno | — | ni en código ni en cabeceras |
| `noindex` para duplicación | no se usa | — | — | — |
| Proxy rechazando agentes | no: solo refresca sesión | igual | — | `src/proxy.ts` |
| Borde | Vercel, sin Cloudflare | igual | — | ver §6 |

### El hallazgo de impacto alto

El hero muestra ocho pares de pregunta y respuesta: objeciones reales de quien
evalúa contratar, con la respuesta del estudio. Es el contenido más citable del
sitio y **ninguno llegaba al HTML servido**, por dos razones que se suman:

1. `AnimatePresence` monta una consulta a la vez.
2. La respuesta se renderiza solo cuando `fase !== "pregunta"`, y en el servidor
   la fase inicial es `"pregunta"`.

Comprobado antes del arreglo:

```
$ curl -s https://www.impaktocreative.com/ | grep -c 'Revisamos las decisiones antes que las piezas'
0
```

El texto fragmentado en `<span>` por palabra **no** era parte del problema: el
separador es un espacio real en el marcado (`Hero.tsx:79`), así que cualquier
extractor reconstruye la frase.

---

## 2. Correcciones

### `robots.ts`

Se separan las dos familias. **Recuperación** (Googlebot, GPTBot, OAI-SearchBot,
ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Applebot)
queda con regla propia. **Entrenamiento** (CCBot, Google-Extended,
Applebot-Extended, Amazonbot, Bytespider) queda sin regla propia: ver §4.

Se excluyen `/api/` y `/admin/`, que no tienen nada que citar.

### `FAQPage` con las 14 preguntas

Las 8 consultas del hero más las 6 del acordeón, derivadas del mismo objeto que
renderizan las páginas. Rotan, pero están en la página: declararlas describe lo
que la página contiene.

### Las consultas del hero pasan a contenido derivado

`content/sitio.ts` gana `consultasDelHero`. El componente la importa. De ahí
salen el `FAQPage`, el `llms.txt` y el conocimiento del asesor.

---

## 3. Archivos tocados

| Archivo | Qué cambió |
|---|---|
| `src/content/sitio.ts` | nuevo `consultasDelHero` |
| `src/components/home/Hero.tsx` | importa el guion en vez de declararlo |
| `src/app/(marketing)/page.tsx` | `FAQPage` de 14 preguntas |
| `src/app/robots.ts` | recuperación nombrada; `/api/` y `/admin/` excluidos |
| `src/app/llms.txt/route.ts` | sección con las consultas del hero |
| `src/lib/chat/knowledge.ts` | el asesor suma las consultas |

---

## 4. Salida de la verificación

```
── palabras servidas por ruta (sin ejecutar JS)
   /            992
   /agencia     578
   /servicios   881
   /contacto    353
   /privacidad  130
   /terminos    121

── rastreadores reales
   GPTBot/1.0           200
   ClaudeBot/1.0        200
   PerplexityBot/1.0    200
   OAI-SearchBot/1.0    200
   Googlebot/2.1        200

── archivos de raíz
   robots.txt   200
   sitemap.xml  200
   llms.txt     200

── h1 por ruta
   /  1     /agencia  1     /servicios  1     /contacto  1

── compila
   tsc ok
   eslint ok
```

JSON-LD extraído del HTML servido y parseado: `FAQPage` con 14 preguntas, cero
respuestas vacías, cero con marcado de negrita sin limpiar.

---

## 5. Decisiones del dueño, pendientes

**Rastreadores de entrenamiento.** `CCBot`, `Google-Extended`,
`Applebot-Extended`, `Amazonbot` y `Bytespider` no tienen regla propia. Hoy caen
bajo el comodín, que los permite. Para excluirlos hay que agregarles un
`disallow` explícito; para permitirlos con nombre, una regla propia. No hubo
instrucción, así que no se tomó la decisión.

**`sameAs` en `Organization`.** Requiere las URLs de los perfiles sociales del
estudio. No hay ninguno enlazado en el sitio.

**Publicación de precios.** Los `Offer` de `/servicios` no declaran precio, en
línea con que el sitio no publica ninguno. Si eso cambia, cada oferta necesita
`price`, `priceCurrency` en ISO 4217 y `priceValidUntil`.

---

## 6. Datos que faltaban y no se inventaron

- Perfiles sociales para `sameAs`.
- `foundingDate`: el sitio dice «más de veinte años» en tres lugares; la fecha
  no está escrita en ninguno.
- Casos con resultados verificables. Sin ellos no hay cifra que un modelo pueda
  citar sobre el trabajo del estudio.

---

## 7. Acciones manuales externas

**Firewall del proyecto en Vercel.** El sitio responde `server: Vercel` y no
tiene `cf-ray`: no pasa por Cloudflare, así que no hay AI Crawl Control ni Agent
Readiness que medir. Lo que sí conviene revisar es el Firewall del proyecto en
el panel de Vercel, que no se puede verificar desde el código.

**Reindexación.** Pedir recrawl en Search Console para las 6 rutas.

**Medir citación real.** Preguntar en ChatGPT y Perplexity por agencias de
estrategia en Buenos Aires y anotar si el sitio aparece. Es la única medición de
resultado; todo lo anterior es condición previa.

---

## 8. Lo que no se tocó

**El hero sigue mostrando una consulta a la vez.** Renderizar las ocho sería
tocar diseño, y la animación de tipeo es parte de lo que hace que se lea como
conversación. El contenido quedó accesible por `FAQPage`, que es marcado sobre
contenido existente y no una segunda versión de la página.

**Propuesta, no aplicada:** si algún día se quiere que las ocho estén también en
el HTML visible, la vía sin tocar el hero es una sección de preguntas en
`/servicios` o `/agencia` que las liste. Es contenido nuevo en una página, así
que es decisión de diseño y de copy.
