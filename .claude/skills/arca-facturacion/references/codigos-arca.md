# Tablas de códigos

Referencia de lectura. La fuente de verdad son los métodos `FEParamGet*` de WSFEv1, que hay que consultar en runtime y cachear, porque ARCA modifica estas tablas por resolución general.

## Tipos de comprobante según condición del emisor

| Emisor | Factura | Nota de débito | Nota de crédito | Recibo |
|---|---|---|---|---|
| Responsable inscripto a RI | A: 1 | 2 | 3 | 4 |
| Responsable inscripto a consumidor final o monotributo | B: 6 | 7 | 8 | 9 |
| Monotributista o exento | C: 11 | 12 | 13 | 15 |
| Exportación | E: 19 | 20 | 21 | |
| Responsable inscripto, régimen M | M: 51 | 52 | 53 | 54 |

La Factura E no se emite con WSFEv1. Va por WSFEX (`wsfexv1`), con otro esquema de campos, otra numeración y otra asociación de certificado.

Traer la lista vigente con `FEParamGetTiposCbte`.

## Tipos de documento del receptor

| Código | Documento |
|---|---|
| 80 | CUIT |
| 86 | CUIL |
| 96 | DNI |
| 99 | Consumidor final sin identificar |

Con código 99 el número de documento va en cero. Se usa para ventas a consumidor final por debajo del monto que obliga a identificar al comprador, umbral que ARCA actualiza periódicamente y conviene verificar antes de definir la lógica de la tienda.

Traer la lista vigente con `FEParamGetTiposDoc`.

## Condición frente al IVA del receptor

Campo `CondicionIVAReceptorId`, obligatorio desde la RG 5616. Un comprobante sin este campo es rechazado.

| Código | Condición |
|---|---|
| 1 | IVA responsable inscripto |
| 4 | IVA sujeto exento |
| 5 | Consumidor final |
| 6 | Responsable monotributo |
| 7 | Sujeto no categorizado |
| 8 | Proveedor del exterior |
| 9 | Cliente del exterior |
| 10 | IVA liberado, ley 19.640 |
| 13 | Monotributista social |
| 15 | IVA no alcanzado |

Traer la lista vigente con `FEParamGetCondicionIvaReceptor`. Los valores permitidos dependen del tipo de comprobante: una Factura A no admite consumidor final como receptor.

## Conceptos

| Código | Concepto |
|---|---|
| 1 | Productos |
| 2 | Servicios |
| 3 | Productos y servicios |

Con concepto 2 o 3 son obligatorios `FchServDesde`, `FchServHasta` y `FchVtoPago`, en formato `yyyymmdd`.

Para una tienda online de productos físicos el concepto es 1 y esos tres campos se omiten.

## Alícuotas de IVA

| Código | Alícuota |
|---|---|
| 3 | 0% |
| 4 | 10,5% |
| 5 | 21% |
| 6 | 27% |
| 8 | 5% |
| 9 | 2,5% |

Traer la lista vigente con `FEParamGetTiposIva`.

## Reglas de armado de importes

**Factura C, emisor monotributista o exento.** El nodo `Iva` se omite por completo. Incluirlo aunque sea vacío hace que ARCA rechace el comprobante.

```
ImpTotal   = importe total
ImpNeto    = ImpTotal
ImpTotConc = 0
ImpOpEx    = 0
ImpIVA     = 0
ImpTrib    = 0
```

**Factura A o B, emisor responsable inscripto.** El nodo `Iva` es obligatorio y la suma de sus importes tiene que coincidir exactamente con `ImpIVA`.

```
ImpTotal   = ImpNeto + ImpIVA + ImpTrib + ImpOpEx + ImpTotConc
ImpNeto    = base imponible gravada
ImpIVA     = suma de los importes del array Iva
```

El error más frecuente en producción es un desvío de un centavo por redondeo. Calculá el IVA sobre el neto y derivá el total de la suma, en lugar de calcular el neto desde el total. Trabajá con enteros de centavos internamente y convertí a decimal solo al armar el XML.

## Monedas

`MonId` es `PES` para pesos. Para otras monedas, `MonCotiz` lleva la cotización del día, que se consulta con `FEParamGetCotizacion`. Facturar en moneda extranjera desde una tienda argentina tiene implicancias fiscales que exceden la integración técnica.

## Formato de fechas

Todas las fechas de comprobante van como `yyyymmdd` sin separadores. Las fechas del TRA de WSAA van en ISO 8601 con offset, y ese offset tiene que ser el real de la máquina, no un `-03:00` hardcodeado.

## Límites de fecha de emisión

Para concepto 1, productos, la fecha del comprobante admite un margen de días hacia atrás y hacia adelante respecto de la fecha de proceso. Para conceptos 2 y 3 el margen es mayor. Emitir fuera de ventana genera una observación, no un rechazo, pero conviene evitarlo: usar siempre la fecha del día salvo que haya una razón concreta.
