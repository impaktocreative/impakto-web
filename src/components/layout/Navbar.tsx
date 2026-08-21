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
    { name: "Agencia", href: "/agencia" },
    { name: "Servicios", href: "/servicios" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`absolute inset-x-0 top-0 transition-all duration-300 ${
          isScrolled ? "h-[3.95rem] md:h-[4.5rem]" : "h-[4.35rem] md:h-[5.1rem]"
        } ${
          isScrolled
            ? "border-b border-graphite/10 bg-paper/88 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      />

      <div className="container relative mx-auto max-w-[1320px] px-5 md:px-10 lg:px-14 xl:px-16">
        {/* Entrada por CSS: con framer el logo se pintaba recién al hidratar
            y en /contacto era el elemento del LCP, a 2.9 s. */}
        <div
          className={`hero-rise relative flex items-center px-0 transition-all duration-300 ${
            isScrolled ? "h-[3.95rem] md:h-[4.5rem]" : "h-[4.35rem] md:h-[5.1rem]"
          } ${
            isScrolled ? "" : "border-b border-graphite/8"
          }`}
        >
          <Link href="/" className="flex items-center">
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
                      className={`relative inline-flex text-body-sm transition-colors duration-300 after:absolute after:-bottom-[0.45rem] after:left-0 after:h-px after:transition-all after:duration-500 ${
                        isActive
                          ? "text-ink after:w-full after:bg-[var(--hairline-gold)]"
                          : "text-stone hover:text-ink after:w-0 after:bg-graphite/25 hover:after:w-full"
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
            className="btn-ink sheen hidden !min-h-[2.6rem] !px-6 !text-caption md:inline-flex"
          >
            Pedir diagnóstico
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
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              aria-label="Navegación móvil"
              className="fixed inset-0 z-40 bg-paper/98 backdrop-blur-xl md:hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(157,157,157,0.18),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(152,152,152,0.2),transparent_45%)]" />
              <div className="container relative mx-auto flex h-full max-w-[1320px] flex-col px-7 pb-[calc(1.6rem+env(safe-area-inset-bottom))] pt-[calc(5.3rem+env(safe-area-inset-top))]">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-outline absolute right-7 top-[calc(1rem+env(safe-area-inset-top))] !min-h-[2.5rem] !px-5 !text-caption"
                  aria-label="Cerrar menú"
                >
                  Cerrar
                </button>
                <p className="text-eyebrow uppercase text-stone">Navegación</p>

                <nav className="mt-5 border-t border-graphite/12 pt-5">
                  <div className="space-y-2">
                    {navLinks.map((link) => {
                      const isActive = pathname === link.href;

                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center justify-between rounded-card px-3 py-3.5 transition-colors duration-300 ${
                            isActive ? "bg-cloud" : "hover:bg-cloud/60"
                          }`}
                        >
                          <span className="font-heading text-display-sm text-ink">
                            {link.name}
                          </span>
                          <span className="text-eyebrow uppercase text-stone transition-colors duration-300 group-hover:text-slate">
                            Ir
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                <div className="mt-auto border-t border-graphite/12 pt-6">
                  <Link
                    href="/contacto"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-ink sheen w-full"
                  >
                    Pedir diagnóstico
                  </Link>
                  <p className="mt-4 text-center text-eyebrow uppercase text-stone">
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
