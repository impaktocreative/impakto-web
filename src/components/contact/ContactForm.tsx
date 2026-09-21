"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Token de tiempo del filtro anti-bots.
 *
 * Se pide al montar, no se hornea en el HTML: la página es estática y el
 * servidor tiene que saber cuándo se abrió el formulario de verdad. Si el
 * pedido falla se reintenta al enviar, así una conexión floja no deja a una
 * persona sin poder escribir.
 */
async function pedirToken(): Promise<string | null> {
  try {
    const r = await fetch("/api/contacto/token", { cache: "no-store" });
    if (!r.ok) return null;
    const d = (await r.json()) as { token?: string };
    return d.token ?? null;
  } catch {
    return null;
  }
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    void pedirToken().then((t) => {
      if (!cancelado) tokenRef.current = t;
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      nombre: String(formData.get("nombre") ?? "").trim(),
      empresa: String(formData.get("empresa") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      tipoProyecto: String(formData.get("tipoProyecto") ?? "").trim(),
      situacion: String(formData.get("situacion") ?? "").trim(),
      objetivo: String(formData.get("objetivo") ?? "").trim(),
      // El campo trampa viaja tal cual: vacío en una persona, lleno en un bot.
      website: String(formData.get("website") ?? ""),
      token: tokenRef.current ?? (await pedirToken()),
    };

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "No se pudo enviar el mensaje.");
      }

      setStatus("success");
      setFeedback("Gracias. Recibimos tu mensaje. Te respondemos por correo con los próximos pasos.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      aria-describedby="contacto-ayuda"
    >
      {/* Trampa para bots. Una persona no lo ve ni lo alcanza con Tab; un bot
          que llena todo lo que encuentra lo llena, y con eso alcanza. No va
          con display:none porque algunos bots lo detectan y lo saltean. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Sitio web</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="sr-only"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-eyebrow uppercase text-stone">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Nombre y apellido"
            className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 placeholder:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
          />
        </div>
        <div>
          <label htmlFor="empresa" className="mb-2 block text-eyebrow uppercase text-stone">
            Empresa o marca
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            required
            placeholder="Empresa u organización"
            className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 placeholder:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-eyebrow uppercase text-stone">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="correo@empresa.com"
          className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 placeholder:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
        />
      </div>

      <div>
        <label htmlFor="tipo-proyecto" className="mb-2 block text-eyebrow uppercase text-stone">
          Tipo de necesidad
        </label>
        <select
          id="tipo-proyecto"
          name="tipoProyecto"
          required
          defaultValue=""
          className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
        >
          <option value="" disabled>
            Seleccione una opción
          </option>
          <option value="estrategia">Estrategia y posicionamiento</option>
          <option value="web">Diseño y desarrollo web</option>
          <option value="comunicacion">Comunicación y contenido comercial</option>
          <option value="sistemas">Sistemas digitales y automatización</option>
          <option value="otro">Necesito orientación inicial</option>
        </select>
      </div>

      <div>
        <label htmlFor="situacion" className="mb-2 block text-eyebrow uppercase text-stone">
          Situación actual
        </label>
        <textarea
          id="situacion"
          name="situacion"
          rows={4}
          required
          placeholder="¿Cuál es el principal desafío que hoy necesita resolver?"
          className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 placeholder:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
        />
      </div>

      <div>
        <label htmlFor="objetivo" className="mb-2 block text-eyebrow uppercase text-stone">
          Objetivo principal
        </label>
        <textarea
          id="objetivo"
          name="objetivo"
          rows={4}
          required
          placeholder="¿Qué resultado espera lograr en esta etapa?"
          className="w-full border border-graphite/12 bg-surface px-4 py-3.5 text-body text-slate transition-colors duration-300 placeholder:text-stone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/55"
        />
      </div>

      <p id="contacto-ayuda" className="text-body-sm text-stone">
        Una consulta bien planteada permite iniciar una conversación más clara y útil.
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full text-center whitespace-normal disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:whitespace-nowrap"
      >
        {status === "submitting" ? "Enviando..." : "Enviar brief de contacto"}
      </Button>

      {status === "success" ? <p role="status" aria-live="polite" className="border border-graphite/12 bg-accent/20 px-4 py-3 text-body-sm text-slate">{feedback}</p> : null}
      {status === "error" ? <p role="alert" className="border border-red-300/70 bg-red-50 px-4 py-3 text-body-sm text-red-700">{feedback}</p> : null}
    </form>
  );
}
