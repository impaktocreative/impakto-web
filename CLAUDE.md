# CLAUDE.md — Impakto Creative

Web pública + panel de administración interno de Impakto Creative (agencia, Buenos Aires). Monorepo simple: una sola app Next.js que sirve el sitio de marketing y el dashboard privado.

---

## 1. Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js **16.1.6** (App Router) con React Compiler activado (`next.config.ts`) |
| Runtime UI | React **19.2.3** |
| Lenguaje | TypeScript 5 (`strict`), alias `@/*` → `src/*` |
| Estilos | Tailwind CSS **v4** — sin `tailwind.config`, tokens en `@theme` dentro de `src/app/globals.css` |
| Base de datos + Auth | Supabase (Postgres + Supabase Auth) vía `@supabase/ssr` y `@supabase/supabase-js` |
| Email transaccional | Brevo (`@getbrevo/brevo`) |
| Animación / scroll | `framer-motion`, `lenis` (smooth scroll) |
| Utilidades | `date-fns`, `lucide-react`, `clsx` + `tailwind-merge`, `class-variance-authority`, `react-simple-wysiwyg` |
| Deploy | Vercel (crons en `vercel.json`) |

Grafo de código: 554 nodos / 1126 aristas. 83 archivos TS, 5 SQL, 2 JS, 1 CSS.

---

## 2. Estructura de carpetas

```
src/
├── app/
│   ├── (marketing)/          # sitio público — layout con Navbar/Footer/WhatsApp
│   │   ├── page.tsx          # home
│   │   ├── agencia/ servicios/ contacto/ privacidad/ terminos/
│   │   ├── layout.tsx
│   │   └── template.tsx      # transición de página por navegación
│   ├── (admin)/admin/
│   │   ├── login/            # fuera del grupo (dashboard) → sin guard
│   │   ├── AdminSidebar.tsx
│   │   └── (dashboard)/      # todo lo protegido
│   │       ├── layout.tsx    # ← guard de auth
│   │       ├── page.tsx      # dashboard principal
│   │       ├── clients/[id]/ · services/ · income/ · expenses/ · balance/ · settings/
│   │       ├── actions.ts    # server actions por carpeta
│   │       └── payment-actions.ts
│   ├── api/
│   │   ├── contacto/route.ts        # POST — form público
│   │   └── cron/reminders/route.ts  # GET — cron diario
│   ├── auth/signout/route.ts        # POST
│   ├── layout.tsx            # root: metadata SEO, fuentes, SmoothScroll, CustomCursor
│   ├── globals.css           # design tokens (@theme)
│   ├── robots.ts · sitemap.ts · not-found.tsx
├── components/
│   ├── home/ agencia/ servicios/ contact/    # secciones por página
│   ├── layout/               # Navbar, Footer, SmoothScroll, WhatsAppFloating
│   └── ui/                   # Button, Modal, Reveal, Magnetic, CustomCursor, ScrollStage, TechNodes
├── lib/site.ts               # resolución de URL canónica
├── lib/fonts.ts              # next/font: Fraunces + Inter
├── lib/billing.ts            # vencimientos, estados y retención bancaria
├── types/admin.ts            # tipos de filas + normalizeRelation()
├── utils/
│   ├── supabase/{server,client,middleware}.ts
│   ├── brevo.ts              # sendEmail()
│   └── emailTemplate.ts      # buildEmailHtml(), interpolate()
└── proxy.ts                  # refresh de sesión Supabase (ex middleware.ts)
```

**Capas según el grafo:** `app` y `middleware` son *entry* (solo llamadas salientes); `utils` es el *core* (fan-in 57, fan-out 0). Único borde relevante: `app → utils` (56 llamadas).

**Hotspots** (fan-in): `utils/supabase/server.createClient` 33 · `emailTemplate.interpolate` 8 · `emailTemplate.buildEmailHtml` 8 · `brevo.sendEmail` 7.

---

## 3. Routing

Route groups separan los dos productos sin afectar la URL:

- `(marketing)` → `/`, `/agencia`, `/servicios`, `/contacto`, `/privacidad`, `/terminos`
- `(admin)` → `/admin/login` y `/admin/*`

**Guard de auth:** está en `src/app/(admin)/admin/(dashboard)/layout.tsx`, no en el middleware. El layout hace `supabase.auth.getUser()` y `redirect('/admin/login')` si no hay usuario. `/admin/login` vive fuera del grupo `(dashboard)` justamente para quedar sin guard.

**`src/proxy.ts`** solo refresca la sesión (`updateSession`) y reescribe cookies. **No bloquea rutas.** Cualquier ruta nueva que deba ser privada tiene que colgar de `(dashboard)` o traer su propio chequeo.

Matcher: todo excepto `_next/static`, `_next/image`, `favicon.ico` e imágenes.

Next 16 renombró la convención `middleware` a `proxy`. La función se exporta como `proxy`, pero **el matcher sigue yendo en `export const config`**, no en `proxyConfig`: con ese nombre Next ignora el matcher, el proxy corre sobre todo y las páginas estáticas responden 308 hacia una URL con slash final que da 404. En dev no se nota — solo aparece con `next build` + `next start`.

---

## 4. Datos

Todo en Supabase Postgres. No hay ORM: se usa el query builder de `supabase-js` directo desde Server Components y Server Actions.

### Tablas

| Tabla | Rol |
|---|---|
| `clients` | contacto, marca, email, teléfono, web, CUIT, notas |
| `services` | catálogo: `name`, `description`, `price`, `currency`, `duration_months` |
| `client_services` | servicio contratado: `price`, `currency`, `duration_months`, `last_payment_date`, `next_payment_date`, `status` (`activo`/`vencido`/`suspendido`/`inactivo`), `receiver` (`sergio`/`rodrigo`), `deduct_bank_fee`, `domain_name`, `server_info` |
| `payments` | cobros — `amount`, `currency`, `net_amount`, `receiver`, `payment_date` |
| `expenses` | gastos recurrentes con `due_date` y `duration_months` |
| `expense_payments` | pagos de gastos, `paid_by` (`sergio`/`rodrigo`) |
| `email_templates` | PK `type`, `subject`, `body` — editables desde `/admin/settings` |
| `email_logs` | auditoría de envíos, evita recordatorios duplicados |

FKs con `ON DELETE CASCADE` (client → client_services → payments) y `ON DELETE RESTRICT` en `services`. **Borrado físico, no hay soft delete** — no existe `deleted_at` en ninguna tabla.

RLS está habilitado con políticas definidas en los `.sql`.

### Migraciones

Archivos SQL sueltos en la raíz, aplicados manualmente (no hay Supabase CLI ni carpeta `migrations/`):

```
supabase_schema.sql                     # base
supabase_expenses_migration.sql
supabase_add_due_date_expenses.sql
supabase_bank_fee_deduction.sql
supabase_email_automation_migration.sql
supabase_esquema_real.sql               # refleja la base real
supabase_pendientes.sql                 # ARCA + ajustes + ingreso manual — aplicado
supabase_movimientos_excluidos.sql      # exclude_from_totals — aplicado
```

Marcados como supersedidos, se conservan solo como registro y **no hay que correrlos**: `supabase_arca_facturacion_migration.sql`, `supabase_arca_clientes_fix.sql`, `supabase_arca_dos_emisores.sql`. Los tres asumen un emisor único o parten de tablas que nunca existieron; `supabase_pendientes.sql` los reemplaza y crea el esquema directamente con los dos emisores.

Al agregar una tabla o columna: escribir un `.sql` nuevo idempotente (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`) y correrlo desde el SQL editor de Supabase.

**Los `.sql` divergieron de la base.** Varias columnas se agregaron directo desde el editor de Supabase sin escribir el archivo. `supabase_schema.sql` dice `price_ars` donde la base tiene `price`, y no menciona `currency`, `receiver`, `deduct_bank_fee` ni `cuit`. `supabase_esquema_real.sql` documenta lo que hay de verdad y es idempotente. **Antes de asumir un nombre de columna, consultá la base, no los archivos.**

**Un archivo escrito no es una migración aplicada.** Las tablas `arca_*` figuraban como creadas durante semanas y no existía ninguna. Para verificarlo sin credenciales de escritura alcanza con PostgREST usando la service role key: `select` sobre la tabla devuelve 200 si existe, `PGRST205` si no, y 400 si la tabla está pero falta la columna.

### Correr SQL sin abrir el dashboard

Con un token de Management API (`sbp_…`, se genera en `supabase.com/dashboard/account/tokens`) se puede ejecutar DDL por HTTP:

```bash
curl -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @payload.json   # {"query": "<sql>"}
```

Devuelve el resultado de la última sentencia, así que conviene cerrar el archivo con un `SELECT` de comprobación. Las claves de la app no sirven para esto: son de PostgREST y no ejecutan DDL.

El token da acceso a toda la cuenta, no a un proyecto: es para un uso puntual y se revoca al terminar. Cloudflare rechaza el request con 403 y `error code: 1010` si el cliente no manda un User-Agent creíble — `urllib` de Python cae ahí, `curl` no.

### Reglas de facturación recurrente

Viven en `src/lib/billing.ts` y son la única implementación. Antes estaban duplicadas entre `payment-actions.ts` y `clients/[id]/actions.ts`, con dos cuentas distintas para lo mismo.

- `sumarMeses()` recorta al último día del mes destino. `new Date(iso)` + `setMonth` desbordaba los fines de mes (31 de enero + 1 mes daba 3 de marzo) y corría un día por zona horaria.
- `proximoVencimiento()` cuenta desde el vencimiento anterior, no desde el pago: el cliente contrató un período. Si el atraso fue tan grande que el nuevo vencimiento también caería en el pasado, recalcula desde el pago.
- `montoNeto()` aplica la retención bancaria del 3,5% cuando el servicio la tiene marcada.

### Estados del servicio

`activo` · `vencido` · `suspendido` · `inactivo`.

El estado lo sincroniza **el cron**, no solo el registro de un cobro. Antes solo se movía al cobrar, así que un servicio que vencía y nadie pagaba figuraba activo para siempre.

Pasados 15 días de mora el cron lo marca `suspendido` y manda **un solo mail** con todos los casos del día a los administradores (`ADMIN_ALERT_EMAILS`, por defecto `studio.impakto@gmail.com` y `rodrigo.zarza@gmail.com`). Un servicio suspendido deja de recibir recordatorios automáticos: pasa a gestión manual.

### Cadena de recordatorios de mora

Los avisos se cuentan **desde el último pago**, no desde siempre. Contando todo el historial, un servicio que se atrasó dos veces en su vida no volvía a recibir recordatorios nunca más: al detectarlo, 8 de 18 servicios estaban en ese estado. `registerPaymentAction` además borra los logs de mora al cobrar, para que el ciclo arranque limpio.

### Los tres clientes Supabase

| Archivo | Uso | Key |
|---|---|---|
| `utils/supabase/server.ts` | Server Components, Server Actions, route handlers | anon + cookies (respeta RLS) |
| `utils/supabase/client.ts` | componentes `'use client'` | anon |
| `utils/supabase/middleware.ts` | refresh de sesión en el middleware | anon |

El cron (`api/cron/reminders/route.ts`) crea aparte un cliente con `SUPABASE_SERVICE_ROLE_KEY` y `persistSession: false` porque corre sin sesión de usuario. **Ese es el único lugar donde debe aparecer la service role key.**

---

## 5. Variables de entorno

En `.env.local` (gitignoreado por `.env*`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
BREVO_API_KEY
CRON_SECRET
```

Opcionales, con fallback en código:

| Variable | Fallback | Dónde |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` / `SITE_URL` | `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `https://impaktocreative.com` | `lib/site.ts` |
| `BREVO_SENDER_EMAIL` | `hola@impaktocreative.com` | `api/contacto/route.ts` |
| `BREVO_SENDER_NAME` | `Impakto Creative` | `api/contacto/route.ts` |
| `CONTACT_TO_EMAIL` | `impaktoagency@gmail.com` | `api/contacto/route.ts` |

`VERCEL_URL` y `VERCEL_PROJECT_PRODUCTION_URL` las inyecta Vercel.

Nota: `utils/brevo.ts` tiene sender y BCC hardcodeados (`hola@impaktocreative.com`, `impaktoagency@gmail.com`), a diferencia de `api/contacto` que sí lee de env.

---

## 6. Convenciones de código

### Server Actions

9 archivos `'use server'`, uno por carpeta de feature (`clients/actions.ts`, `expenses/actions.ts`, `settings/actions.ts`, `payment-actions.ts`, …). Patrón:

```ts
'use server'
export async function updateClientAction(prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return { success: false, message: 'Nombre y marca son requeridos.' }

  const supabase = await createClient()
  const { error } = await supabase.from('clients').update({ ... }).eq('id', id)
  if (error) return { success: false, message: `Error: ${error.message}` }

  revalidatePath('/admin/clients')
  return { success: true, message: 'Cliente actualizado.' }
}
```

Reglas que sigue todo el admin:

- Firma `(prevState, formData)` para usar con `useActionState`; acciones de borrado toman el `id` directo.
- Retorno uniforme `{ success: boolean, message?: string }` — nunca se tira una excepción al cliente.
- Nunca se propaga el objeto `error` de Supabase crudo; se interpola `error.message`.
- `revalidatePath()` sobre cada ruta afectada al final, antes del return.
- Mensajes de usuario en español.

### Server vs Client Components

40 archivos `'use client'` contra 9 `'use server'`. El default es Server Component: la `page.tsx` hace el fetch a Supabase y pasa datos a un componente cliente hermano (`ClientsPage` → `ClientsTable`, `BalancePage` → `BalanceClient`, `ExpensesPage` → `ExpensesClient`). Los formularios y modales viven del lado cliente.

### Joins de Supabase

Un join anidado puede volver como objeto o como array según la relación. Por eso existe `normalizeRelation<T>()` en `src/types/admin.ts` — usarla siempre al leer relaciones, junto con los tipos `RawPaymentRow` (lo que devuelve Supabase) y `PaymentRow` (lo ya normalizado).

### Emails

Todo envío pasa por `utils/brevo.ts::sendEmail()`. El HTML se arma con `buildEmailHtml(body)` (tabla responsive, header negro con logo, footer de marca) y las variables se reemplazan con `interpolate()` usando placeholders `{{nombre}}`, `{{servicio}}`, `{{marca}}`, `{{dominio}}`, `{{monto}}`, `{{dias}}`, `{{dias_vencido}}`.

Las plantillas se leen de `email_templates`; si la fila no existe, cada punto de envío define su `TEMPLATE_FALLBACKS` en código. Al agregar un tipo de recordatorio hay que tocar los dos lugares.

### Animación y LCP

**Nada above the fold puede arrancar en `opacity: 0` vía JS.** framer-motion aplica el estado inicial recién al hidratar, así que el elemento no cuenta como pintado y el LCP se dispara. En este sitio costaba entre 2 y 4 segundos por ruta.

Para entradas above the fold va la animación CSS `.hero-rise` (+ `.hero-rise-delay-{1,2,3}`) definida en `globals.css`: arranca en el primer pintado, sin esperar JS, y respeta `prefers-reduced-motion`. framer-motion queda para lo que se dispara por scroll o por interacción.

Misma razón detrás del guard de primera carga en `(marketing)/template.tsx`: la cortina de transición cubría la pantalla hasta 1.55 s después de hidratar. Ahora solo corre en navegaciones internas.

### Fuentes

`src/lib/fonts.ts` carga Fraunces (titulares) e Inter (cuerpo) con `next/font/google`, las expone como CSS variables y `globals.css` las consume desde `--font-heading` y `--font-sans`. No agregar `@font-face` a mano ni `<link>` a Google Fonts.

Antes había 5 `.woff2` en `public/fonts/` que nunca se cargaban — sin `@font-face` ni `next/font` — y el sitio renderizaba con los fallbacks del sistema. La fuente original (Season Serif) era una trial sin licencia.

### Estilos

Todo sale de `@theme` en `globals.css`. **Cero valores sueltos en componentes** — ni hex, ni `text-[1.02rem]`, ni `rounded-[0.9rem]`, ni `shadow-[...]`. Si falta algo, se agrega como token primero.

Los nombres son propios a propósito (`text-body`, `rounded-card`) en vez de pisar los de Tailwind (`text-sm`, `rounded-md`): el admin usa las utilidades por defecto — 279 `text-sm`, 141 `rounded-md` — y redefinirlas le cambiaría la interfaz entera.

**Color.** `primary`, `secondary` y `accent` solo pasan AA sobre `night` y `night-soft`; sobre `background` dan 2.57, 2.66 y 1.27. Para texto o bordes sobre fondo claro va `primary-ink` / `secondary-ink`.

```
--color-primary #a49a82 · --color-secondary #8e9b93 · --color-accent #d8ddd7
--color-primary-ink #736c5b · --color-secondary-ink #636c67
--color-background #f5f6f2 · --color-band #f7f8f5 · --color-surface #fcfcfa
--color-surface-muted #eef1ec · --color-foreground #32322f
--color-night #1f2327 · --color-night-soft #2d3136
--color-whatsapp #2f8d68 · --color-whatsapp-strong #246f53
```

**Tipografía.** Seis pasos de texto y seis de titular, cada uno con su interlineado pareado. No hace falta poner `leading-*` a mano.

```
texto:    text-eyebrow 12 · text-caption 13 · text-body-sm 15
          text-body 17 · text-body-lg 19 · text-lead 22
titular:  text-display-{xs,sm,md,lg,xl,2xl}  — clamp() fluido, sin escaleras de breakpoint
```

Piso de 12px para cualquier texto. Los titulares no llevan escalera `sm:/md:/lg:`: el `clamp()` ya escala.

**Forma, sombra, movimiento.**

```
--radius-{inset,card,panel}  ·  rounded-full para píldoras
--shadow-premium-{soft,lift,deep,night,glow}
--shadow-premium-gold · --shadow-node-glow · --shadow-whatsapp
--duration-{fast,base,slow,slower,ambient}  150/300/500/700/1200ms
--ease-luxury cubic-bezier(0.16, 1, 0.3, 1)  — el único easing
--font-heading Fraunces · --font-sans Inter
```

Antes de esta consolidación el home tenía 33 tamaños de fuente, 26 interlineados, 16 radios, 28 sombras y 19 colores escritos a mano.

El sitio público usa cursor custom (`cursor: none` global + `CustomCursor`). El admin lo desactiva agregando `.is-admin` al body vía `AdminBodyClass` — cualquier estilo global nuevo debe contemplar esa clase.

El admin va con paleta neutra de Tailwind (`bg-gray-50`, `text-gray-900`), no con los tokens de marca. Son dos sistemas visuales distintos a propósito.

**Componentes compartidos del admin** en `src/app/(admin)/admin/ui/`:

- `IconButton` / `IconLink` / `IconButtonGroup` — todo botón de icono sale de acá. 36px, icono de 16, un solo radio y un solo foco. `label` sirve de `aria-label` y de `title`. Los tonos (`neutral`, `peligro`, `exito`, `aviso`) pintan al pasar por encima, no en reposo: una columna con un botón rojo por fila grita en cada renglón.
- `EstadoBadge` / `VencimientoBadge` / `ReceptorBadge` — el estado dice en qué situación está el servicio, el vencimiento dice cuánto falta o cuánta mora lleva. No repetir el mismo dato en dos etiquetas.

Antes de escribir un botón de icono o una etiqueta de estado a mano: usar estos. La versión anterior tenía dos tamaños de botón, ocho de icono y tres grises para lo mismo.

### API Routes

- `POST /api/contacto` — valida campos requeridos, `sanitize()` + `escapeHtml()` sobre todo input antes de meterlo en el HTML del mail, chequea formato de email por regex, y envía por Brevo.
- `GET /api/cron/reminders` — exige `Authorization: Bearer ${CRON_SECRET}`, devuelve 401 sin él.
- `POST /auth/signout` — cierra sesión y redirige a `/admin/login`.

### SEO

`metadata` centralizada en `src/app/layout.tsx` (OG, Twitter card, robots, `metadataBase` desde `siteUrl`). Cada página de marketing exporta su propia `metadata` para el título. `robots.ts` y `sitemap.ts` son generados y también consumen `siteUrl` — no hardcodear el dominio.

---

## 7. Scripts

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm run lint     # eslint (flat config, eslint.config.mjs)
```

Global CLAUDE.md manda usar RTK para output ruidoso:

```bash
rtk -- npm run build
```

Scripts sueltos en la raíz, corridos a mano con `node`, no parte del build:

- `setup_db.js` — aplica `supabase_schema.sql` por conexión `pg` directa
- `setup_user.js` — crea el usuario admin vía `auth.admin.createUser`

---

## 8. Deploy

Vercel, conectado a `main` (push a `main` = deploy a producción). Sin `vercel.ts`, la config es `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/reminders", "schedule": "0 11 * * *" }] }
```

Un solo cron: 11:00 UTC diarias (8:00 AM en Argentina). Vercel manda el header `Authorization: Bearer $CRON_SECRET` automáticamente cuando `CRON_SECRET` está definida en el proyecto.

Las env vars se cargan en el dashboard de Vercel o con `vercel env`. Las `.env.local` no se suben.

---

## 9. Lecciones aprendidas

- **El middleware no protege rutas.** Solo refresca sesión. Toda ruta privada nueva va dentro de `(dashboard)` o implementa su propio `getUser()` + `redirect()`.
- **Joins de Supabase devuelven objeto o array.** Sin `normalizeRelation()` el build de TS rompe o los datos llegan `undefined` en runtime.
- **Las plantillas de email están duplicadas** entre la tabla `email_templates` y los `TEMPLATE_FALLBACKS` en código. Cambiar una sin la otra deja fallbacks desactualizados.
- **No hay soft delete.** Un `delete` sobre `clients` arrastra en cascada `client_services` y `payments`. Confirmar antes de ejecutar borrados.
- **`setup_db.js` y `setup_user.js` tenían credenciales en texto plano** y están en el historial de git. Ya leen de entorno (`setup_db.mjs`, `setup_user.mjs`), pero **la rotación sigue pendiente**: sacar el secreto del código no invalida lo que ya se publicó.
- **El remoto de git tenía un token de GitHub embebido** en `.git/config`. Rotarlo también.
- **Editar o borrar un pago mueve el vencimiento del servicio.** `recalcularServicio()` lo rehace desde los pagos que quedan. Antes solo se actualizaba al registrar, así que corregir un error dejaba al servicio figurando al día.
- **El aviso de pago duplicado se consultaba después de insertar**, así que encontraba el pago recién creado y saltaba en todos los cobros.
- **`new Date('YYYY-MM-DD')` es medianoche UTC.** En Argentina eso cae el día anterior: un pago del 21 se mostraba el 20, y el conteo de días hasta el vencimiento salía corrido. Para columnas `date` va `fechaLocal()` / `diasHasta()` de `src/lib/fecha.ts`; `new Date()` directo solo sirve para `timestamptz` como `created_at`.
- **Un archivo `.sql` escrito no es una migración aplicada.** Verificar contra la base antes de escribir cualquier migración que dependa de la anterior.

---

## 10. Pendientes conocidos

1. **Credenciales expuestas en git.** `setup_db.js` y `setup_user.js` están trackeados e incluyen la contraseña de Postgres, la `service_role` key completa y la contraseña del usuario admin. Hay que rotar las tres en Supabase, reescribir los scripts para leer de `process.env` y agregarlos a `.gitignore`. La rotación es lo urgente: sacarlos del repo no invalida lo que ya está en el historial.
2. `updateSession` en `utils/supabase/middleware.ts` llama a `getUser()` y descarta el resultado — la llamada es necesaria para el refresh, pero el `user` sin usar dispara warning de lint.
3. Los `prevState: any` en las server actions podrían tiparse con el tipo de retorno de cada acción.
4. **`AGENT_GUIDE.md` está desactualizado.** Manda leer `../PROJECT_MAP.md`, `../design_system_blueprint.md` y `../.agents/skills/` — ninguno existe en `/Users/sergio/Projects/`. Este `CLAUDE.md` reemplaza esas referencias; el `AGENT_GUIDE` solo sirve ya por el tono de diseño ("Design by Subtraction", "Negative Friction", premium high-ticket).
5. **La facturación ARCA tiene el esquema y los datos, no la emisión.** Los CUIT de los dos emisores se cargan desde `/admin/settings` y los datos fiscales de cada cliente desde su ficha. Falta portar la librería (WSAA, WSFEv1, QR de la RG 4892), la página `/admin/facturacion` y el enganche con `registerPaymentAction`. Los emisores arrancan con CUIT `-1` y `-2`: son placeholders para que un CUIT sin cargar no pase por válido. **Nada puede emitir hasta que se carguen los reales**, junto con el punto de venta habilitado y el certificado de homologación.
6. **`DATA.txt` en la raíz** tiene las claves del proyecto en texto plano. Está en `.gitignore` y nunca se commiteó — verificado contra todo el historial — pero sigue en el disco sin cifrar.
