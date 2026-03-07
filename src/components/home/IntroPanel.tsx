export default function IntroPanel() {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          <div className="lg:col-span-5">
            <span className="text-sm tracking-[0.16em] uppercase text-primary/90 block mb-5">
              Manifiesto operativo
            </span>
            <h2 className="font-heading italic text-4xl md:text-6xl leading-[1.1] text-primary">
              La percepción de una marca se construye en cada decisión.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6 text-lg md:text-xl leading-relaxed text-background/80">
            <p>
              La forma en que una marca se presenta influye en cómo es entendida,
              valorada y recordada. Esa percepción no depende solo de una identidad
              visual o de un sitio correcto. Depende de la calidad del sistema
              completo.
            </p>
            <p>
              Por eso trabajamos sobre dirección, mensajes, estructura y diseño
              como partes de una misma construcción. Cada proyecto se desarrolla
              con criterio y precisión para sostener consistencia en el tiempo.
            </p>
            <p className="text-background">Impakto Creative trabaja sobre esa base.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
