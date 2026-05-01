"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue } from "framer-motion";

export default function CustomCursor() {
    const pathname = usePathname();
    const isAdminPath = pathname.startsWith("/admin");
    const [isHovering, setIsHovering] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [isVisible] = useState(
        () =>
            typeof window !== "undefined" &&
            !window.matchMedia("(pointer: coarse)").matches &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        if (isAdminPath) {
            return;
        }

        if (
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
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
    }, [x, y, isAdminPath]);

    if (isAdminPath) return null;

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 h-2.5 w-2.5 rounded-full bg-primary/85 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
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
