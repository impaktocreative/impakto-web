const fit = [
  "Valoran claridad y direccion antes que velocidad sin proceso.",
  "Buscan una presencia mas solida y consistente en cada punto de contacto.",
  "Reconocen el valor de decisiones bien pensadas y ejecucion cuidada.",
  "Priorizan calidad y una relacion profesional sostenida.",
];

const noFit = [
  "Proyectos que solo comparan precio.",
  "Pedidos de tareas sueltas sin estrategia.",
  "Expectativas de resultados inmediatos sin proceso.",
  "Busquedas de volumen barato sin direccion.",
];

export default function IdealClient() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-foreground/8">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mb-12">
          <h2 className="font-heading italic text-4xl md:text-6xl text-foreground mb-7 leading-tight">
            Trabajamos mejor con marcas y negocios que buscan una construccion seria
            y bien resuelta.
          </h2>
          <p className="text-foreground/75 leading-relaxed text-lg">
            Nuestros mejores proyectos aparecen cuando existe intencion real de
            ordenar la presencia de una marca, elevar su percepcion y construir
            una base digital solida con direccion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="border-t border-foreground/12 p-8 bg-accent/10">
            <h3 className="font-heading text-4xl mb-6">Encaje ideal</h3>
            <ul className="space-y-4 text-foreground/78">
              {fit.map((item) => (
                <li key={item} className="border-b border-foreground/8 pb-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="border-t border-foreground/12 p-8 bg-background">
            <h3 className="font-heading text-4xl mb-6">Cuando no hay alineacion</h3>
            <ul className="space-y-4 text-foreground/72">
              {noFit.map((item) => (
                <li key={item} className="border-b border-foreground/8 pb-3">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
