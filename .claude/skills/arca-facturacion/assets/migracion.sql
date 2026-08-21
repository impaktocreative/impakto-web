-- Migración de facturación ARCA.
-- Ver references/esquema-db.md para el razonamiento detrás de cada tabla.

create extension if not exists pgcrypto;

create table arca_tenants (
  id               uuid primary key default gen_random_uuid(),
  cuit             bigint unique not null,
  razon_social     text not null,
  condicion_fiscal text not null
                   check (condicion_fiscal in ('monotributo','responsable_inscripto','exento')),
  pto_vta          int not null,
  cert_cifrado     bytea,
  key_cifrada      bytea,
  delegacion_ok_at timestamptz,
  activo           boolean not null default true,
  created_at       timestamptz not null default now()
);

create table arca_ta_cache (
  clave       text primary key,
  token       text not null,
  sign        text not null,
  expira      timestamptz not null,
  actualizado timestamptz not null default now()
);

create table arca_contadores (
  tenant_id     uuid not null references arca_tenants(id),
  pto_vta       int not null,
  cbte_tipo     int not null,
  ultimo_numero int not null default 0,
  primary key (tenant_id, pto_vta, cbte_tipo)
);

create table arca_comprobantes (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references arca_tenants(id),
  pto_vta           int not null,
  cbte_tipo         int not null,
  numero            int not null,
  estado            text not null
                    check (estado in ('pendiente','autorizado','rechazado','anulado')),
  referencia        text,
  doc_tipo          int not null,
  doc_nro           bigint not null,
  cond_iva_receptor int not null,
  importe_total     numeric(15,2) not null,
  moneda            text not null default 'PES',
  cotizacion        numeric(15,6) not null default 1,
  cae               text,
  cae_vto           date,
  observaciones     jsonb,
  request_xml       text,
  response_json     jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (tenant_id, pto_vta, cbte_tipo, numero)
);

-- Idempotencia: una orden genera un solo comprobante.
create unique index arca_comprobantes_referencia_uk
  on arca_comprobantes (tenant_id, referencia)
  where referencia is not null and estado in ('pendiente','autorizado');

create index arca_comprobantes_pendientes_idx
  on arca_comprobantes (created_at)
  where estado = 'pendiente';
