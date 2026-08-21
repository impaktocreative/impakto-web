# Riesgo y responsabilidad del desarrollador

Este documento no reemplaza el consejo de un contador ni de un abogado. Es un mapa de las decisiones técnicas que tienen consecuencias fuera del código.

## Lo que no ocurre

Operar con el certificado propio por cuenta de clientes **no** hace que la facturación de esos clientes se impute al desarrollador. El comprobante lo emite el CUIT del cliente, la operación entra en su declaración, el IVA y el impuesto a las ganancias son suyos. El campo `Auth.Cuit` de WSFEv1 determina de quién es el comprobante, y el certificado solo acredita quién operó técnicamente.

Tampoco se necesita autorización, registro ni homologación ante ARCA para desarrollar y vender software de facturación por web service. La homologación obligatoria aplica a controladores fiscales, que es otro régimen. Cualquiera puede escribir un sistema que emita comprobantes por cuenta de terceros.

## Lo que sí ocurre

### El certificado queda registrado como el operador

Cada autorización deja constancia del computador fiscal que la generó. Ante una inspección al cliente, el rastro técnico apunta al certificado del desarrollador. Eso no crea obligación fiscal, pero sí lo convierte en parte identificable de la operación.

### Concentración de riesgo en un solo secreto

Un certificado que representa a veinte clientes es la llave para emitir comprobantes a nombre de los veinte. Si se filtra, el daño es simultáneo en todos. La contención es cifrado en reposo, acceso restringido, rotación documentada y monitoreo de emisiones anómalas.

### Punto único de falla operativa

Si el certificado vence sin renovar, dejan de facturar todos los clientes al mismo tiempo. Es el incidente más previsible y el más caro en reputación. Agendar la renovación con dos meses de anticipación.

### Responsabilidad civil por defectos del software

El desarrollador no responde ante ARCA, pero sí ante el cliente. Un bug que genere huecos en la numeración, comprobantes duplicados o ventas sin facturar deriva en un problema fiscal del cliente, y el cliente puede reclamar. Los mitigantes son técnicos y contractuales: traza completa de cada emisión, panel que muestre los rechazos sin ocultarlos, y un contrato con límite de responsabilidad y una cláusula que deje clara la responsabilidad fiscal del contribuyente.

### Tratamiento de datos personales

Los comprobantes contienen datos identificatorios de los compradores. Eso encuadra en la ley de protección de datos personales argentina. Corresponde tener base legal para el tratamiento, medidas de seguridad razonables y un acuerdo de tratamiento con cada cliente.

### El ingreso por el desarrollo es ingreso propio

Lo que se cobra por construir y mantener el sistema es facturación propia y computa contra el régimen fiscal del desarrollador. Para un monotributista, contra el tope anual de su categoría. Un producto con suscripciones recurrentes empuja a recategorizar más rápido de lo previsto, así que conviene revisarlo con el contador antes de firmar los primeros clientes, no después.

## Cómo reducir la exposición

**Modelo B, certificado propio de cada cliente.** El cliente genera su par de claves y su certificado bajo su CUIT. La app los guarda cifrados por tenant. El CUIT del desarrollador no aparece en ningún registro de ARCA. Es más trabajo de onboarding y obliga a custodiar claves privadas ajenas, pero deja al desarrollador fuera de la cadena.

**Variante recomendada del modelo B.** El cliente genera la clave privada en su propia máquina y la sube por un canal seguro. Nunca por email ni chat. La app la cifra con una clave por tenant gestionada en un KMS, y no la registra en logs ni en trazas de error.

**Delegación revocable como garantía mutua.** En el modelo A, el cliente puede revocar la delegación en cualquier momento y de forma inmediata. Conviene explicárselo: reduce su percepción de riesgo y también la exposición del desarrollador, porque acota la relación a algo que el cliente controla.

**Separar certificados por cliente aunque sean del mismo CUIT.** Nada obliga a usar un solo certificado. Crear uno por cliente limita el radio de daño de una filtración y permite revocar de a uno.

## Checklist antes del primer cliente en producción

- Contrato firmado con cláusula de responsabilidad fiscal del contribuyente y límite de responsabilidad del proveedor
- Acuerdo de tratamiento de datos personales
- Certificado con fecha de renovación agendada
- Traza de request y respuesta persistida en cada emisión
- Panel que muestra comprobantes pendientes y rechazados
- Procedimiento escrito de qué hacer si ARCA está caído más de un día
- Consulta con el contador propio sobre el impacto del ingreso recurrente en el régimen fiscal
