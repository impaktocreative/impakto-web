const faqs = [
  {
    question: "Con que tipo de proyectos trabaja Impakto Creative?",
    answer:
      "Trabajamos con marcas y negocios que buscan ordenar su presencia digital con un enfoque profesional, no con logica de volumen o piezas aisladas.",
  },
  {
    question: "Si no tengo claro que servicio necesito, puedo consultar igual?",
    answer:
      "Si. La conversacion inicial sirve para ordenar el punto de partida y definir que tipo de intervencion tiene mas sentido en tu contexto.",
  },
  {
    question: "Cuanto demora un proyecto?",
    answer:
      "Depende del alcance y la complejidad. Siempre trabajamos con etapas y criterios claros para sostener calidad y previsibilidad.",
  },
  {
    question: "Toman proyectos urgentes?",
    answer:
      "Podemos evaluar urgencias puntuales, pero priorizamos procesos bien orientados porque son los que garantizan resultados solidos.",
  },
];

export default function FAQ() {
  return (
    <section className="py-24 md:py-32 bg-background border-t border-foreground/8">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <h2 className="font-heading italic text-4xl md:text-5xl mb-10">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-foreground/12 bg-transparent p-5 open:bg-accent/8">
              <summary className="cursor-pointer list-none text-lg font-medium text-foreground flex items-center justify-between gap-6">
                {faq.question}
                <span className="text-foreground/55 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-4 text-foreground/72 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
