"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Agencia", href: "/agencia" },
        { name: "Servicios", href: "/servicios" },
    ];

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? "bg-background/90 backdrop-blur-md border-b border-foreground/5 py-4"
                    : "bg-transparent py-6"
                }`}
        >
            <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="font-heading italic text-2xl tracking-wide group-hover:text-primary transition-colors">
                        Impakto Creative
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm tracking-widest uppercase hover:text-primary transition-colors font-medium text-foreground/80 hover:text-foreground"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="/contacto"
                        className="ml-4 text-sm tracking-widest uppercase bg-foreground text-background px-6 py-3 rounded-sm hover:bg-primary hover:text-foreground transition-all duration-300"
                    >
                        Contacto
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.nav
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-background border-b border-foreground/10 py-6 px-6 md:hidden flex flex-col gap-6 shadow-xl"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-lg tracking-wider uppercase font-medium text-foreground/80 hover:text-primary"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            href="/contacto"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-center text-sm tracking-widest uppercase bg-foreground text-background px-6 py-4 rounded-sm hover:bg-primary hover:text-foreground transition-all duration-300 w-full mt-4"
                        >
                            Contacto
                        </Link>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
