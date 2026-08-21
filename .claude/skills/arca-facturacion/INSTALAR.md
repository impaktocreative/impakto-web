# Instalación

## En un proyecto de Claude Code

Copiá la carpeta completa dentro del proyecto:

```bash
mkdir -p .claude/skills
cp -r arca-facturacion .claude/skills/
```

Claude Code lee el `SKILL.md` y activa el skill solo cuando detecta el tema. No hace falta invocarlo por nombre, aunque se puede.

## Para todos los proyectos a la vez

Si vas a repetir esta integración en varios clientes, instalalo a nivel usuario:

```bash
mkdir -p ~/.claude/skills
cp -r arca-facturacion ~/.claude/skills/
```

Queda disponible en cualquier proyecto sin copiarlo de nuevo. Actualizarlo en un solo lugar actualiza todos.

## Verificar que quedó activo

Dentro de Claude Code:

```
/skills
```

Tiene que aparecer `arca-facturacion` en la lista.

## Cómo usarlo

Basta con pedir lo que necesitás en lenguaje normal. Ejemplos que activan el skill:

- "Necesito que la tienda emita factura automáticamente cuando se aprueba el pago"
- "Implementá la integración con ARCA para este proyecto"
- "El cliente es monotributista, agregá facturación electrónica al checkout"
- "Me está dando error 10071 al emitir"

## Qué hace Claude Code con esto

1. Lee el `SKILL.md`, que trae la arquitectura, las restricciones del entorno y el orden de implementación.
2. Abre el archivo de `references/` que corresponda al problema puntual.
3. Copia los archivos de `lib/arca/` al proyecto y los adapta.
4. Corre `verificar.ts` antes de dar por terminada la integración.

Lo primero que va a preguntarte es si usás certificado propio con delegación (modelo A) o certificado por cliente (modelo B), porque eso define el resto del diseño.

## Dependencias que necesita el proyecto

```bash
npm install node-forge fast-xml-parser pg
npm install -D @types/node-forge @types/pg tsx
```

El código no depende de ningún framework más allá de `pg`, así que funciona igual en route handlers, server actions o un worker.

## Adaptarlo a cada cliente

El código está escrito para ser copiado sin modificar. Lo que cambia por cliente son las variables de entorno y, si el cliente es responsable inscripto en lugar de monotributista, el tipo de comprobante y el armado del IVA.

Si un cliente necesita algo que el skill no cubre, como exportación de servicios con WSFEX, conviene agregarlo como archivo nuevo en `references/` en lugar de modificar el código base, así el skill mejora para los proyectos siguientes.

## Estado de verificación

Las funciones puras están probadas: armado de XML para Factura C y B, validación de importes con detección de los desvíos que ARCA rechaza, notas de crédito con comprobante asociado, selección de tipo según condición fiscal, formato de fechas con offset real y armado del QR de la RG 4892. Todo el código pasa `tsc` en modo estricto.

Lo que no está probado contra ARCA real en este paquete es el flujo completo de emisión en producción, porque cada certificado y punto de venta es distinto. Para eso está `verificar.ts`.
