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
            <div className="hidden md:flex h-8 items-center justify-center bg-foreground text-background/74 text-[11px]">
                <p className="tracking-[0.06em] uppercase">Estrategia integral para marcas que buscan posicionarse con alto estándar</p>
            </div>
            <div
                className={`container mx-auto px-6 md:px-12 flex items-center py-3.5 md:py-4.5 transition-all duration-500 ${isScrolled
                    ? "bg-[#fdfaf6]/96 backdrop-blur-xl border-b border-foreground/8"
                    : "bg-[#fdfaf6] border-b border-foreground/8"
                    }`}
            >
                {/* Logo */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                    <Link href="/" className="relative flex items-center group">
                        <span className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full bg-primary/22 blur-xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
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
                                className={`text-[0.75rem] lg:text-[0.84rem] tracking-[0.09em] uppercase transition-colors font-medium ${pathname === link.href ? "text-foreground" : "text-foreground/62 hover:text-foreground"}`}
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
                        className="font-sans text-[0.75rem] lg:text-[0.84rem] tracking-[0.1em] uppercase px-5 py-2 rounded-[0.78rem] border border-primary/80 bg-primary text-background shadow-[0_10px_24px_rgba(54,53,49,0.16)] hover:bg-foreground hover:border-foreground hover:text-background transition-all duration-300 hover:-translate-y-[1px]"
                    >
                        Agendar reunión
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
                        className="absolute top-full left-0 w-full mt-2 bg-[#fdfaf6]/96 backdrop-blur-xl border border-foreground/10 py-6 px-6 md:hidden flex flex-col gap-6 shadow-xl rounded-3xl"
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
                            className="font-sans text-center text-sm tracking-[0.09em] uppercase bg-primary text-background px-6 py-4 rounded-[0.9rem] hover:bg-foreground hover:text-background transition-all duration-300 w-full mt-4"
                        >
                            Agendar reunión
                        </Link>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
