import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28 md:py-36 bg-accent/25 border-t border-foreground/8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-48 w-[46rem] -translate-x-1/2 bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6 md:px-12">
        <div className="mx-auto max-w-5xl border-t border-foreground/12 bg-background/70 p-8 md:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <h2 className="font-heading italic text-4xl md:text-6xl leading-[1.1] text-foreground mb-6">
                Una presencia mejor resuelta cambia la forma en que una marca es
                percibida.
              </h2>
              <p className="text-lg text-foreground/72 leading-relaxed max-w-3xl">
                Si tu proyecto necesita una estructura mas clara, una comunicacion
                mas solida o una presencia digital mas alineada con su nivel,
                podemos ayudarte a construir esa base con criterio y precision.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
              <Button asChild size="lg" className="w-full rounded-full">
                <Link href="/contacto">Hablemos sobre tu proyecto</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                <Link href="/contacto">Ir a contacto</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
