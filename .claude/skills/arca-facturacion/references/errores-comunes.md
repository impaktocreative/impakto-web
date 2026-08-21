# Errores comunes

Los mensajes de ARCA son escuetos. Esta tabla mapea el mensaje real a la causa.

## Errores de WSAA

### `xml.generationTime.invalid`

> generationTime posee formato o dato inválido (ej: en el futuro o más de 24 horas de antigüedad)

Casi siempre es el offset horario mal armado. El patrón que falla:

```ts
// INCORRECTO: toma la hora UTC y le pega un offset fijo
d.toISOString().replace(/\.\d{3}Z$/, '-03:00')
```

Eso declara una hora tres horas adelantada respecto de la real. Hay que construir la fecha con la hora local y el offset real de la máquina, como hace el helper de `lib/arca/wsaa.ts`.

También aparece si el reloj del servidor está desincronizado. Verificar con NTP.

### `coe.alreadyAuthenticated`

> El CEE ya posee un TA válido para el acceso al WSN solicitado

Se pidió un ticket teniendo uno vigente. El límite es por combinación de certificado y servicio, y el ticket dura 12 horas.

En desarrollo es molesto pero inofensivo. En producción significa que el cache no está funcionando: probablemente esté en memoria o en filesystem, y cada instancia serverless pide el suyo. Tiene que estar en Postgres con advisory lock.

Para desbloquear durante el desarrollo sin esperar 12 horas, se crea un segundo certificado con otro alias en WSASS. Cada certificado tiene su propio ticket.

### `cms.cert.untrusted` o "Certificado no emitido por AC de confianza"

El certificado no corresponde al entorno. Un certificado de homologación contra el endpoint de producción da este error, y al revés también.

También aparece si el archivo cargado no es un certificado. Verificar:

```bash
head -1 cert.crt   # debe decir BEGIN CERTIFICATE, no BEGIN CERTIFICATE REQUEST
```

### `Invalid PEM formatted message`

El contenido del `.crt` o de la `.key` está corrupto. Causas frecuentes: se guardó el CSR en lugar del certificado, se pegó en un editor que agregó comillas tipográficas, o el base64 de la variable de entorno tiene saltos de línea.

Al generar el base64, quitar los saltos:

```bash
base64 -i cert.crt | tr -d '\n'
```

### `ns1:cms.sign.InvalidCertificate`

El certificado y la clave privada no son pareja. Verificar:

```bash
diff <(openssl x509 -noout -modulus -in cert.crt) <(openssl rsa -noout -modulus -in private.key)
```

## Errores de WSFEv1

### CUIT representada no autorizada

Falta la delegación del servicio, o el cliente la revocó, o todavía no fue aceptada. En producción la aprobación puede demorar hasta 24 horas.

### `10015` Punto de venta no autorizado o inexistente

El punto de venta no está dado de alta, o es del tipo equivocado. El del portal de Comprobantes en Línea no sirve para web service.

Verificar el número real con `FEParamGetPtosVenta`. ARCA no necesariamente asigna el 1.

### `10016` Número de comprobante no correlativo

Se intentó emitir un número que no es el siguiente al último autorizado. Suele indicar que el contador local se desincronizó de ARCA.

Resincronizar leyendo `FECompUltimoAutorizado` y actualizando el contador. Investigar por qué se desincronizó antes de seguir emitiendo.

### `10018` El comprobante ya fue autorizado

Se reutilizó un número que ARCA ya tiene registrado. Ocurre cuando una emisión anterior otorgó CAE pero la respuesta se perdió y el rollback liberó el número.

Recuperación: llamar a `FECompConsultar` con ese punto de venta, tipo y número, tomar el CAE existente y guardarlo. Implementado en `lib/arca/reconciliar.ts`.

### `10070` / `10071` Errores del array de IVA

Se envió el nodo `Iva` en una Factura C, o la suma de las alícuotas no coincide con `ImpIVA`.

Para comprobantes C el nodo se omite por completo. Para A y B, la suma tiene que coincidir al centavo: calcular el IVA sobre el neto y derivar el total, no al revés.

### `10064` Importe total no coincide

`ImpTotal` no es igual a la suma de `ImpNeto`, `ImpIVA`, `ImpTrib`, `ImpOpEx` e `ImpTotConc`. Casi siempre es redondeo. Trabajar con enteros de centavos y convertir a decimal solo al armar el XML.

### `10192` Falta la condición frente al IVA del receptor

Falta `CondicionIVAReceptorId`, obligatorio desde la RG 5616. También aparece si el valor enviado no es compatible con el tipo de comprobante.

### Observaciones con `Resultado: "A"`

Un comprobante puede quedar aprobado y traer observaciones. Están en el nodo `Observaciones` de la respuesta. No invalidan el CAE, pero conviene guardarlas y mostrarlas en el panel: suelen avisar de datos del receptor inconsistentes con el padrón, y acumuladas terminan en una inspección.

## Errores de red

### Timeouts

ARCA se cae seguido. Configurar timeout explícito en el cliente HTTP, entre 30 y 60 segundos. Sin timeout, la request queda colgada y agota el pool de conexiones.

### Errores de TLS con OpenSSL 3

Algunas versiones rechazan cifradores que usan los servidores de ARCA. Si aparece un error de handshake, hay que configurar el agente HTTPS para aceptar la renegociación legacy.

## Diagnóstico ordenado

Cuando algo falla, verificar en este orden. Cada paso descarta una capa:

1. `openssl x509 -in cert.crt -noout -subject -enddate` — el certificado es válido y no venció
2. `diff` de los módulos — certificado y clave son pareja
3. `FEDummy` — hay conectividad con WSFEv1
4. Obtener el ticket — el certificado está autorizado al servicio
5. `FEParamGetPtosVenta` — el punto de venta existe
6. `FECompUltimoAutorizado` — la delegación está activa
7. `FECAESolicitar` — el payload está bien armado

El script `lib/arca/verificar.ts` corre los siete pasos en orden y dice cuál falló.
