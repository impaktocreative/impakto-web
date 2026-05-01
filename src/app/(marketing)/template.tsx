"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0.01 }
            : { duration: 0.58, delay: 1.55, ease: [0.16, 1, 0.3, 1] }
        }
        className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-[linear-gradient(180deg,rgba(245,246,242,0.98)_0%,rgba(241,243,238,0.97)_100%)]"
        aria-hidden="true"
      >
        <motion.span
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0 }
              : { opacity: [0, 0, 0.26, 0], scale: [0.94, 0.94, 1.06, 1.1] }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { duration: 0.56, delay: 1.18, ease: [0.16, 1, 0.3, 1] }
          }
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,251,240,0.95)_0%,rgba(255,245,224,0.5)_18%,rgba(255,245,224,0.14)_34%,transparent_60%)] mix-blend-screen"
        />

        <div className="flex flex-col items-center">
          <motion.span
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : { duration: 0.62, ease: [0.16, 1, 0.3, 1] }
            }
            className="pointer-events-none absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(164,154,130,0.26)_0%,rgba(164,154,130,0.06)_45%,transparent_75%)] blur-xl"
          />

          <div className="relative h-[4.7rem] w-[3.9rem] overflow-hidden md:h-[5.8rem] md:w-[4.8rem]">
            <Image
              src="/logos/icono-2.svg"
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 768px) 4.8rem, 3.9rem"
              className="object-contain opacity-18"
            />
            <motion.div
              initial={
                prefersReducedMotion
                  ? { clipPath: "inset(0 0 0 0)", scale: 1, filter: "blur(0px)" }
                  : { clipPath: "inset(100% 0 0 0)", scale: 0.9, filter: "blur(2px)" }
              }
              animate={{ clipPath: "inset(0 0% 0 0)", scale: 1, filter: "blur(0px)" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.01 }
                  : { duration: 1.22, delay: 0.1, ease: [0.2, 1, 0.25, 1] }
              }
              className="absolute inset-0"
            >
              <Image
                src="/logos/icono-2.svg"
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 768px) 4.8rem, 3.9rem"
                className="object-contain"
              />
            </motion.div>
          </div>

          <div className="relative mt-5 h-px w-40 overflow-hidden bg-foreground/18 md:w-48">
            <motion.span
              initial={prefersReducedMotion ? { x: 0 } : { x: "-100%" }}
              animate={{ x: "100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0.01 }
                  : { duration: 1.35, delay: 0.16, ease: [0.16, 1, 0.3, 1] }
              }
              className="absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,rgba(164,154,130,0),rgba(164,154,130,0.85),rgba(142,155,147,0))]"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={
          prefersReducedMotion
            ? { duration: 0.01 }
            : { duration: 1.05, delay: 0.44, ease: [0.22, 1, 0.36, 1] }
        }
        className="flex min-h-screen flex-col"
      >
        {children}
      </motion.div>
    </>
  );
}
