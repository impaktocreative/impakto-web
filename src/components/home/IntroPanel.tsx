"use client";

import { motion } from "framer-motion";

const EASE_LUXURY: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function IntroPanel() {
  return (
    <section className="relative overflow-hidden bg-foreground py-28 md:py-36 border-y border-white/8">
      {/* §6 Iluminación ambiental radial */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgba(175,163,133,0.09),transparent_52%),radial-gradient(circle_at_90%_82%,rgba(154,164,144,0.07),transparent_48%)]" />

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

      {/* Elemento tipográfico decorativo monumental */}
      <div className="pointer-events-none absolute -right-12 top-1/2 -translate-y-1/2 select-none overflow-hidden">
        <span
          className="font-heading text-background block leading-none"
          style={{
            fontSize: "clamp(18rem, 32vw, 38rem)",
            opacity: 0.028,
            letterSpacing: "-0.06em",
            transform: "rotate(-6deg)",
            lineHeight: 0.82,
          }}
        >
          I.
        </span>
      </div>

      {/* Hairline vertical de composición */}
      <div className="pointer-events-none absolute left-[38%] inset-y-0 w-px bg-white/[0.06] hidden lg:block" />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* Panel izquierdo — composición abstracta */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: EASE_LUXURY }}
            className="lg:col-span-5 relative min-h-[24rem] md:min-h-[36rem] border border-white/10 overflow-hidden flex items-end p-8 md:p-12"
          >
            {/* Textura interna del panel */}
            <div className="absolute inset-0 bg-[linear-gradient(152deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.015)_28%,rgba(255,255,255,0.01)_52%,rgba(255,255,255,0.045)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(110%_90%_at_14%_86%,rgba(175,163,133,0.22)_0%,rgba(175,163,133,0.06)_44%,transparent_74%),radial-gradient(84%_74%_at_92%_10%,rgba(142,155,147,0.14)_0%,rgba(142,155,147,0.03)_42%,transparent_72%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,transparent_24%,transparent_72%,rgba(255,255,255,0.04)_100%)]" />
            <div className="absolute -left-[18%] top-[8%] h-[42%] w-[120%] rotate-[12deg] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_48%,transparent_100%)] opacity-45 blur-md" />
            <div className="absolute inset-0 opacity-[0.18] mix-blend-screen" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 280 280' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

            {/* Número decorativo interno */}
            <div className="absolute top-6 right-6 pointer-events-none select-none">
              <span
                className="font-heading text-background/10 leading-none block"
                style={{ fontSize: "clamp(6rem, 12vw, 10rem)", letterSpacing: "-0.04em" }}
              >
                01
              </span>
            </div>

            {/* Cita de composición en la base del panel */}
            <div className="relative z-10">
              <p className="text-[0.65rem] uppercase tracking-[0.22em] text-primary/60 mb-3">Impakto Creative</p>
              <p className="font-heading text-background/40 text-[1.4rem] leading-[1.2] tracking-[-0.01em]">
                Estrategia.<br />Estructura.<br />Presencia.
              </p>
            </div>
          </motion.div>

          {/* Panel derecho — manifiesto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE_LUXURY }}
            className="lg:col-span-7 p-9 md:p-14 lg:p-[4.5rem] border border-white/10 border-l-0"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-primary/75">Nuestra metodología</p>
            <h2
              className="mt-5 font-heading leading-[0.92] tracking-[-0.02em] text-background text-balance"
              style={{ fontSize: "clamp(2rem, 3.8vw, 4.1rem)" }}
            >
              Así construimos marcas con{" "}
              <span className="gold-reflect gold-reflect-light">dirección, criterio y consistencia.</span>
            </h2>
            <div className="mt-9 space-y-6 text-[1.02rem] md:text-[1.12rem] leading-[1.72] text-background/80 max-w-[43rem]">
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
