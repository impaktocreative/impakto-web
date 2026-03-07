const values = [
  {
    index: "01",
    title: "Direccion clara",
    description:
      "Ordenamos el enfoque general de la marca para que cada decision visual, verbal y digital responda a una direccion definida.",
  },
  {
    index: "02",
    title: "Diseno con estandar",
    description:
      "Desarrollamos entornos y piezas que transmiten una percepcion solida, cuidada y alineada con el valor real del negocio.",
  },
  {
    index: "03",
    title: "Estructura digital",
    description:
      "Construimos sitios y sistemas que mejoran como la marca se presenta, organiza su informacion y acompana sus objetivos comerciales.",
  },
  {
    index: "04",
    title: "Comunicacion mejor resuelta",
    description:
      "Disenamos contenidos y mensajes con precision para expresar el valor de la marca con mas claridad y consistencia.",
  },
];

export default function ValueProposition() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-14 md:mb-18 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-foreground/10 pb-7">
          <h2 className="font-heading italic text-4xl md:text-5xl text-foreground">Que aportamos</h2>
          <span className="text-sm tracking-[0.16em] uppercase text-foreground/50">Propuesta de valor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {values.map((value) => (
            <article
              key={value.index}
              className="group border-b border-foreground/10 bg-accent/8 p-7 md:p-9 transition-colors hover:bg-accent/18"
            >
              <p className="text-[11px] tracking-[0.22em] uppercase text-primary mb-4">{value.index}</p>
              <h3 className="font-heading text-3xl md:text-4xl mb-4 group-hover:text-foreground">
                {value.title}
              </h3>
              <p className="text-foreground/75 leading-relaxed text-lg">{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
