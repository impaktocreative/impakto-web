# Trámites en ARCA

Sin estos pasos el código no puede conectarse. Se hacen una vez por entorno y una vez por cada cliente que va a facturar.

## Parte 1: homologación, solo el desarrollador

El entorno de testing se autogestiona con WSASS y no requiere trámites presenciales.

### 1.1 Adherir WSASS

Portal de ARCA con clave fiscal de persona física, nivel 2 o superior. Administrador de Relaciones de Clave Fiscal, Adherir Servicio, logo de ARCA, Servicios Interactivos, buscar "WSASS - Autogestión Certificados Homologación". Cerrar sesión y volver a entrar para que aparezca en el listado.

### 1.2 Generar el par de claves

```bash
openssl genrsa -out homo.key 2048
openssl req -new -key homo.key \
  -subj "/C=AR/O=RAZON SOCIAL EXACTA/CN=alias-del-computador/serialNumber=CUIT 20123456789" \
  -out homo.csr
```

El `serialNumber` lleva el prefijo `CUIT`, un espacio y los once dígitos sin guiones. Verificar con `openssl req -in homo.csr -noout -subject` antes de subirlo.

La clave privada nunca sale de donde se generó y no se versiona.

### 1.3 Crear el certificado

WSASS, menú "Nuevo Certificado". Alias del DN, y el CSR pegado completo con las líneas BEGIN y END. Devuelve un certificado PEM que se guarda como `.crt`.

Confirmar que certificado y clave son pareja:

```bash
diff <(openssl x509 -noout -modulus -in homo.crt) <(openssl rsa -noout -modulus -in homo.key)
```

Sin salida significa que están bien.

### 1.4 Autorizar el certificado al servicio

WSASS, menú "Crear Autorización a Servicio". Alias del DN, CUIT representado y servicio `wsfe - Facturacion Electronica`.

Este formulario se repite una vez por cada CUIT que se quiera representar. En homologación permite autorizar CUITs arbitrarios, lo cual sirve para probar el comportamiento multi tenant antes de tener clientes reales.

### 1.5 Punto de venta en homologación

Se consulta con `FEParamGetPtosVenta`. El número asignado por ARCA no necesariamente es el 1, así que hay que leerlo en lugar de asumirlo. El campo `EmisionTipo` indica la condición fiscal reconocida, por ejemplo "CAE - Monotributo".

## Parte 2: producción, el desarrollador

Requiere clave fiscal nivel 3.

### 2.1 Adherir "Administración de Certificados Digitales"

Administrador de Relaciones, Adherir Servicio, ARCA, Servicios Interactivos.

### 2.2 Generar un par de claves nuevo

Distinto al de homologación. Mismo comando de openssl, otro archivo.

### 2.3 Crear el certificado

En "Administración de Certificados Digitales", opción "Agregar alias", pegar el CSR y descargar el `.crt`.

### 2.4 Asociar el certificado al web service

Administrador de Relaciones, Nueva Relación, Buscar, logo de ARCA, WebServices, "Facturación Electrónica". En Representante, seleccionar el Computador Fiscal, que es el alias creado en el paso anterior.

Sin este paso el certificado existe pero WSAA no emite ticket para el servicio `wsfe`.

### 2.5 Anotar la fecha de vencimiento

```bash
openssl x509 -in prod.crt -noout -enddate
```

Si el certificado vence, dejan de facturar todos los clientes al mismo tiempo. Agendar la renovación con dos meses de anticipación.

## Parte 3: cada cliente, modelo A

Instructivo para mandarle al cliente. Conviene armarlo como PDF con capturas, porque es donde se traban.

1. Entrar a arca.gob.ar con CUIT y clave fiscal. Se necesita nivel 3.
2. Abrir "Administrador de Relaciones de Clave Fiscal".
3. Botón "Nueva Relación", después "Buscar".
4. Clic en el logo de ARCA, después "WebServices", después "Facturación Electrónica".
5. En el campo Representante, "Buscar", e ingresar el CUIT del desarrollador.
6. En "Computador Fiscal", seleccionar el alias del certificado.
7. Confirmar.
8. Abrir "Administrador de Puntos de Venta y Domicilios" y dar de alta un punto de venta nuevo de tipo Web Service.
9. Informar al desarrollador: CUIT, número de punto de venta y condición fiscal.

La aprobación de la delegación puede demorar hasta 24 horas. El punto de venta del portal de Comprobantes en Línea no sirve, tiene que ser uno de tipo web service, y su numeración corre por separado.

El cliente puede revocar la delegación en cualquier momento desde la misma pantalla, y la revocación es inmediata.

## Parte 4: cada cliente, modelo B

El cliente hace los pasos 2.1 a 2.4 con su propio CUIT, y entrega el `.crt` y la `.key` a la aplicación. La app los almacena cifrados por tenant.

Si el cliente no tiene perfil técnico, el desarrollador puede acompañar el trámite en videollamada, pero la clave privada se genera en la máquina del cliente y se sube por un canal seguro, nunca por email ni chat.

## Verificación desde código

No existe un endpoint que informe si la delegación está hecha. Se comprueba llamando a `FECompUltimoAutorizado` con el CUIT del cliente:

- Responde con un número: delegación y punto de venta correctos.
- Error de CUIT representada no autorizada: falta la delegación o no fue aceptada.
- Error de punto de venta inexistente: falta el alta del punto de venta.

Correr este chequeo en el alta del tenant y también de forma periódica, porque las delegaciones se revocan o caducan por desuso.

## Contacto

ARCA atiende consultas sobre WSAA y WSASS en webservices-desa@arca.gob.ar. Solo sobre esos dos servicios.
