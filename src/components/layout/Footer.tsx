import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#363531] text-[#faf1e7] pt-20 pb-10">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 border-b border-[#faf1e7]/10 pb-16">

                    {/* Brand & Description */}
                    <div className="md:col-span-12 lg:col-span-5">
                        <Link href="/" className="inline-block mb-6">
                            <h2 className="font-heading italic text-3xl text-primary">Impakto Creative</h2>
                        </Link>
                        <p className="text-[#dedcd4]/70 max-w-md leading-relaxed">
                            Impakto Creative desarrolla soluciones de comunicación, diseño y estructura digital para marcas y negocios que buscan una presencia más sólida, más coherente y más alineada con su nivel real.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="md:col-span-4 lg:col-span-3 lg:col-start-7">
                        <h3 className="text-sm tracking-widest uppercase mb-6 text-[#dedcd4] font-medium">Sitio</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-[#dedcd4]/70 hover:text-primary transition-colors">Inicio</Link>
                            </li>
                            <li>
                                <Link href="/agencia" className="text-[#dedcd4]/70 hover:text-primary transition-colors">Agencia</Link>
                            </li>
                            <li>
                                <Link href="/servicios" className="text-[#dedcd4]/70 hover:text-primary transition-colors">Servicios</Link>
                            </li>
                            <li>
                                <Link href="/contacto" className="text-[#dedcd4]/70 hover:text-primary transition-colors">Contacto</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <h3 className="text-sm tracking-widest uppercase mb-6 text-[#dedcd4] font-medium">Contacto</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="mailto:hola@impaktocreative.com" className="text-[#dedcd4]/70 hover:text-primary transition-colors">
                                    hola@impaktocreative.com
                                </a>
                            </li>
                            <li className="pt-4">
                                <Link
                                    href="/contacto"
                                    className="inline-block text-sm tracking-widest uppercase border border-[#faf1e7]/20 px-6 py-3 rounded-sm hover:bg-primary hover:text-[#363531] hover:border-transparent transition-all duration-300"
                                >
                                    Hablemos
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-[#dedcd4]/50">
                    <p>© {new Date().getFullYear()} Impakto Creative. Todos los derechos reservados.</p>
                    <div className="mt-4 md:mt-0 space-x-6">
                        <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
