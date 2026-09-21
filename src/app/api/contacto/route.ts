import { NextResponse } from "next/server";
import { remitente, paraElEquipo } from "@/lib/correos"
import { CAMPO_TRAMPA, evaluarEnvio } from "@/lib/contacto/antispam"

type ContactPayload = {
  nombre: string;
  empresa: string;
  email: string;
  tipoProyecto: string;
  situacion: string;
  objetivo: string;
};

const REQUIRED_FIELDS: Array<keyof ContactPayload> = [
  "nombre",
  "empresa",
  "email",
  "tipoProyecto",
  "situacion",
  "objetivo",
];

const RESPUESTA_OK =
  "Gracias. Recibimos su mensaje y responderemos por correo con los próximos pasos.";

function sanitize(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function validatePayload(payload: ContactPayload) {
  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      return `El campo '${field}' es obligatorio.`;
    }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!emailOk) {
    return "El email ingresado no es válido.";
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  const { to: destinatarios, cc: enCopia } = paraElEquipo();

  if (!apiKey) {
    return NextResponse.json(
      { message: "Falta configurar BREVO_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  let body: Partial<ContactPayload> & { token?: unknown; [CAMPO_TRAMPA]?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { message: "No se pudo interpretar el formulario enviado." },
      { status: 400 }
    );
  }

  const payload: ContactPayload = {
    nombre: sanitize(body.nombre),
    empresa: sanitize(body.empresa),
    email: sanitize(body.email),
    tipoProyecto: sanitize(body.tipoProyecto),
    situacion: sanitize(body.situacion),
    objetivo: sanitize(body.objetivo),
  };

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ message: validationError }, { status: 400 });
  }

  const veredicto = await evaluarEnvio({
    token: body.token,
    trampa: body[CAMPO_TRAMPA],
    textos: [payload.nombre, payload.empresa, payload.situacion, payload.objetivo],
  });

  if (veredicto.spam) {
    // Queda en los logs de Vercel para poder ver qué se está tirando y ajustar
    // el filtro si algún día tira algo real.
    console.warn(
      `[contacto] descartado: ${veredicto.motivo} · ${payload.email} · "${payload.nombre.slice(0, 40)}"`,
    );
    // Misma respuesta que un envío real. Un bot que recibe un error aprende;
    // uno que cree que pasó sigue mandando lo mismo.
    return NextResponse.json({ message: RESPUESTA_OK }, { status: 200 });
  }

  const message = {
    sender: remitente(),
    to: destinatarios,
    ...(enCopia.length > 0 ? { cc: enCopia } : {}),
    replyTo: { email: payload.email, name: payload.nombre },
    subject: `Nuevo brief de contacto - ${payload.empresa.replace(/[\r\n]/g, " ")}`,
    htmlContent: `
      <h2>Nuevo brief recibido</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(payload.nombre)}</p>
      <p><strong>Empresa o marca:</strong> ${escapeHtml(payload.empresa)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Tipo de necesidad:</strong> ${escapeHtml(payload.tipoProyecto)}</p>
      <p><strong>Situación actual:</strong><br/>${escapeHtml(payload.situacion).replace(/\n/g, "<br/>")}</p>
      <p><strong>Objetivo principal:</strong><br/>${escapeHtml(payload.objetivo).replace(/\n/g, "<br/>")}</p>
    `,
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(message),
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "No se pudo enviar el mensaje en este momento.";
    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        detail = errorBody.message;
      }
    } catch {
      // Ignore parse errors from provider
    }

    return NextResponse.json({ message: detail }, { status: 502 });
  }

  return NextResponse.json({ message: RESPUESTA_OK }, { status: 200 });
}
