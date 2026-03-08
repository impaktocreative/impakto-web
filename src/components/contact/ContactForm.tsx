"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");

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
      setFeedback("Gracias. Recibimos su mensaje y responderemos por correo con los próximos pasos.");
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            placeholder="Nombre y apellido"
            className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
          />
        </div>
        <div>
          <label htmlFor="empresa" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
            Empresa o marca
          </label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            required
            placeholder="Empresa u organización"
            className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="correo@empresa.com"
          className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
        />
      </div>

      <div>
        <label htmlFor="tipo-proyecto" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Tipo de necesidad
        </label>
        <select
          id="tipo-proyecto"
          name="tipoProyecto"
          required
          defaultValue=""
          className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
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
        <label htmlFor="situacion" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Situación actual
        </label>
        <textarea
          id="situacion"
          name="situacion"
          rows={4}
          required
          placeholder="¿Cuál es el principal desafío que hoy necesita resolver?"
          className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
        />
      </div>

      <div>
        <label htmlFor="objetivo" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Objetivo principal
        </label>
        <textarea
          id="objetivo"
          name="objetivo"
          rows={4}
          required
          placeholder="¿Qué resultado espera lograr en esta etapa?"
          className="w-full border border-foreground/14 bg-[#fbfcf8] px-4 py-3.5 text-[0.98rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55"
        />
      </div>

      <p id="contacto-ayuda" className="text-[0.9rem] leading-[1.6] text-foreground/62">
        Una consulta bien planteada permite iniciar una conversación más clara y útil.
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="btn-tide w-full text-center whitespace-normal disabled:pointer-events-none disabled:opacity-70 sm:w-auto sm:whitespace-nowrap"
      >
        {status === "submitting" ? "Enviando..." : "Enviar brief de contacto"}
      </Button>

      {status === "success" ? <p role="status" aria-live="polite" className="border border-foreground/12 bg-accent/20 px-4 py-3 text-[0.92rem] text-foreground/82">{feedback}</p> : null}
      {status === "error" ? <p role="alert" className="border border-red-300/70 bg-red-50 px-4 py-3 text-[0.92rem] text-red-700">{feedback}</p> : null}
    </form>
  );
}
