"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "success";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("success");
    event.currentTarget.reset();
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
            className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
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
            className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
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
          className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        />
      </div>

      <div>
        <label htmlFor="tipo-proyecto" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Tipo de proyecto
        </label>
        <select
          id="tipo-proyecto"
          name="tipoProyecto"
          required
          defaultValue=""
          className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          <option value="" disabled>
            Selecciona una opcion
          </option>
          <option value="estrategia">Estrategia y posicionamiento</option>
          <option value="web">Diseno y desarrollo web</option>
          <option value="comunicacion">Comunicacion y contenido comercial</option>
          <option value="sistemas">Sistemas digitales y automatizacion</option>
          <option value="otro">Necesito orientacion inicial</option>
        </select>
      </div>

      <div>
        <label htmlFor="situacion" className="mb-2 block text-[0.7rem] uppercase tracking-[0.16em] text-foreground/58">
          Situacion actual
        </label>
        <textarea
          id="situacion"
          name="situacion"
          rows={4}
          required
          className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
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
          className="w-full border border-foreground/14 bg-white px-4 py-3.5 text-[0.96rem] text-foreground/86 transition-colors duration-300 placeholder:text-foreground/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        />
      </div>

      <p id="contacto-ayuda" className="text-[0.9rem] leading-[1.6] text-foreground/62">
        Una consulta bien planteada permite iniciar una conversacion mas clara y util.
      </p>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Enviar consulta
      </Button>

      {status === "success" ? (
        <p role="status" aria-live="polite" className="border border-foreground/12 bg-accent/20 px-4 py-3 text-[0.9rem] text-foreground/82">
          Gracias. Recibimos su mensaje y responderemos por email.
        </p>
      ) : null}
    </form>
  );
}
