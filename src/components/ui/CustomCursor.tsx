"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show custom cursor on fine pointers (desktop)
        if (window.matchMedia("(pointer: coarse)").matches) return;

        setIsVisible(true);

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
            className="fixed top-0 left-0 w-3 h-3 rounded-full bg-primary pointer-events-none z-[9999] mix-blend-difference hidden md:block"
            animate={{
                x: mousePosition.x - 6,
                y: mousePosition.y - 6,
                scale: isHovering ? 3.5 : 1,
                opacity: isHovering ? 0.7 : 1,
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
