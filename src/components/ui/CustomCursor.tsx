"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible] = useState(
        () => typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches
    );

    useEffect(() => {
        // Only show custom cursor on fine pointers (desktop)
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
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
    }, []);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 h-2.5 w-2.5 rounded-full bg-primary/85 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            animate={{
                x: mousePosition.x - 5,
                y: mousePosition.y - 5,
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
