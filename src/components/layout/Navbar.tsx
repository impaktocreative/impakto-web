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
      setIsScrolled(window.scrollY > 28);
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Estudio", href: "/agencia" },
    { name: "Servicios Estratégicos", href: "/servicios" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`absolute inset-x-0 top-0 transition-all duration-400 ${
          isScrolled ? "h-[3.95rem] md:h-[4.5rem]" : "h-[4.35rem] md:h-[5.1rem]"
        } ${
          isScrolled
            ? "bg-background/90 shadow-[0_14px_28px_-30px_rgba(50,50,47,0.32)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      />

      <div className="container relative mx-auto max-w-[1320px] px-5 md:px-10 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className={`relative flex items-center px-0 transition-all duration-300 ${
            isScrolled ? "h-[3.95rem] md:h-[4.5rem]" : "h-[4.35rem] md:h-[5.1rem]"
          } ${
            isScrolled ? "border-b border-transparent" : "border-b border-foreground/10"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logos/icono-2.svg"
              alt=""
              aria-hidden="true"
              width={14}
              height={18}
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-[1.05rem] md:h-[1.4rem]" : "h-[1.15rem] md:h-[1.55rem]"
              }`}
            />
            <Image
              src="/logos/logonegro.svg"
              alt="Impakto Creative"
              width={152}
              height={40}
              priority
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-[1.55rem] md:h-[2rem]" : "h-[1.65rem] md:h-[2.25rem]"
              }`}
            />
          </Link>

          <nav className="ml-auto mr-9 hidden md:block" aria-label="Navegación principal">
            <ul className="flex items-center gap-8 lg:gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative inline-flex text-[0.72rem] uppercase tracking-[0.15em] transition-colors duration-300 after:absolute after:-bottom-[0.4rem] after:left-0 after:h-px after:transition-all after:duration-300 ${
                        isActive
                          ? "text-foreground after:w-full after:bg-foreground/38"
                          : "text-foreground/56 hover:text-foreground/86 after:w-0 after:bg-foreground/30 hover:after:w-full"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/contacto"
            className="btn-premium hidden md:inline-flex items-center rounded-full border border-foreground/16 px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.15em] text-foreground/76 transition-all duration-300 hover:-translate-y-px hover:border-foreground/35 hover:text-foreground"
          >
            Reunión estratégica
          </Link>

          <button
            className="ml-auto inline-flex h-8 w-8 items-center justify-center text-foreground md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              aria-label="Navegación móvil"
              className="fixed inset-0 z-40 bg-[linear-gradient(180deg,rgba(246,247,243,0.98)_0%,rgba(239,241,236,0.98)_58%,rgba(231,234,226,0.99)_100%)] backdrop-blur-xl md:hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(169,156,126,0.18),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(142,155,147,0.2),transparent_45%)]" />
              <div className="container relative mx-auto flex h-full max-w-[1320px] flex-col px-7 pb-[calc(1.6rem+env(safe-area-inset-bottom))] pt-[calc(5.3rem+env(safe-area-inset-top))]">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute right-7 top-[calc(1rem+env(safe-area-inset-top))] inline-flex h-10 items-center justify-center rounded-full border border-foreground/16 bg-background/70 px-4 text-[0.6rem] uppercase tracking-[0.15em] text-foreground/82"
                  aria-label="Cerrar menú"
                >
                  Cerrar
                </button>
                <p className="text-[0.62rem] uppercase tracking-[0.2em] text-foreground/44">Navegación</p>

                <nav className="mt-5 border-t border-foreground/10 pt-5">
                  <div className="space-y-2">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;

                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors duration-300 ${
                            isActive ? "bg-foreground/8" : "hover:bg-foreground/6"
                          }`}
                        >
                          <span className="font-heading text-[2.05rem] leading-[1] tracking-[-0.01em] text-foreground/92">
                            {link.name}
                          </span>
                          <span className="text-[0.62rem] uppercase tracking-[0.18em] text-foreground/42 transition-colors duration-300 group-hover:text-foreground/62">
                            Ir
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                <div className="mt-auto border-t border-foreground/10 pt-6">
                  <Link
                    href="/contacto"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-premium inline-flex w-full items-center justify-center rounded-full border border-foreground/16 bg-foreground px-6 py-3 text-[0.68rem] uppercase tracking-[0.15em] text-background"
                  >
                    Reunión estratégica
                  </Link>
                  <p className="mt-3 text-center text-[0.66rem] uppercase tracking-[0.14em] text-foreground/52">
                    Buenos Aires / Argentina - Exterior
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
