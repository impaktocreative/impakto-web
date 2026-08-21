# Esquema de base de datos

Postgres. La base resuelve tres cosas que la aplicación no puede resolver sola: el cache compartido del ticket, la serialización de la numeración y la traza de auditoría.

## Migración

```sql
create extension if not exists pgcrypto;

-- Un tenant es cada CUIT que factura a través de la app.
create table arca_tenants (
  id              uuid primary key default gen_random_uuid(),
  cuit            bigint unique not null,
  razon_social    text not null,
  condicion_fiscal text not null
                  check (condicion_fiscal in ('monotributo','responsable_inscripto','exento')),
  pto_vta         int not null,
  -- Modelo B: credenciales propias del tenant, cifradas.
  cert_cifrado    bytea,
  key_cifrada     bytea,
  delegacion_ok_at timestamptz,
  activo          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Cache del ticket de acceso. Una fila por servicio (modelo A)
-- o por tenant y servicio (modelo B).
create table arca_ta_cache (
  clave       text primary key,          -- 'wsfe' o '<tenant_id>:wsfe'
  token       text not null,
  sign        text not null,
  expira      timestamptz not null,
  actualizado timestamptz not null default now()
);

-- Contador correlativo. La numeración se toma de acá, no de ARCA.
create table arca_contadores (
  tenant_id      uuid not null references arca_tenants(id),
  pto_vta        int not null,
  cbte_tipo      int not null,
  ultimo_numero  int not null default 0,
  primary key (tenant_id, pto_vta, cbte_tipo)
);

-- Traza completa de cada emisión.
create table arca_comprobantes (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references arca_tenants(id),
  pto_vta       int not null,
  cbte_tipo     int not null,
  numero        int not null,
  estado        text not null
                check (estado in ('pendiente','autorizado','rechazado','anulado')),
  -- Referencia externa: id de orden, de suscripción, de pago.
  referencia    text,
  doc_tipo      int not null,
  doc_nro       bigint not null,
  cond_iva_receptor int not null,
  importe_total numeric(15,2) not null,
  moneda        text not null default 'PES',
  cotizacion    numeric(15,6) not null default 1,
  cae           text,
  cae_vto       date,
  observaciones jsonb,
  request_xml   text,
  response_json jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, pto_vta, cbte_tipo, numero)
);

-- Evita facturar dos veces la misma orden.
create unique index arca_comprobantes_referencia_uk
  on arca_comprobantes (tenant_id, referencia)
  where referencia is not null and estado in ('pendiente','autorizado');

create index arca_comprobantes_pendientes_idx
  on arca_comprobantes (created_at)
  where estado = 'pendiente';
```

El `unique` sobre tenant, punto de venta, tipo y número es la red de seguridad: si el lock falla por lo que sea, la base rechaza el duplicado antes de que llegue a ARCA.

El índice parcial sobre `referencia` es lo que hace idempotente la emisión desde la tienda. Si el webhook de pago llega dos veces, el segundo intento choca contra el índice y no genera una factura duplicada.

## El lock de numeración

```sql
update arca_contadores
   set ultimo_numero = ultimo_numero + 1
 where tenant_id = $1 and pto_vta = $2 and cbte_tipo = $3
 returning ultimo_numero;
```

El `update ... returning` toma el lock de fila automáticamente. Dos transacciones concurrentes se serializan y cada una obtiene un número distinto. No hace falta `select for update` explícito.

El contador se inicializa una sola vez, en el alta del tenant, con el valor que devuelve `FECompUltimoAutorizado`. Después vive en la base. Consultar ARCA en cada emisión es lento y además no protege de la concurrencia, porque dos requests simultáneos leen el mismo valor.

## Por qué la transacción se mantiene abierta durante la llamada a ARCA

La secuencia correcta es:

1. `begin`
2. reservar el número con el `update ... returning`
3. insertar el comprobante en estado `pendiente`
4. llamar a `FECAESolicitar`
5. actualizar el comprobante a `autorizado` o `rechazado`
6. `commit`

Mantener la transacción abierta durante una llamada externa lenta parece un antipatrón, pero acá es lo correcto. La numeración de un punto de venta tiene que ser correlativa y sin huecos, así que las emisiones de ese punto de venta van a serializarse de todas formas. ARCA mismo las serializa. Sostener el lock durante la llamada garantiza que un fallo haga `rollback` y libere el número, en lugar de dejar un hueco que después hay que tapar con un comprobante anulado.

Precauciones obligatorias:

```sql
set local statement_timeout = '45s';
set local lock_timeout = '10s';
```

Sin esos timeouts, una caída de ARCA deja transacciones colgadas consumiendo conexiones del pool.

## El caso borde que hay que manejar

Si ARCA otorga el CAE pero la respuesta se pierde en la red, el `rollback` libera el número mientras ARCA ya lo tiene registrado. La emisión siguiente reutiliza ese número y ARCA la rechaza con un error de comprobante ya autorizado.

La recuperación es específica: ante ese error, llamar a `FECompConsultar` con ese punto de venta, tipo y número, recuperar el CAE que ARCA ya emitió, y guardarlo. Está implementado en `lib/arca/reconciliar.ts`.

Un job periódico busca comprobantes en estado `pendiente` con más de unos minutos de antigüedad y hace la misma consulta, porque también pueden quedar así si el proceso murió entre el paso 4 y el 5.

## Cache del ticket con advisory lock

```sql
select pg_advisory_xact_lock(hashtext('arca_ta_' || $1));
```

Dentro de una transacción, este lock hace que solo una instancia pida el ticket a WSAA. Las demás esperan y después leen el valor cacheado. Sin esto, con varias instancias serverless corriendo, todas menos una reciben `coe.alreadyAuthenticated` y quedan sin poder facturar durante doce horas.

El patrón es leer el cache, si está vencido tomar el lock, volver a leer dentro del lock por si otra instancia ya lo renovó, y recién ahí pedir el ticket.

## Retención

Los comprobantes no se borran. La normativa fiscal exige conservarlos, y ante una discusión con un cliente la traza del `request_xml` y el `response_json` es la única evidencia de qué se envió y qué respondió ARCA.

Si la tabla crece demasiado, se archiva por partición de fecha, nunca con `delete`.
