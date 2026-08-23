# AEO — Impakto Creative

Auditoría y corrección para que los motores de respuesta puedan acceder al
contenido, entenderlo y citarlo. No se tocó diseño, copy ni identidad.

Fecha: 23 de agosto de 2026.

---

## 1. Diagnóstico

| Punto | Estado | Impacto | Archivo |
|---|---|---|---|
| Renderizado de rutas públicas | OK | — | las 6 son estáticas (`○`) |
| Contenido tras interacción | **Ausente** | **Alto** | `components/home/Hero.tsx` |
| `dynamic(ssr: false)` sobre contenido | OK | — | ninguno en el proyecto |
| Metadata por ruta | OK | — | `title`, `description`, `canonical`, `openGraph` en las 6 |
| JSON-LD | Parcial | Medio | faltaba `FAQPage` |
| `robots.txt` | Parcial | Medio | permitía por comodín, sin nombrar rastreadores |
| `sitemap.xml` | OK | — | 6 URLs con `lastmod` real |
| `llms.txt` | Parcial | Medio | existía, sin las consultas del hero |
| Jerarquía de encabezados | OK | — | un `h1` por página |
| Landmarks | OK | — | `main` 1, `nav` 1, `header` 1, `footer` 1, `article` 12, `section` 10 |
| `alt` en imágenes | OK | — | 0 imágenes sin `alt` sobre 73 |
| `X-Robots-Tag: noindex` | OK | — | no existe en código ni en cabeceras |
| Proxy rechazando agentes | OK | — | `proxy.ts` solo refresca sesión |
| Bloqueo en el borde | **No aplica** | — | el sitio está en Vercel, no en Cloudflare |

### El hallazgo de impacto alto

El hero muestra ocho pares de pregunta y respuesta que son el contenido más
citable del sitio: objeciones reales de alguien que evalúa contratar, con la
respuesta del estudio. **Ninguno llegaba completo al HTML servido**, por tres
razones que se suman:

1. `AnimatePresence` monta una sola consulta a la vez.
2. La respuesta espera un cambio de estado que en el servidor no ocurre.
3. El texto va partido palabra por palabra en `<span>` para la animación de
   tipeo, así que ninguna frase existe como cadena contigua.

Comprobado contra producción: cero de ocho.

---

## 2. Correcciones

### Las consultas del hero pasan a contenido derivado

`content/sitio.ts` gana `consultasDelHero`. El componente la importa en lugar de
declararla, y ahora las ocho entran a `llms.txt` y al conocimiento del asesor.

No se agregó texto oculto para rastreadores: eso sería servir algo distinto a un
bot que a una persona. El contenido se publica donde un modelo lo lee de forma
legítima.

### `robots.txt` nombra a los rastreadores

Quince agentes con permiso propio. Ya entraban por el comodín; nombrarlos
convierte el permiso en una declaración y no en una consecuencia: si mañana
alguien restringe el `*`, estos siguen teniendo su regla.

### `llms.txt` suma una sección

`## Lo que preguntan antes de contratar`, con las ocho consultas. El archivo pasa
de 8,7 KB a 10,6 KB.

### `FAQPage` en la home

Derivado de `preguntasFrecuentes`, el mismo objeto que renderiza el acordeón: si
cambia una respuesta, cambia el marcado en el mismo commit.

**Se agregó a sabiendas de que no gana nada en Google.** Los resultados
enriquecidos de FAQ se retiraron para todos los sitios el 7 de mayo de 2026. La
razón es la otra: un modelo que necesita citar una respuesta prefiere una
estructura declarada a inferirla del acordeón.

---

## 3. Archivos tocados

| Archivo | Qué cambió |
|---|---|
| `src/content/sitio.ts` | nuevo `consultasDelHero` con las ocho consultas |
| `src/components/home/Hero.tsx` | importa el guion en vez de declararlo |
| `src/lib/chat/knowledge.ts` | el asesor suma las consultas a lo que sabe |
| `src/app/llms.txt/route.ts` | nueva sección con las consultas |
| `src/app/robots.ts` | quince rastreadores de IA con regla propia |
| `src/app/(marketing)/page.tsx` | `FAQPage` derivado del contenido |

---

## 4. Pendiente, y es tuyo

**Decidir sobre entrenamiento.** `CCBot` y `Google-Extended` gobiernan el uso del
contenido para *entrenar modelos*, no para citarlo. Quedaron permitidos porque es
lo que ya pasaba por el comodín, pero es una decisión de derechos y no técnica.
Quitar cualquiera de los dos es una línea en `robots.ts`.

**El bloqueo en el borde no aplica.** El sitio responde `server: Vercel` y no
tiene cabecera `cf-ray`: no pasa por Cloudflare, así que no hay AI Crawl Control
que revisar ni Agent Readiness que medir. Si algún día se mueve el DNS a
Cloudflare, ese control pasa a ser lo primero: un sitio perfecto con los bots
bloqueados en el borde da cero.

**Datos que faltan y no inventé:**

- `sameAs` en `Organization`: no hay ni un perfil social en el sitio. Es lo que
  ata la entidad al grafo de conocimiento.
- `foundingDate`: el sitio dice «más de veinte años» en tres lugares y la fecha
  no está escrita en ninguno.
- Casos con resultados: siguen sin material. Es lo de mayor retorno de toda la
  lista para que un modelo tenga algo concreto que citar.

---

## 5. Lo que no toqué

**El hero sigue mostrando una consulta a la vez.** Cambiarlo para renderizar las
ocho sería tocar diseño, y la animación de tipeo es parte de lo que hace que se
lea como conversación en vivo. El contenido quedó accesible por `llms.txt`, que
resuelve el problema sin tocar la página.

**La fragmentación del texto en `<span>` por palabra se mantiene.** Un extractor
de texto reconstruye la frase igual; lo que rompía era la búsqueda de cadenas
contiguas, no la lectura.
