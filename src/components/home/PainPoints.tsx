const painPoints = [
  "La marca evoluciono y su presentacion actual ya no la representa.",
  "El sitio quedo por debajo del nivel real del negocio.",
  "La comunicacion perdio coherencia entre canales y soportes.",
  "Existen piezas aisladas, pero falta sistema.",
  "El equipo necesita una agencia que piense y ejecute con precision.",
];

export default function PainPoints() {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 md:mb-16">
            <span className="text-sm tracking-[0.16em] uppercase font-medium text-primary mb-4 block">
              Contextos clave
            </span>
            <h2 className="font-heading italic text-4xl md:text-6xl text-background mb-6 leading-tight">
              Hay etapas en las que una marca necesita algo mas que ejecucion.
            </h2>
            <p className="text-lg text-background/75 leading-relaxed max-w-3xl">
              Muchas empresas llegan a un punto donde su presencia digital deja de
              acompanar su nivel real. En esos casos, el valor no esta en sumar
              piezas: esta en ordenar con criterio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {painPoints.map((item) => (
              <div key={item} className="border-l border-primary/45 bg-transparent py-2 pl-4 pr-2">
                <p className="text-background/80 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
