---
name: revision-total
description: Revisión integral del sitio público de Impakto Creative en 5 fases con gates — auditoría, técnico, visual, comunicación y verificación. Usar cuando se pida "revisión total", "auditar el sitio", "mejorar todo", "llevarlo a nivel estudio de diseño", rediseño integral, o cuando haya que subir calidad técnica y visual del sitio de marketing sin romper el admin.
---

# Revisión total — Impakto Creative

Playbook para llevar el sitio público a nivel de estudio de diseño. Cinco fases secuenciales con gate de salida en cada una. No saltear fases: rediseñar sobre una base con problemas de CWV o accesibilidad obliga a hacer el trabajo dos veces.

---

## Reglas invariantes

Aplican a todas las fases. No se negocian sin pedido explícito del usuario.

1. **Scope = `src/app/(marketing)` y `src/components`.** El admin (`(admin)`) queda afuera: usa paleta neutra de Tailwind a propósito, es otro sistema visual. Solo se toca si aparece un bug funcional.
2. **No tocar** `src/utils/`, `src/app/api/`, `src/app/auth/`, ni los `.sql` de la raíz. Son la capa de datos y email; cambiarlos no es parte de una revisión visual.
3. **Cero colores hex sueltos.** Todo color sale de un token en `@theme` de `src/app/globals.css`. Si hace falta un color nuevo, se agrega como token primero.
4. **Una fase = uno o más commits, nunca un commit gigante.** Facilita revertir una fase sin perder las otras.
5. **Cada cambio visual respeta `prefers-reduced-motion`.** Ya hay 4 componentes que lo consultan (`CustomCursor`, `AnimatedMeshBackground`, `SmoothScroll`, y el bloque en `globals.css:633`). Mantener el patrón.
6. **Nada empeora un Core Web Vital.** Si una animación sube el INP, se va.
7. **Textos de cara al usuario pasan por `humanizer`.** Es regla global del usuario, no opcional.
8. Trabajar en branch, no en `main`. `main` deploya a producción en Vercel.

---

## Fase 0 — Preparación

**Objetivo:** tener una línea base medible contra la cual comparar. Sin baseline no hay forma de probar que mejoró.

### Pasos

1. Crear branch:
   ```bash
   git checkout -b redesign/site-overhaul
   ```
2. Confirmar con el usuario dos decisiones que cambian el trabajo:
   - ¿Se puede reestructurar contenido y layout, o hay que conservar estructura y solo elevar el tratamiento visual? (define si en Fase 3 se usa `redesign-existing-projects` o `wow`)
   - ¿Hay API key de Magnific? (define si `wow` puede generar assets propios)
3. Levantar el dev server con `preview_start`. Si no existe `.claude/launch.json`, crearlo:
   ```json
   {
     "version": "0.0.1",
     "configurations": [
       { "name": "impakto-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
     ]
   }
   ```
4. Baseline de build — guardar la salida completa, incluidos los tamaños de bundle por ruta:
   ```bash
   rtk -- npm run build
   ```
5. Screenshots baseline de las 6 rutas públicas (`/`, `/agencia`, `/servicios`, `/contacto`, `/privacidad`, `/terminos`) en 3 viewports (375, 768, 1440) → guardar en `.design/baseline/`.
6. Crear `.design/` y agregarlo al `.gitignore` si no se quiere versionar los artefactos intermedios.

**Salida:** `.design/baseline/` con screenshots + `.design/baseline/build.txt`.

**Gate:** existen screenshots de las 6 rutas × 3 viewports y el build de referencia. Sin esto no se avanza.

---

## Fase 1 — Auditoría

**Objetivo:** inventario completo de problemas, priorizado. **Fase de solo lectura: no se edita ni un archivo.** La tentación de "arreglar esto rápido mientras lo veo" es lo que descarrila el proceso.

### 1.1 Inventario estructural (grafo)

Usar `codebase-memory-mcp`, no grep:

- `get_architecture(aspects=['all'])` → clusters, capas, hotspots.
- `search_graph` sobre `src/components/` → qué componentes existen y cuáles tienen fan-in 0 (candidatos a código muerto).
- `query_graph` para componentes con alta complejidad ciclomática o `linear_scan_in_loop ≥ 1` en el render path.

Entregable: mapa de qué compone cada página y qué se reusa.

### 1.2 Auditoría técnica

Invocar `web-quality-audit` sobre cada ruta pública. Complementar con:

- `claude-seo:seo-audit` — crawl, health score, delega a especialistas.
- `core-web-vitals` — medición, sin aplicar fixes todavía.
- `accessibility` — WCAG 2.2 nivel AA.
- `web-best-practices` — vulnerabilidades y patrones obsoletos.

### 1.3 Auditoría de assets

Chequeo manual, es rápido y da hallazgos concretos:

- Peso y formato de cada archivo en `public/`. Hoy: 1.7 MB, con `carballal-prop.jpg` en 140 KB y logos de clientes mezclando `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`.
- Assets boilerplate de Next sin usar: `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, más `.DS_Store`.
- Fuentes: verificar que efectivamente carguen (ver hallazgo precargado #1).
- Uso de `next/image`: hay 18 archivos importándolo y cero `<img>` crudos. Verificar que cada uno tenga `sizes` correcto y que `priority` esté solo en el LCP.

### 1.4 Auditoría visual

- `design:design-critique` — crítica estructurada.
- `design-taste-frontend` en modo audit-first — detecta patrones genéricos y "slop" de IA.
- Revisar consistencia interna: cuántas variantes de botón, card, radio de borde y sombra existen de hecho vs. cuántas deberían existir. Empezar por `src/components/ui/`.
- Verificar contraste de los tokens actuales. `--color-primary #a49a82` sobre `--color-background #f5f6f2` da un ratio bajo: si se usa para texto, no pasa AA.

### 1.5 Auditoría de comunicación

Por cada página, completar esta tabla:

| Sección | Qué trabajo hace | Promesa que comunica | ¿Redundante con otra sección? |
|---|---|---|---|

Buscar: más de un CTA primario por página, secciones que repiten el mismo mensaje, jerarquía H1→H2→H3 rota, texto que suena a IA.

### 1.6 Consolidar

Todo va a `.design/audit/`:

- `technical.md` — CWV, bundle, a11y, SEO, seguridad
- `visual.md` — sistema de diseño, consistencia, tipografía, color
- `content.md` — mapa de mensaje por página
- `findings.csv` — columnas: `id, fase, archivo:línea, severidad (P0/P1/P2), impacto, esfuerzo, fix propuesto`

Priorizar por impacto ÷ esfuerzo. Los P0 se hacen sí o sí; los P2 solo si sobra tiempo.

**Gate:** cada hallazgo tiene archivo y línea, severidad, fix propuesto y estimación. Un hallazgo sin ubicación concreta no es un hallazgo, es una opinión. Presentar el `findings.csv` al usuario y confirmar prioridades antes de tocar código.

---

## Fase 2 — Técnico

**Objetivo:** base sólida. Nada visual todavía.

### Umbrales objetivo

| Métrica | Objetivo | Mínimo aceptable |
|---|---|---|
| LCP (móvil, 4G) | ≤ 2.0 s | 2.5 s |
| INP | ≤ 150 ms | 200 ms |
| CLS | ≤ 0.05 | 0.1 |
| Lighthouse Performance | ≥ 95 | 90 |
| Lighthouse Accessibility | 100 | 100 |
| Lighthouse Best Practices | 100 | 95 |
| Lighthouse SEO | 100 | 100 |
| JS inicial (gzip) | ≤ 200 KB | 250 KB |
| Contraste texto | ≥ 4.5:1 | 4.5:1 |
| Contraste UI / bordes | ≥ 3:1 | 3:1 |

### 2.1 Fuentes — hacer esto primero

Es el fix de mayor impacto visual del proyecto entero y cuesta poco.

1. Verificar la licencia de Season Serif. El token en `globals.css` dice `"Season Serif TRIAL Regular"` — una fuente trial no se puede usar en producción. Si no hay licencia comprada, se compra o se reemplaza. **Decisión del usuario, no asumir.**
2. Implementar `next/font/local` en `src/app/layout.tsx` apuntando a los `.woff2` de `public/fonts/`:
   - `display: 'swap'`
   - subset latin
   - `preload: true` solo en la variante que usa el H1 del hero; el resto `preload: false`
   - exponer como CSS variable y consumirla desde el token `--font-heading` / `--font-sans`
3. Eliminar del token la cadena de fallbacks decorativos ("The Seasons", "Baskerville") y dejar un fallback real con métricas parecidas para evitar CLS en el swap.
4. Verificar con DevTools que las 5 fuentes cargan y que no hay FOUT visible.

### 2.2 Imágenes

- Convertir los logos de clientes a un formato único (webp o avif). Bajan de ~1.2 MB a una fracción.
- `sizes` explícito en cada `next/image` — sin él Next sirve la imagen más grande.
- `priority` solo en la imagen del LCP de cada ruta. En el resto, `loading="lazy"`.
- `placeholder="blur"` en las imágenes grandes de contenido.
- Borrar los SVG boilerplate de Next y el `.DS_Store`.

### 2.3 Core Web Vitals

Invocar `core-web-vitals`. Sospechosos principales en este stack:

- **Lenis** (`SmoothScroll.tsx`) — el smooth scroll por JS es la causa más común de INP alto. Medir su costo real antes de defenderlo.
- **framer-motion** — verificar que se importe granular y no entero; revisar cuántos componentes montan animación arriba del fold.
- **AnimatedMeshBackground** — canvas en el hero. Medir su impacto en LCP y en el main thread.
- React Compiler ya está activo (`next.config.ts`), así que no hace falta memoizar a mano.

### 2.4 Accesibilidad

Invocar `accessibility`. Puntos específicos de este sitio:

- `cursor: none` global en `globals.css` con `CustomCursor` encima. Verificar que el cursor custom no rompa la percepción de affordance ni el foco por teclado. Si un usuario navega con teclado, el cursor custom debe desaparecer.
- Focus visible en todos los interactivos. El `:focus` por defecto de Tailwind v4 no alcanza para AA en fondos claros.
- El skip link ya existe en `layout.tsx` — verificar que efectivamente llegue a `#contenido-principal` en las 6 rutas.
- Formulario de contacto: labels asociados, mensajes de error vinculados por `aria-describedby`, estado de envío anunciado por live region.
- Contraste de todos los tokens. Corregir los que no pasen antes de la Fase 3, para no diseñar sobre una paleta que después hay que cambiar.

### 2.5 Seguridad y headers

Agregar en `next.config.ts`: CSP, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Cuidado con la CSP: el sitio carga fuentes propias y hace POST a `/api/contacto`.

### 2.6 SEO técnico

- `metadata` propia y específica por ruta (hoy varias heredan el default).
- JSON-LD: `Organization` + `LocalBusiness` en el root, `Service` en `/servicios`, `BreadcrumbList` donde aplique.
- OG image por ruta en vez de un `share.jpg` único.
- Verificar que `sitemap.ts` liste las 6 rutas y que `robots.ts` no bloquee nada del sitio público.
- No hardcodear el dominio: usar `siteUrl` de `lib/site.ts`.

**Gate:** `rtk -- npm run build` sin warnings, `npm run lint` limpio, y Lighthouse en las 6 rutas dentro de los umbrales. Commit por bloque (fuentes, imágenes, CWV, a11y, SEO).

---

## Fase 3 — Visual

**Objetivo:** que el sitio se lea como un sistema, no como una colección de secciones.

### 3.1 Sistema antes que páginas

No tocar ninguna página hasta tener definido y documentado en `globals.css`:

- **Escala tipográfica modular.** Un ratio (1.25 o 1.333), no tamaños arbitrarios. Definir los pasos como tokens.
- **Escala de espaciado.** Un solo múltiplo base. El espaciado inconsistente es la señal más visible de trabajo amateur.
- **Jerarquía de sombras.** Ya existen `--shadow-premium-{soft,deep,glow}`. Definir cuándo se usa cada una; si una no tiene caso de uso claro, se borra.
- **Un solo easing.** `--ease-luxury` ya está. Toda transición lo usa, sin excepciones.
- **Escala de duración.** Tokens de 150/250/400/700 ms según el tipo de movimiento.

Invocar `high-end-visual-design` para las reglas duras de tipografía, espaciado, sombras y cards.

### 3.2 Aplicación

Según lo que se decidió en Fase 0:

- **Conservar estructura** → skill `wow`. Sube tratamiento visual, movimiento y assets sin tocar estructura ni contenido. Bajo riesgo, y aprovecha que el copy y el layout ya funcionan.
- **Reestructurar** → skill `redesign-existing-projects`. Audita, detecta patrones genéricos de IA y aplica estándares high-end, con permiso para mover cosas.

Complementar con `design-taste-frontend` (anti-slop, audit-first) durante la ejecución, no solo al final.

### 3.3 Movimiento

Skill `epic-design` para scroll cinematográfico: parallax, secciones que se solapan, revelados por clip-path, tipografía que entra desde los costados.

Reglas de contención:

- Ninguna animación bloquea el render del LCP.
- Todo respeta `prefers-reduced-motion` — no como afterthought, como parte de cada componente.
- Nada anima `width`, `height`, `top` ni `left`. Solo `transform` y `opacity`.
- Si el INP sube por encima de 200 ms, la animación se revierte. La medición gana a la preferencia estética.

### 3.4 Assets propios

Los logos de clientes tienen calidad y formato dispares — es lo que más delata a un sitio de agencia. Opciones, en orden de preferencia:

1. Pedir los originales vectoriales a cada cliente.
2. Normalizar a monocromo sobre fondo transparente, todos con la misma altura óptica.
3. Si hay Magnific, `wow` los regenera.

Para imágenes de contenido nuevas, usar `imagegen-frontend-web` para generar referencias antes de codear.

### 3.5 Consistencia

Pasada final de sistema: una sola variante de botón por jerarquía (primario, secundario, terciario), un solo lenguaje de card, un solo radio de borde. Auditar `src/components/ui/` y consolidar.

**Gate:** screenshots nuevos vs. `.design/baseline/` lado a lado en los 3 viewports. Lighthouse dentro de umbrales — el rediseño no puede haber costado performance. Cero hex sueltos: `grep -rn "#[0-9a-fA-F]\{3,6\}" src/components src/app/\(marketing\)` devuelve vacío.

---

## Fase 4 — Comunicación

**Objetivo:** que cada página diga una cosa y la diga bien.

### 4.1 Mapa de mensaje

Antes de escribir, definir por página: **una** promesa central, **un** CTA primario, y la jerarquía H1→H2 que la sostiene. Si una página necesita dos promesas, probablemente son dos páginas.

### 4.2 Copy

Invocar `copywriting` para headlines, subheadlines, propuesta de valor y CTAs. Encima, siempre, `humanizer`: fuera em dashes de más, regla de tres, vocabulario típico de IA, voz pasiva innecesaria, frases de relleno.

Criterio de corte: leerlo en voz alta. Si suena a folleto o a modelo de lenguaje, se reescribe.

### 4.3 Microcopy

Skill `design:ux-copy` para lo que casi nunca se revisa y siempre se nota:

- Labels y placeholders del formulario de contacto.
- Mensajes de error (el `/api/contacto` ya devuelve mensajes en español — que coincidan con el tono del sitio).
- Estado de envío y confirmación.
- Texto del botón flotante de WhatsApp.
- `not-found.tsx`.
- Textos de `/privacidad` y `/terminos` — legibles, no copiados de una plantilla.

### 4.4 Coherencia con los emails

La voz del sitio y la de los emails transaccionales tienen que ser la misma. Revisar `src/utils/emailTemplate.ts` y las plantillas de `email_templates`, y alinear. Un cliente que lee la web y después recibe un recordatorio de pago debería reconocer la misma marca.

**Gate:** cada página tiene una promesa y un CTA primario. Ningún texto pasa el detector de `humanizer`. Coherencia verificada entre sitio y emails.

---

## Fase 5 — Verificación y cierre

1. `rtk -- npm run build` limpio.
2. `npm run lint` limpio.
3. Lighthouse en las 6 rutas, móvil y desktop, contra la tabla de umbrales.
4. Navegación completa solo con teclado, en las 6 rutas.
5. Prueba real del formulario de contacto — que llegue el mail por Brevo.
6. Revisión en dispositivo móvil real, no solo en el emulador.
7. Screenshots finales vs. baseline, los 3 viewports.
8. `/code-review` sobre el diff completo del branch.
9. Deploy a preview de Vercel y revisión ahí antes de mergear a `main`.

**Entregable final:** un resumen con métricas antes/después, qué se hizo por fase, y qué quedó fuera con su razón.

---

## Gates — resumen

| Fase | No se avanza hasta que |
|---|---|
| 0 | Existen baseline de screenshots y de build |
| 1 | `findings.csv` con archivo:línea, severidad y esfuerzo, y prioridades confirmadas por el usuario |
| 2 | Build y lint limpios + Lighthouse dentro de umbrales |
| 3 | Comparación visual aprobada + CWV sin regresión + cero hex sueltos |
| 4 | Una promesa y un CTA por página + copy pasa `humanizer` |
| 5 | Preview deploy revisado |

---

## Hallazgos precargados

Detectados en la auditoría del 2026-08-20. Ya están verificados: no hace falta redescubrirlos en Fase 1.

1. **Las fuentes no cargan. P0, visual.** Existen 5 `.woff2` en `public/fonts/` pero no hay ningún `@font-face` ni `next/font` en el repo. El sitio renderiza con los fallbacks (Georgia / system-ui), no con Season Serif ni el Inter custom. Se ve "bien" en la máquina del usuario porque tiene las fuentes instaladas localmente; para todos los demás, no. Fix en §2.1.
2. **Licencia de fuente.** El token `--font-heading` nombra `"Season Serif TRIAL Regular"`. Una trial no se usa en producción. Verificar con el usuario antes de invertir en tipografía.
3. **Assets muertos.** `public/{next,vercel,file,globe,window}.svg` y `public/.DS_Store`.
4. **Logos de clientes inconsistentes.** 20 archivos en `.jpg`, `.jpeg`, `.png`, `.webp` y `.svg`, hasta 140 KB cada uno. Sobre 1.7 MB totales de `public/`, son la mayor parte.
5. **Contraste dudoso.** `--color-primary #a49a82` sobre `--color-background #f5f6f2` no llega a 4.5:1. Verificar dónde se usa como texto.
6. **Fuera de scope pero bloqueante aparte:** `setup_db.js` y `setup_user.js` están versionados con la contraseña de Postgres, la `service_role` key y la contraseña del admin en texto plano. No es parte de este playbook, pero hay que rotar esas credenciales. Ver §10 de `CLAUDE.md`.
