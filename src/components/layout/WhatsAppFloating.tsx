"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { MessageCircleMore, X } from "lucide-react";

const contacts = [
  {
    name: "Rodrigo",
    role: "Argentina",
    number: "+54 9 11 7842-1357",
    wa: "5491178421357",
    image: "/team/rodrigo.jpg",
  },
  {
    name: "Sergio",
    role: "Exterior",
    number: "+1 615 282 9799",
    wa: "16152829799",
    image: "/team/sergio.jpg",
  },
];

export default function WhatsAppFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const onClickOutside = (event: MouseEvent) => {
      if (!panelRef.current) {
        return;
      }
      if (!panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div ref={panelRef} className="fixed bottom-[calc(0.9rem+env(safe-area-inset-bottom))] right-[calc(0.9rem+env(safe-area-inset-right))] z-[65] md:bottom-6 md:right-6">
      {isOpen ? (
        <div className="mb-2 w-[17.6rem] rounded-2xl border border-foreground/12 bg-white/95 p-3 shadow-[0_22px_36px_-22px_rgba(50,50,47,0.45)] backdrop-blur-md sm:w-[19rem]">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-foreground/52">
              Contacto por WhatsApp
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/12 text-foreground/65"
              aria-label="Cerrar opciones de WhatsApp"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <a
                key={contact.name}
                href={`https://wa.me/${contact.wa}?text=${encodeURIComponent("Hola, quiero consultar por una reunión estratégica con Impakto Creative.")}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-foreground/10 bg-white/90 px-3 py-2.5 transition-all duration-300 hover:-translate-y-px hover:border-[#246f53] hover:bg-[linear-gradient(145deg,#369b74_0%,#2f8d68_48%,#246f53_100%)] hover:shadow-[0_14px_24px_-16px_rgba(27,92,67,0.75)]"
              >
                <Image
                  src={contact.image}
                  alt={`Foto de ${contact.name}`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-1 ring-foreground/10 transition-all duration-300 group-hover:ring-white/40"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground/90 transition-colors duration-300 group-hover:text-white">
                    {contact.name}
                  </span>
                  <span className="block text-[0.68rem] uppercase tracking-[0.14em] text-foreground/52 transition-colors duration-300 group-hover:text-white/85">
                    {contact.role}
                  </span>
                  <span className="block text-[0.8rem] text-foreground/75 transition-colors duration-300 group-hover:text-white/90">
                    {contact.number}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <button
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#2d8f69]/45 bg-[#2f8d68] text-white shadow-[0_18px_26px_-18px_rgba(26,76,57,0.6)] transition-transform duration-300 hover:scale-[1.04] md:-ml-5 md:h-[3.2rem] md:w-[3.2rem]"
          aria-label="Abrir contacto por WhatsApp"
          aria-expanded={isOpen}
        >
          <MessageCircleMore size={22} />
        </button>
      </div>
    </div>
  );
}
