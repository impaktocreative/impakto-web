"use client";

import { motion } from "framer-motion";
import Cubismo from "@/components/visual/Cubismo";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function IntroPanel() {
  return (
    <section className="relative overflow-hidden bg-foreground py-16 md:py-20 border-y border-white/8">
      {/* §6 Iluminación ambiental radial */}

      {/* Grid estructural — líneas finas que evocan sistema y precisión */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Hairline vertical de composición */}
      <div className="pointer-events-none absolute left-[38%] inset-y-0 w-px bg-white/[0.06] hidden lg:block" />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* Panel izquierdo — composición abstracta */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.9, ease: EASE_LUXURY }}
            className="lg:col-span-5 relative min-h-[24rem] md:min-h-[36rem] border border-white/10 overflow-hidden flex items-end p-8 md:p-12"
          >
            {/* Textura interna del panel */}
            <div className="absolute inset-0 bg-[linear-gradient(152deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.015)_28%,rgba(255,255,255,0.01)_52%,rgba(255,255,255,0.045)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_14%_86%,rgba(163,163,163,0.22)_0%,rgba(163,163,163,0.06)_44%,transparent_74%),radial-gradient(84%_74%_at_92%_10%,rgba(152,152,152,0.14)_0%,rgba(152,152,152,0.03)_42%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_24%,transparent_72%,rgba(255,255,255,0.04)_100%)]" />
            <div className="absolute -left-[18%] top-[8%] h-[42%] w-[120%] rotate-[12deg] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_100%)] opacity-45 blur-md" />
            <div className="absolute inset-0 opacity-[0.18] mix-blend-screen" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 280 280' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            {/* La pieza. Planos que se separan y se recomponen con el scroll,
                recorridos por una sola línea que se dibuja sin levantarse. El
                fondo oscuro es lo que hace que el oro tenga reflejo en vez de
                verse mostaza. */}
            <Cubismo tono="papel" />

            {/* Velo bajo el texto: en teléfono el panel es angosto y la firma
                quedaba montada sobre el trazo. Un degradé del propio negro,
                sin caja, para que la pieza siga viéndose entera arriba. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(10,10,9,0.82)_62%,rgba(10,10,9,0.92))]" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 p-px"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(232,214,165,0) 8%, rgba(232,214,165,0.85) 20%, rgba(232,214,165,0) 33%, rgba(194,173,122,0) 56%, rgba(232,214,165,0.72) 69%, rgba(232,214,165,0) 82%)",
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />

            {/* Índice del panel. Perfilado y no relleno: marca la posición sin
                taparle el trazo a la pieza ni pelearse con el titular. */}
            <div className="absolute top-6 right-7 pointer-events-none select-none">
              <span className="cifra-perfil font-heading tabular-nums leading-none block">01</span>
            </div>

            {/* Cita de composición en la base del panel */}
            <div className="relative z-10">
              <p className="text-eyebrow uppercase text-gold/70 mb-3">Impakto Creative</p>
              <p className="font-heading text-fog text-lead">
                Estrategia.<br />Estructura.<br />Presencia.
              </p>
            </div>
          </motion.div>

          {/* Panel derecho — manifiesto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXURY }}
            className="lg:col-span-7 p-9 md:p-14 lg:p-[4.5rem] border border-white/10 border-l-0"
          >
            <p className="text-eyebrow uppercase text-gold/85">Nuestra metodología</p>
            <h2
              className="text-display-lg mt-5 font-heading text-paper text-balance"
            >
              Así trabajamos una marca{" "}
              <span className="gold-reflect gold-reflect-light">de punta a punta.</span>
            </h2>
            <div className="mt-9 space-y-6 text-body md:text-body-lg text-ash max-w-[43rem]">
              <p>
                No trabajamos con acciones sueltas. Integramos estrategia, estructura
                y comunicación como un sistema para que cada decisión tenga continuidad.
              </p>
              <p>
                Ese enfoque permite mejorar la claridad comercial, reducir fricciones
                internas y sostener una presencia sólida en el tiempo.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
