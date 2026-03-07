import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-foreground text-background pt-20 pb-10">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-background/10 pb-16">

                    {/* Brand & Description */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <Link href="/" className="inline-block mb-6">
                            <Image
                                src="/logos/logoblanco.svg"
                                alt="Impakto Creative"
                                width={190}
                                height={50}
                                className="h-9 w-auto md:h-10"
                            />
                        </Link>
                        <p className="text-accent/80 max-w-md leading-relaxed">
                            Impakto Creative desarrolla soluciones de comunicación, diseño y estructura digital para marcas y negocios que buscan una presencia más sólida, más coherente y más alineada con su nivel real.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-4 lg:col-span-3 lg:col-start-7">
                        <h3 className="text-sm tracking-widest uppercase mb-6 text-accent font-medium">Sitio</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-accent/80 hover:text-primary transition-colors">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/agencia" className="text-accent/80 hover:text-primary transition-colors">Agencia</Link>
                            </li>
                            <li>
                                <Link href="/servicios" className="text-accent/80 hover:text-primary transition-colors">Servicios</Link>
                            </li>
                            <li>
                                <Link href="/contacto" className="text-accent/80 hover:text-primary transition-colors">Contacto</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-sm tracking-widest uppercase mb-6 text-accent font-medium">Contacto</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:hola@impaktocreative.com" className="text-accent/80 hover:text-primary transition-colors">
                                    hola@impaktocreative.com
                                </a>
                            </li>
                            <li className="pt-4">
                                <Link
                                    href="/contacto"
                                    className="inline-block text-sm tracking-widest uppercase border border-background/20 px-6 py-3 rounded-sm hover:bg-primary hover:text-background hover:border-transparent transition-all duration-300"
                                >
                                    Hablemos
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-accent/60">
                    <p>© {new Date().getFullYear()} Impakto Creative. Todos los derechos reservados.</p>
                    <div className="mt-4 md:mt-0 space-x-6">
                        <Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="/terminos" className="hover:text-primary transition-colors">Terminos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
