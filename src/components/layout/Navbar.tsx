"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setIsScrolled(y > 56);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Agencia", href: "/agencia" },
        { name: "Servicios", href: "/servicios" },
        { name: "Contacto", href: "/contacto" },
    ];

    return (
        <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
            <div className="hidden md:flex h-8 items-center justify-center bg-foreground text-background/70 text-[11px]">
                <p className="tracking-[0.06em] uppercase">Estrategia integral para marcas que buscan posicionarse con alto estándar</p>
            </div>
            <div
                className={`container mx-auto px-6 md:px-12 flex items-center py-3.5 md:py-4.5 transition-all duration-500 ${isScrolled
                    ? "bg-[#fdfaf6]/92 backdrop-blur-lg border-b border-foreground/7"
                    : "bg-[#fdfaf6]/96 border-b border-foreground/7"
                    }`}
            >
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <Link href="/" className="relative flex items-center">
                        <Image
                            src="/logos/logonegro.svg"
                            alt="Impakto Creative"
                            width={170}
                            height={45}
                            priority
                            className="relative h-8 w-auto md:h-9"
                        />
                    </Link>
                </motion.div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-10 ml-auto mr-auto font-sans" aria-label="Navegación principal">
                    {navLinks.map((link, index) => (
                        <motion.div
                            key={link.name}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.38, delay: 0.03 * index }}
                        >
                            <Link
                                href={link.href}
                                aria-current={pathname === link.href ? "page" : undefined}
                                className={`relative text-[0.75rem] lg:text-[0.82rem] tracking-[0.08em] uppercase transition-colors font-medium after:absolute after:left-0 after:-bottom-[0.32rem] after:h-px after:bg-foreground/38 after:transition-all after:duration-300 ${pathname === link.href ? "text-foreground after:w-full" : "text-foreground/56 hover:text-foreground/82 after:w-0 hover:after:w-full"}`}
                            >
                                {link.name}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.42, delay: 0.14 }}
                    className="hidden md:block"
                >
                    <Link
                        href="/contacto"
                        className="relative font-sans text-[0.74rem] lg:text-[0.81rem] tracking-[0.08em] uppercase px-5 py-[0.58rem] rounded-full border border-foreground/18 bg-transparent text-foreground/78 hover:bg-foreground hover:border-foreground hover:text-background transition-all duration-300"
                    >
                        <span className="relative z-10">Agendar reunión</span>
                    </Link>
                </motion.div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-foreground ml-auto"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-navigation"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.nav
                        id="mobile-navigation"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        aria-label="Navegación móvil"
                        className="absolute top-full left-0 w-full mt-2 bg-[#fdfaf6]/96 backdrop-blur-xl border border-foreground/10 py-6 px-6 md:hidden flex flex-col gap-6 shadow-lg rounded-3xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                aria-current={pathname === link.href ? "page" : undefined}
                                className="font-sans text-base tracking-[0.09em] uppercase font-medium text-foreground/80 hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/contacto"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="font-sans text-center text-sm tracking-[0.09em] uppercase border border-foreground/16 text-foreground/78 px-6 py-4 rounded-[0.9rem] hover:bg-foreground hover:border-foreground hover:text-background transition-all duration-300 w-full mt-4"
                        >
                            Agendar reunión
                        </Link>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
