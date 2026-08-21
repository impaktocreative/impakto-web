"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * La píldora es el único lenguaje de forma para lo interactivo.
 * Las variantes componen las clases de globals.css para que haya una
 * sola fuente de verdad: acá no se redefine ni el radio ni el color.
 *
 * El admin no lo usa — de src/components/ui solo comparte Modal.
 */
const buttonVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-graphite/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        default: "btn-ink sheen",
        outline: "btn-outline",
        // Sobre superficie invertida el relleno se da vuelta: papel sobre tinta.
        invert: "btn-paper sheen",
        "invert-outline": "btn-outline-paper",
        ghost:
          "inline-flex items-center justify-center text-body-sm text-slate underline decoration-graphite/25 underline-offset-4 transition-colors duration-300 hover:text-ink hover:decoration-graphite/50",
        link: "cta-link",
        "cta-link": "cta-link",
      },
      size: {
        default: "",
        sm: "!min-h-[2.5rem] !px-5 !text-caption",
        lg: "!min-h-[3.5rem] !px-9",
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
    const textOnly = variant === "cta-link" || variant === "link" || variant === "ghost";
    return (
      <Comp
        className={buttonVariants({ variant, size: textOnly ? undefined : size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
