const steps = [
  {
    number: "01",
    title: "Diagnostico",
    description:
      "Analizamos el contexto, identificamos el punto real del proyecto y definimos que necesita ser resuelto.",
  },
  {
    number: "02",
    title: "Direccion",
    description:
      "Establecemos una base conceptual, verbal y estructural que ordena el trabajo posterior.",
  },
  {
    number: "03",
    title: "Desarrollo",
    description:
      "Disenamos y construimos los elementos necesarios con una logica coherente y bien articulada.",
  },
  {
    number: "04",
    title: "Implementacion",
    description:
      "Llevamos la solucion a su version final con precision visual, tecnica y comunicacional.",
  },
  {
    number: "05",
    title: "Optimizacion",
    description:
      "Ajustamos lo necesario para que la experiencia final responda mejor al uso real y al estandar esperado.",
  },
];

export default function Methodology() {
  return (
    <section id="metodo" className="py-24 md:py-32 bg-background border-t border-foreground/8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-16 md:mb-18">
          <span className="text-sm tracking-[0.16em] uppercase font-medium text-primary mb-5 block">
            Metodo de trabajo
          </span>
          <h2 className="font-heading italic text-4xl md:text-6xl mb-7 leading-tight text-foreground">
            Una estructura clara mejora el resultado.
          </h2>
          <p className="text-xl text-foreground/72 leading-relaxed">
            Cada proyecto se desarrolla con una logica ordenada. Esa estructura
            permite tomar mejores decisiones, sostener consistencia y construir
            resultados con mayor solidez.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step) => (
            <article key={step.number} className="border-t border-foreground/12 p-5 md:p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-4">Paso {step.number}</p>
              <h3 className="font-heading text-3xl mb-3 text-foreground">{step.title}</h3>
              <p className="text-foreground/70 leading-relaxed text-sm md:text-base">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
