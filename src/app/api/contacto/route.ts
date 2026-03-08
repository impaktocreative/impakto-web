import { NextResponse } from "next/server";

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
    return "El email ingresado no es valido.";
  }

  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "hola@impaktocreative.com";
  const senderName = process.env.BREVO_SENDER_NAME ?? "Impakto Creative";
  const recipientEmail = process.env.CONTACT_TO_EMAIL ?? "hola@impaktocreative.com";

  if (!apiKey) {
    return NextResponse.json(
      { message: "Falta configurar BREVO_API_KEY en el servidor." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as Partial<ContactPayload>;
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

  const message = {
    sender: { email: senderEmail, name: senderName },
    to: [{ email: recipientEmail, name: "Equipo Impakto" }],
    replyTo: { email: payload.email, name: payload.nombre },
    subject: `Nuevo brief de contacto - ${payload.empresa.replace(/[\r\n]/g, " ")}`,
    htmlContent: `
      <h2>Nuevo brief recibido</h2>
      <p><strong>Nombre:</strong> ${escapeHtml(payload.nombre)}</p>
      <p><strong>Empresa o marca:</strong> ${escapeHtml(payload.empresa)}</p>
      <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>Tipo de necesidad:</strong> ${escapeHtml(payload.tipoProyecto)}</p>
      <p><strong>Situacion actual:</strong><br/>${escapeHtml(payload.situacion).replace(/\n/g, "<br/>")}</p>
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

  return NextResponse.json(
    { message: "Gracias. Recibimos su mensaje y responderemos por correo con los proximos pasos." },
    { status: 200 }
  );
}
