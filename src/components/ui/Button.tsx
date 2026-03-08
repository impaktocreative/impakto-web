"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-[0.7rem] tracking-[0.14em] uppercase font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // §5 Blueprint: "tide-fill" — el color sube desde abajo como una marea
                default:
                    "btn-tide relative overflow-hidden rounded-[0.72rem] bg-foreground text-background transition-colors duration-500 [&::after]:bg-primary hover:text-background",
                destructive:
                    "rounded-[0.72rem] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-300",
                outline:
                    "btn-tide relative overflow-hidden rounded-[0.72rem] border border-foreground/20 bg-background text-foreground transition-colors duration-500 [&::after]:bg-foreground hover:text-background",
                secondary:
                    "rounded-[0.72rem] bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-300",
                ghost: "hover:bg-accent hover:text-accent-foreground transition-colors duration-300",
                link: "text-foreground underline-offset-4 hover:underline hover:text-primary transition-colors duration-300",
                // §5 Blueprint: "cta-link" — kicker + hairline horizontal animada
                "cta-link": "cta-link",
            },
            size: {
                default: "h-12 px-9 py-3",
                sm: "h-9 px-4",
                lg: "h-14 px-12",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        // cta-link doesn't need a size
        const sizeResolved = variant === "cta-link" ? undefined : size;
        return (
            <Comp
                className={buttonVariants({ variant, size: sizeResolved, className })}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
