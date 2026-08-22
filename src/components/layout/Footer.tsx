"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircleMore, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night pt-16 pb-8 text-paper">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(157,157,157,0.2)_0%,rgba(154,154,154,0.08)_16%,rgba(31,35,39,0)_52%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[3px] bg-[linear-gradient(100deg,rgba(194,173,122,0)_8%,rgba(214,191,132,0.2)_26%,rgba(233,214,165,0.95)_50%,rgba(214,191,132,0.2)_74%,rgba(194,173,122,0)_92%)] [background-size:220%_100%]"
        animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: "linear" }}
      />

      <div className="container relative z-10 mx-auto max-w-[1320px] px-7 md:px-12 lg:px-14 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.75 }}
          className="grid grid-cols-1 gap-10 border-b border-white/12 pb-12 md:grid-cols-12 lg:gap-6"
        >
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }} className="md:col-span-12 lg:col-span-5">
            <Link href="/" className="mb-6 inline-block">
              <span className="footer-icon-wrap">
                <Image
                  src="/logos/icono-2.svg"
                  alt="Impakto Creative"
                  width={56}
                  height={72}
                  className="footer-icon h-14 w-auto opacity-95 md:h-[4.1rem]"
                />
              </span>
            </Link>
            <p className="max-w-md leading-relaxed text-accent/78">
              Impakto Creative desarrolla estrategia, comunicación y estructura
              digital para marcas que requieren claridad comercial y estándar de ejecución.
            </p>
            <p className="mt-5 text-eyebrow uppercase text-fog">
              Más de 20 años de experiencia en comunicación y construcción de marca.
            </p>

          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.12 }} className="md:col-span-4 lg:col-span-3 lg:col-start-7">
            <h3 className="mb-5 text-eyebrow uppercase text-fog">Sitio</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-accent/80 transition-colors hover:text-gold">Inicio</Link></li>
              <li><Link href="/agencia" className="text-accent/80 transition-colors hover:text-gold">Agencia</Link></li>
              <li><Link href="/servicios" className="text-accent/80 transition-colors hover:text-gold">Servicios</Link></li>
              <li><Link href="/contacto" className="text-accent/80 transition-colors hover:text-gold">Contacto</Link></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.18 }} className="md:col-span-4 lg:col-span-3">
            <h3 className="mb-5 text-eyebrow uppercase text-fog">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hola@impaktocreative.com" className="inline-flex items-center gap-2 text-accent/80 transition-colors hover:text-gold">
                  <Mail size={14} className="opacity-70" />
                  hola@impaktocreative.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/5491178421357" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-accent/80 transition-colors hover:text-gold">
                  <MessageCircleMore size={14} className="opacity-70" />
                  Argentina: +54 9 11 7842-1357
                </a>
              </li>
              <li>
                <a href="tel:+16152829799" className="inline-flex items-center gap-2 text-accent/80 transition-colors hover:text-gold">
                  <Phone size={14} className="opacity-70" />
                  Exterior: +1 615 282 9799
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-accent/72">
                <MapPin size={14} className="opacity-70" />
                Ciudad de Buenos Aires, Argentina
              </li>
              <li className="pt-3">
                <Link
                  href="/contacto"
                  className="btn-outline-paper mt-1"
                >
                  Pedir diagnóstico
                </Link>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center justify-between pt-6 text-sm text-accent/58 md:flex-row">
          <p>© {new Date().getFullYear()} Impakto Creative. Todos los derechos reservados.</p>
          <div className="mt-4 space-x-6 md:mt-0">
            <Link href="/privacidad" className="transition-colors hover:text-gold">Privacidad</Link>
            <Link href="/terminos" className="transition-colors hover:text-gold">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
