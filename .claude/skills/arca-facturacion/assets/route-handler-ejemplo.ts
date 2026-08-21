/**
 * Ejemplo de route handler en Next.js App Router.
 * Ubicación sugerida: app/api/facturas/route.ts
 *
 * Nota: en producción la emisión no debe correr dentro del request. Este
 * ejemplo sirve para el panel de administración, donde el operador espera la
 * respuesta. Para el webhook de la tienda, ver assets/worker-ejemplo.ts.
 */

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { emitir } from '@/lib/arca/emitir';
import { credencialesDelEntorno } from '@/lib/arca/credenciales';
import { CBTE, DOC, COND_IVA, CONCEPTO } from '@/lib/arca/tipos';
import { urlQR, fechaParaQR } from '@/lib/arca/qr';

// Obligatorio: la firma CMS necesita el módulo crypto completo.
export const runtime = 'nodejs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function POST(req: Request) {
  // Autenticar y autorizar antes de esto. Un endpoint de facturación abierto
  // permite a cualquiera consumir la numeración del contribuyente.

  const body = await req.json();

  try {
    const resultado = await emitir({
      pool,
      cred: credencialesDelEntorno(),
      tenant: {
        id: body.tenantId,
        cuit: Number(process.env.ARCA_CUIT_EMISOR),
        ptoVta: Number(process.env.ARCA_PTO_VTA),
      },
      cbteTipo: CBTE.FACTURA_C,
      referencia: body.ordenId,
      datos: {
        concepto: CONCEPTO.PRODUCTOS,
        docTipo: body.docNro ? DOC.DNI : DOC.CONSUMIDOR_FINAL,
        docNro: body.docNro ?? 0,
        condIvaReceptor: COND_IVA.CONSUMIDOR_FINAL,
        impTotal: body.total,
        impNeto: body.total, // Factura C: neto igual a total
      },
    });

    if (resultado.resultado !== 'A') {
      return NextResponse.json(
        { error: 'Comprobante rechazado', detalle: resultado.observaciones },
        { status: 422 }
      );
    }

    return NextResponse.json({
      numero: resultado.numero,
      cae: resultado.cae,
      caeVto: resultado.caeVto,
      qr: urlQR({
        fecha: fechaParaQR(new Date().toISOString().slice(0, 10).replace(/-/g, '')),
        cuit: Number(process.env.ARCA_CUIT_EMISOR),
        ptoVta: Number(process.env.ARCA_PTO_VTA),
        tipoCmp: CBTE.FACTURA_C,
        nroCmp: resultado.numero,
        importe: body.total,
        codAut: resultado.cae!,
      }),
      observaciones: resultado.observaciones,
    });
  } catch (e) {
    console.error('[ARCA] Error al emitir', e);
    return NextResponse.json(
      { error: 'No se pudo emitir el comprobante' },
      { status: 502 }
    );
  }
}
