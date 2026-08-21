# Integración con una tienda online

Emitir el comprobante es la parte fácil. Lo difícil es decidir cuándo emitirlo, qué hacer si ARCA no responde y cómo evitar facturar dos veces la misma venta.

## Cuándo emitir

La factura se emite cuando el pago está confirmado, no cuando la orden se crea. Una orden abandonada o un pago rechazado que ya generó comprobante obliga a emitir una nota de crédito para revertirlo, y eso ensucia los libros del cliente.

El disparador correcto es el webhook de la pasarela de pago con estado aprobado. En Mercado Pago es el evento de pago con `status` aprobado, no el de la preferencia creada.

## La emisión nunca va dentro del request del webhook

ARCA responde lento y se cae con frecuencia. Si la emisión bloquea el webhook, la pasarela lo da por fallido y reintenta, generando duplicados.

El flujo correcto:

1. El webhook valida la firma, marca la orden como pagada y encola la emisión. Responde 200 en milisegundos.
2. Un worker toma el trabajo y emite el comprobante.
3. Si falla, reintenta con backoff. El comprobante ya está en la base como `pendiente`, así que no se pierde.

Para Next.js en Vercel, la cola puede ser Inngest, QStash o Trigger.dev. Con un servidor propio, cualquier cola sobre Redis. Lo que no funciona es emitir de forma sincrónica dentro del handler.

## Idempotencia

Cada comprobante se guarda con una `referencia`, que es el identificador de la orden. El índice único parcial de la migración hace que un segundo intento sobre la misma orden falle a nivel base antes de llegar a ARCA.

En el worker, la lógica es: buscar si existe un comprobante autorizado o pendiente para esa referencia; si existe y está autorizado, terminar sin hacer nada; si existe y está pendiente, reconciliar contra ARCA en lugar de emitir de nuevo.

Los webhooks de pago llegan repetidos por diseño. Asumí siempre que van a llegar al menos dos veces.

## Qué datos pedirle al comprador

Depende del tipo de comprobante. Para una tienda que vende a consumidor final:

- Por debajo del umbral de identificación obligatoria, alcanza con documento tipo 99 y número 0, y condición frente al IVA 5.
- Por encima del umbral, hay que pedir DNI o CUIT.
- Si el comprador quiere factura A, hay que pedir CUIT y validar que sea responsable inscripto.

Validar el CUIT contra el padrón antes de emitir evita rechazos. El servicio de consulta al padrón es otro web service de ARCA (`ws_sr_constancia_inscripcion`), que requiere su propia autorización de certificado. Vale la pena si la tienda vende a empresas; para venta a consumidor final es innecesario.

Un checkout que pregunta la condición fiscal debe ofrecer opciones legibles, no códigos: "Consumidor final", "Responsable inscripto", "Monotributista", y mapear internamente a 5, 1 y 6.

## Notas de crédito

Una devolución o cancelación se resuelve con nota de crédito, nunca borrando la factura.

La nota de crédito lleva el mismo tipo de letra que la factura original: si emitiste Factura C código 11, la nota de crédito es código 13. Tiene su propia numeración correlativa en el mismo punto de venta, y en `CbtesAsoc` lleva el punto de venta, tipo y número del comprobante original.

Una devolución parcial genera una nota de crédito por el importe devuelto, no por el total.

## Cuándo ARCA está caído

Pasa seguido. El flujo tiene que degradar sin romper la venta:

- La venta se completa igual. El cliente recibe su confirmación de compra.
- El comprobante queda `pendiente` y el worker reintenta.
- Si tras varios reintentos sigue fallando, se alerta al administrador de la tienda.

Nunca bloquees el checkout esperando a ARCA. La obligación fiscal de emitir tiene un plazo, no es instantánea.

`FEDummy` sirve como health check previo: si devuelve algo distinto de OK en los tres componentes, ni intentes emitir.

## El QR es obligatorio

La RG 4892 exige código QR en los comprobantes electrónicos. Si la tienda genera un PDF de la factura, el QR va incluido. `lib/arca/qr.ts` arma la URL, que después se convierte en imagen con cualquier librería de QR.

El PDF además necesita los datos del emisor, el CAE, su vencimiento y el detalle. El formato tiene requisitos de contenido, no de diseño.

## Suscripciones y facturación recurrente

Si el cliente vende suscripciones, la emisión se dispara por cada ciclo de cobro exitoso, con concepto 2 (servicios) y las fechas de servicio cubriendo el período facturado.

El riesgo es el cobro reintentado: una suscripción que falla y se reintenta tres veces no debe generar tres facturas. La referencia de idempotencia tiene que ser el identificador del ciclo, no el del intento de cobro.

## Lo que hay que dejarle claro al cliente final

El dueño de la tienda es el responsable fiscal de los comprobantes. La app es el medio técnico. Conviene que el contrato lo diga y que el panel de administración muestre siempre el estado real: cuántos comprobantes se emitieron, cuáles quedaron pendientes y cuáles fueron rechazados.

Un panel que oculta los rechazos genera un problema fiscal silencioso que aparece meses después.
