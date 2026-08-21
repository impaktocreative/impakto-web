/**
 * Verificación de la integración, paso a paso.
 *
 * Correr con: npx tsx lib/arca/verificar.ts
 *
 * Cada paso descarta una capa. Si uno falla, el mensaje indica qué trámite de
 * ARCA falta o qué está mal configurado, en lugar de dejar un error genérico.
 */

import { Pool } from 'pg';
import forge from 'node-forge';
import { credencialesDelEntorno } from './credenciales';
import { getEntorno, getEndpoints } from './config';
import { getTA } from './ta-cache';
import { feDummy, puntosDeVenta, ultimoAutorizado } from './wsfe';
import { CBTE } from './tipos';

const ok = (m: string) => console.log(`  OK    ${m}`);
const fail = (m: string) => console.log(`  FALLA ${m}`);

/** Corta la verificación. El tipo `never` permite a TypeScript estrechar tipos. */
function abortar(mensaje: string, ayuda?: string): never {
  fail(mensaje);
  if (ayuda) console.log(`\n${ayuda}`);
  process.exit(1);
}

async function main() {
  console.log(`\nVerificación de la integración con ARCA`);
  console.log(`Entorno: ${getEntorno()}`);
  console.log(`WSAA:    ${getEndpoints().wsaa}`);
  console.log(`WSFE:    ${getEndpoints().wsfe}\n`);

  // 1. Variables de entorno
  const faltantes = ['ARCA_CUIT_EMISOR', 'ARCA_PTO_VTA', 'DATABASE_URL'].filter(
    (v) => !process.env[v]
  );
  if (faltantes.length) {
    fail(`Faltan variables: ${faltantes.join(', ')}`);
    process.exit(1);
  }
  ok('Variables de entorno presentes');

  const cuit = Number(process.env.ARCA_CUIT_EMISOR);
  const ptoVta = Number(process.env.ARCA_PTO_VTA);

  // 2. Credenciales
  let cred;
  try {
    cred = credencialesDelEntorno();
    ok('Certificado y clave decodificados');
  } catch (e) {
    abortar((e as Error).message);
  }

  // 3. El certificado y la clave son pareja
  try {
    const cert = forge.pki.certificateFromPem(cred.cert);
    const key = forge.pki.privateKeyFromPem(cred.key) as forge.pki.rsa.PrivateKey;
    const pubDelCert = cert.publicKey as forge.pki.rsa.PublicKey;

    if (pubDelCert.n.toString(16) !== key.n.toString(16)) {
      fail('El certificado y la clave privada no corresponden entre sí');
      process.exit(1);
    }

    const vence = cert.validity.notAfter;
    const dias = Math.floor((vence.getTime() - Date.now()) / 86_400_000);

    if (dias < 0) {
      fail(`El certificado venció el ${vence.toISOString().slice(0, 10)}`);
      process.exit(1);
    }
    ok(`Certificado válido, vence en ${dias} días (${vence.toISOString().slice(0, 10)})`);
    if (dias < 60) {
      console.log(`  AVISO Quedan menos de 60 días. Agendá la renovación.`);
    }
  } catch (e) {
    fail(`No se pudo leer el certificado: ${(e as Error).message}`);
    process.exit(1);
  }

  // 4. Conectividad con WSFEv1
  try {
    const d = await feDummy();
    if (d.AppServer !== 'OK' || d.DbServer !== 'OK' || d.AuthServer !== 'OK') {
      fail(`ARCA reporta degradación: ${JSON.stringify(d)}`);
      process.exit(1);
    }
    ok('FEDummy responde OK en los tres componentes');
  } catch (e) {
    fail(`Sin conectividad con WSFEv1: ${(e as Error).message}`);
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // 5. Ticket de acceso
    let ta;
    try {
      ta = await getTA(pool, cred, 'wsfe');
      ok(`Ticket obtenido, vence ${ta.expira}`);
    } catch (e) {
      fail(`${(e as Error).message}`);
      console.log(
        '\n  Causas frecuentes:\n' +
          '  - El certificado no está autorizado al servicio wsfe\n' +
          '  - Certificado de homologación contra endpoint de producción, o al revés\n' +
          '  - Ya hay un ticket vigente y el cache no lo tiene'
      );
      process.exit(1);
    }

    // 6. Punto de venta
    try {
      const pvs = await puntosDeVenta(ta, cuit);
      const nros = pvs.map((p: any) => Number(p.Nro));

      if (!nros.includes(ptoVta)) {
        fail(
          `El punto de venta ${ptoVta} no figura entre los habilitados: ${
            nros.length ? nros.join(', ') : 'ninguno'
          }`
        );
        console.log(
          '\n  Dar de alta un punto de venta de tipo Web Service en\n' +
            '  "Administrador de Puntos de Venta y Domicilios".'
        );
        process.exit(1);
      }

      const info = pvs.find((p: any) => Number(p.Nro) === ptoVta) as any;
      ok(`Punto de venta ${ptoVta} habilitado (${info.EmisionTipo})`);
    } catch (e) {
      fail(`No se pudieron leer los puntos de venta: ${(e as Error).message}`);
      process.exit(1);
    }

    // 7. Delegación activa
    try {
      const ultimo = await ultimoAutorizado(ta, cuit, ptoVta, CBTE.FACTURA_C);
      ok(`Último comprobante autorizado tipo C: ${ultimo}`);
    } catch (e) {
      fail(`${(e as Error).message}`);
      console.log(
        '\n  Si el error menciona CUIT representada, falta la delegación del\n' +
          '  servicio de Facturación Electrónica desde el Administrador de Relaciones.'
      );
      process.exit(1);
    }

    console.log('\nTodo verificado. La integración está lista para emitir.\n');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('\nError no controlado:', e);
  process.exit(1);
});
