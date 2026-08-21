/**
 * Emisión desde el webhook de pago, en dos etapas.
 *
 * El webhook responde rápido y encola. El worker emite. Si emitieras dentro
 * del webhook, la pasarela lo daría por fallido durante una caída de ARCA y
 * reintentaría, generando duplicados.
 */

// ---------- Etapa 1: el webhook ----------
// app/api/webhooks/pago/route.ts

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const evento = await req.json();

  // 1. Validar la firma del webhook. Sin esto, cualquiera puede disparar
  //    emisiones falsas contra la numeración del contribuyente.
  // 2. Ignorar todo lo que no sea un pago aprobado.
  if (evento.type !== 'payment' || evento.data?.status !== 'approved') {
    return new Response(null, { status: 200 });
  }

  // 3. Marcar la orden como pagada y encolar la emisión.
  //    La referencia es el id de la orden, no el del intento de pago:
  //    un cobro reintentado no debe generar dos facturas.
  await cola.enviar('emitir-factura', { ordenId: evento.data.external_reference });

  // 4. Responder inmediato. Los webhooks llegan repetidos por diseño.
  return new Response(null, { status: 200 });
}

// ---------- Etapa 2: el worker ----------

import { Pool } from 'pg';
import { emitir } from '@/lib/arca/emitir';
import { credencialesDelEntorno } from '@/lib/arca/credenciales';
import { CBTE, DOC, COND_IVA, CONCEPTO } from '@/lib/arca/tipos';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function procesarEmision({ ordenId }: { ordenId: string }) {
  const orden = await cargarOrden(ordenId);

  // emitir() ya es idempotente por referencia: si la orden se facturó antes,
  // devuelve el CAE existente sin volver a llamar a ARCA.
  const resultado = await emitir({
    pool,
    cred: credencialesDelEntorno(),
    tenant: {
      id: orden.tenantId,
      cuit: orden.cuitEmisor,
      ptoVta: orden.ptoVta,
    },
    cbteTipo: CBTE.FACTURA_C,
    referencia: ordenId,
    datos: {
      concepto: CONCEPTO.PRODUCTOS,
      docTipo: orden.compradorDni ? DOC.DNI : DOC.CONSUMIDOR_FINAL,
      docNro: orden.compradorDni ?? 0,
      condIvaReceptor: COND_IVA.CONSUMIDOR_FINAL,
      impTotal: orden.total,
      impNeto: orden.total,
    },
  });

  if (resultado.resultado !== 'A') {
    // Rechazo: no reintentar a ciegas. El motivo está en las observaciones y
    // casi siempre requiere corregir datos, no repetir la llamada.
    await notificarAdministrador(ordenId, resultado.observaciones);
    return;
  }

  await guardarComprobanteEnOrden(ordenId, resultado);
  await enviarFacturaPorEmail(ordenId, resultado);
}

// Declaraciones de ejemplo, reemplazar por las del proyecto.
declare const cola: { enviar: (t: string, d: unknown) => Promise<void> };
declare function cargarOrden(id: string): Promise<any>;
declare function notificarAdministrador(id: string, obs: unknown): Promise<void>;
declare function guardarComprobanteEnOrden(id: string, r: unknown): Promise<void>;
declare function enviarFacturaPorEmail(id: string, r: unknown): Promise<void>;
