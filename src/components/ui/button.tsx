"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center white-space-nowrap rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-violet)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 font-bold uppercase",
    {
        variants: {
            variant: {
                default:
                    "bg-[var(--color-action-emerald)]/90 text-white hover:bg-[var(--color-action-emerald)]",
                destructive:
                    "bg-[var(--color-bullshit-crimson)] text-white hover:bg-[var(--color-bullshit-crimson)]/90",
                outline:
                    "border border-[var(--color-border)] bg-[var(--color-surface)] backdrop-blur-md hover:bg-white/10 text-foreground",
                secondary:
                    "bg-[var(--color-surface)] backdrop-blur-sm text-foreground hover:bg-white/10",
                ghost: "hover:bg-white/10 text-foreground",
                link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
                glass: "glass-panel border-[var(--color-border)] hover:bg-white/10 text-foreground",
                violet: "bg-[var(--color-focus-violet)]/90 text-white hover:bg-[var(--color-focus-violet)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 rounded-md px-3",
                lg: "h-12 rounded-xl px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

type MotionButtonProps = ButtonProps & HTMLMotionProps<"button">

const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : motion.button
        const motionProps = asChild ? {} : {
            whileTap: { scale: 0.98 },
            whileHover: { scale: 1.02 },
        }

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...motionProps as any}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
