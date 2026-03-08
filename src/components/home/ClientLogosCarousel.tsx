"use client";

import Image from "next/image";

const logos = [
  { file: "hsm.jpg", name: "HSM" },
  { file: "ras.png", name: "RAS" },
  { file: "carballal-prop.jpg", name: "Carballal Propiedades" },
  { file: "venfarma.jpeg", name: "Venfarma" },
  { file: "rebecca.webp", name: "Rebecca" },
  { file: "neicha.jpg", name: "Neicha" },
  { file: "hk-logo.webp", name: "HK" },
  { file: "Floyd-logo.svg", name: "Floyd" },
  { file: "GrupoVargas-WS-Assets_Catálogo-Vargas.jpg", name: "Grupo Vargas" },
  { file: "GrupoVargas-WS-Assets_Catálogo-Restorando.jpg", name: "Restorando" },
  { file: "GrupoVargas-WS-Assets_Catálogo-BD.jpg", name: "BD" },
];

const repeated = [...logos, ...logos];

export default function ClientLogosCarousel() {
  return (
    <section className="border-b border-foreground/7 bg-background/75">
      <div className="container mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16 py-0">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-background to-transparent" />

          <div className="logos-track flex w-max items-stretch gap-0 border-x border-foreground/8" aria-label="Logos de clientes">
            {repeated.map((logo, index) => (
              <div key={`${logo.file}-${index}`} className="flex h-20 w-44 md:h-24 md:w-56 items-center justify-center border-r border-foreground/8 bg-background/55 px-6">
                <Image
                  src={encodeURI(`/logos/clientes/${logo.file}`)}
                  alt={logo.name}
                  width={180}
                  height={56}
                  className="max-h-8 md:max-h-9 w-auto object-contain grayscale mix-blend-multiply opacity-68 transition-opacity duration-300 hover:opacity-95"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .logos-track {
          animation: logos-marquee 42s linear infinite;
        }

        @keyframes logos-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
