---
name: arca-facturacion
description: Implementa facturación electrónica de ARCA (ex AFIP, Argentina) en proyectos Next.js, incluyendo tiendas online que necesitan emitir comprobantes automáticos al confirmarse una venta. Cubre WSAA (autenticación por certificado X.509 y firma CMS), WSFEv1 (solicitud de CAE), arquitectura multi tenant para operar por cuenta de varios clientes, cache del ticket de acceso, numeración correlativa con lock, notas de crédito, QR de RG 4892 y reconciliación ante timeouts. Usá este skill siempre que aparezcan las palabras ARCA, AFIP, factura electrónica, CAE, CUIT, monotributo, comprobante, WSFEv1, WSAA, punto de venta, o cuando el proyecto necesite emitir facturas argentinas desde una tienda online o panel de administración, aunque no se mencione ARCA explícitamente.
---

# Facturación electrónica ARCA en Next.js

Este skill implementa emisión automática de comprobantes fiscales argentinos desde una aplicación Next.js. Está pensado para un desarrollador que mantiene varios proyectos de clientes distintos y necesita repetir la misma integración en cada uno sin volver a resolver los mismos problemas.

## Antes de escribir código, definir la arquitectura

ARCA no entrega API keys. La autenticación es por certificado digital X.509 y firma CMS. Hay dos modelos posibles y la elección cambia todo el diseño, así que preguntale al usuario cuál aplica antes de avanzar:

**Modelo A, certificado del desarrollador con delegación.** Un solo certificado, emitido a nombre del CUIT del desarrollador o de su empresa. Cada cliente delega el servicio `wsfe` a ese CUIT desde el Administrador de Relaciones. En cada llamada a WSFEv1 el header `Auth` lleva el token y sign del certificado del desarrollador, y el campo `Cuit` lleva el CUIT del cliente que factura.

**Modelo B, certificado propio de cada cliente.** Cada cliente genera su par de claves y su certificado bajo su propio CUIT, y la app almacena esas credenciales cifradas por tenant. El CUIT del desarrollador no participa.

El modelo A tiene onboarding más simple y un solo secreto que custodiar. El modelo B aísla a cada cliente y deja al desarrollador fuera de la cadena de responsabilidad ante ARCA. Para trabajo de agencia con clientes de terceros, el modelo B es la opción defendible; leé `references/riesgo-y-responsabilidad.md` antes de recomendar uno.

El código de este skill soporta ambos: la diferencia está en de dónde salen el certificado y la clave privada, resuelto en `lib/arca/credenciales.ts`.

## Orden de implementación

Seguí este orden. Cada paso se verifica antes de pasar al siguiente, porque los errores de ARCA son poco descriptivos y acumular tres capas sin probar hace que el diagnóstico sea imposible.

1. **Trámites en ARCA.** Certificado, autorización al servicio y punto de venta. Sin esto el código no tiene nada contra qué probar. Ver `references/tramites-arca.md`.
2. **Migración de base de datos.** Tablas de tenants, contadores, comprobantes y cache del ticket. Ver `references/esquema-db.md`.
3. **WSAA.** Obtener un ticket de acceso y confirmar que se cachea. Probar con el script de verificación antes de seguir.
4. **WSFEv1 en modo lectura.** `FEDummy` y `FECompUltimoAutorizado`. Confirma que la delegación y el punto de venta están bien.
5. **Emisión.** `FECAESolicitar` con la numeración tomada de la base, no de ARCA.
6. **Integración con la tienda.** Disparador, idempotencia y notas de crédito. Ver `references/ecommerce.md`.

## Variables de entorno

Los certificados nunca van al filesystem del proyecto ni al repositorio. En Vercel el disco es efímero y de solo lectura fuera de `/tmp`, así que van como variables de entorno en base64.

```
ARCA_ENV=homologacion            # o produccion
ARCA_CUIT_EMISOR=20123456789     # CUIT que factura (modelo A: el del cliente)
ARCA_PTO_VTA=2
ARCA_CERT_BASE64=...             # base64 del .crt
ARCA_KEY_BASE64=...              # base64 del .key
DATABASE_URL=postgres://...
```

Para generarlas:

```bash
base64 -i cert.crt | tr -d '\n'
base64 -i private.key | tr -d '\n'
```

En modelo B multi tenant, `ARCA_CERT_BASE64` y `ARCA_KEY_BASE64` se reemplazan por credenciales cifradas en base, una fila por tenant. Ver `lib/arca/credenciales.ts`.

## Restricciones del entorno que rompen implementaciones

Estas cuatro cosas causan la mayoría de los fallos en producción. Respetalas desde el primer commit en lugar de descubrirlas después.

**Runtime Node, nunca Edge.** La firma CMS necesita el módulo `crypto` completo. Todo route handler que toque ARCA lleva `export const runtime = 'nodejs'`.

**Un ticket de acceso por certificado y servicio cada 12 horas.** Si dos instancias serverless piden un ticket al mismo tiempo, ARCA rechaza la segunda con `coe.alreadyAuthenticated`. El cache va en Postgres con advisory lock, jamás en memoria ni en archivo.

**Numeración correlativa sin huecos.** Dos requests simultáneos que consultan el último número autorizado obtienen el mismo. La numeración se reserva con un lock de fila en la base, y el número se toma del contador local, no de ARCA.

**Fechas con offset horario real.** Armar el `generationTime` del TRA con `toISOString()` y concatenarle `-03:00` produce una fecha en el futuro y ARCA la rechaza con `xml.generationTime.invalid`. Usá el helper de `lib/arca/wsaa.ts`, que calcula el offset de la máquina.

## Archivos incluidos

Copiá `lib/arca/` dentro del proyecto, típicamente a `src/lib/arca/`. Los archivos son TypeScript sin dependencias de framework más allá de `pg`, así que funcionan igual en route handlers, server actions o un worker.

| Archivo | Qué resuelve |
|---|---|
| `lib/arca/config.ts` | Endpoints por entorno y lectura de variables |
| `lib/arca/credenciales.ts` | Carga del certificado y clave, single tenant o por tenant |
| `lib/arca/wsaa.ts` | TRA, firma CMS y `loginCms` |
| `lib/arca/ta-cache.ts` | Cache del ticket en Postgres con advisory lock |
| `lib/arca/wsfe.ts` | Cliente SOAP genérico de WSFEv1 |
| `lib/arca/numeracion.ts` | Reserva de número con lock de fila |
| `lib/arca/comprobantes.ts` | Armado del detalle según condición fiscal del emisor |
| `lib/arca/emitir.ts` | Orquestación completa de la emisión |
| `lib/arca/qr.ts` | URL del código QR de RG 4892 |
| `lib/arca/reconciliar.ts` | Recuperación de comprobantes que quedaron pendientes |
| `lib/arca/tipos.ts` | Tipos TypeScript y tablas de códigos |

## Referencias

Leé el archivo que corresponda al problema que estés resolviendo. No hace falta cargarlos todos.

- `references/tramites-arca.md` — pasos exactos en el portal de ARCA, para el desarrollador y para cada cliente. Incluye el instructivo que se le manda al cliente.
- `references/esquema-db.md` — SQL completo, lock de numeración y por qué la transacción se mantiene abierta durante la llamada a ARCA.
- `references/codigos-arca.md` — tipos de comprobante, tipos de documento, condición frente al IVA del receptor, alícuotas y conceptos.
- `references/ecommerce.md` — cuándo disparar la emisión en una tienda online, idempotencia contra la orden, notas de crédito por devolución y qué hacer si ARCA está caído.
- `references/errores-comunes.md` — códigos de error reales y su causa.
- `references/riesgo-y-responsabilidad.md` — qué implica para el desarrollador operar con su certificado por cuenta de clientes.

## Reglas de comportamiento al implementar

**No inventes códigos.** Los códigos de tipo de comprobante y de condición frente al IVA cambian por resolución general. Traelos en runtime con `FEParamGetTiposCbte` y `FEParamGetCondicionIvaReceptor` y cacheálos, en lugar de hardcodearlos. La tabla de `references/codigos-arca.md` sirve como referencia de lectura, no como fuente de verdad.

**Factura C no lleva nodo `Iva`.** Si el emisor es monotributista, `ImpNeto` es igual a `ImpTotal`, `ImpIVA` es cero y el array de alícuotas se omite por completo. Incluirlo hace que ARCA rechace el comprobante.

**`CondicionIVAReceptorId` es obligatorio** desde la RG 5616. Un comprobante sin ese campo es rechazado.

**Homologación y producción no se mezclan.** Un certificado de homologación contra el endpoint de producción falla, y al revés también. Los endpoints se resuelven por `ARCA_ENV`, nunca hardcodeados en el llamado.

**En producción no existe la factura de prueba.** La primera emisión es un comprobante fiscal real que entra en la declaración del contribuyente. Avisá al usuario antes de correr cualquier emisión con `ARCA_ENV=produccion`.

**Un comprobante emitido no se borra.** Se corrige con nota de crédito. Nunca generes código que haga `DELETE` sobre la tabla de comprobantes.

**Exportación de servicios va por otro web service.** La Factura E se emite con WSFEX (`wsfexv1`), no con WSFEv1. Si el cliente factura al exterior, avisá que requiere un adaptador aparte y no intentes forzarlo en este flujo.

## Verificación antes de dar por terminada la implementación

Corré `lib/arca/verificar.ts` con `npx tsx`. Chequea en orden: variables presentes, certificado y clave son pareja, `FEDummy` responde OK, el ticket se obtiene y se cachea, el punto de venta existe y el último comprobante autorizado se lee correctamente. Si alguno falla, el mensaje indica cuál de los trámites de ARCA falta.
