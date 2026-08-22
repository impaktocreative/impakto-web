"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue } from "framer-motion";

const POINTER_COARSE = "(pointer: coarse)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToPointerPreferences(onChange: () => void) {
    const coarse = window.matchMedia(POINTER_COARSE);
    const reduced = window.matchMedia(REDUCED_MOTION);

    coarse.addEventListener("change", onChange);
    reduced.addEventListener("change", onChange);

    return () => {
        coarse.removeEventListener("change", onChange);
        reduced.removeEventListener("change", onChange);
    };
}

function readPointerPreferences() {
    return (
        !window.matchMedia(POINTER_COARSE).matches &&
        !window.matchMedia(REDUCED_MOTION).matches
    );
}

// El servidor no puede conocer el puntero del visitante. Devolver false acá
// hace que el primer render coincida en ambos lados; React vuelve a renderizar
// con el valor real apenas hidrata.
function readOnServer() {
    return false;
}

export default function CustomCursor() {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith("/admin");
    const [isHovering, setIsHovering] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const isVisible = useSyncExternalStore(
        subscribeToPointerPreferences,
        readPointerPreferences,
        readOnServer
    );

    useEffect(() => {
        if (isAdminPath || !isVisible) {
            return;
        }

        const updateMousePosition = (e: MouseEvent) => {
            x.set(e.clientX - 5);
            y.set(e.clientY - 5);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                window.getComputedStyle(target).cursor === "pointer" ||
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button")
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener("mousemove", updateMousePosition, { passive: true });
        window.addEventListener("mouseover", handleMouseOver, { passive: true });

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [x, y, isAdminPath, isVisible]);

    if (isAdminPath) return null;

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 h-2.5 w-2.5 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            style={{ x, y }}
            animate={{
                scale: isHovering ? 2.9 : 1,
                opacity: isHovering ? 0.62 : 0.78,
            }}
            transition={{
                type: "spring",
                stiffness: 800,
                damping: 35,
                mass: 0.2,
            }}
        />
    );
}
