import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="contenido-principal" className="flex-grow pt-[88px] grid place-items-center px-6 py-24">
      <div className="max-w-2xl text-center">
        <p className="text-sm tracking-widest uppercase font-medium text-primary mb-5">404</p>
        <h1 className="font-heading italic text-5xl md:text-6xl mb-6">
          Esta pagina no esta disponible.
        </h1>
        <p className="text-foreground/70 text-lg mb-10">
          Puede volver al inicio o escribirnos para orientar su solicitud.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">Ir al inicio</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contacto">Ir a contacto</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
