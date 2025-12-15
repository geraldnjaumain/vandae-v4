import * as React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: "h1" | "h2" | "h3" | "h4" | "p" | "small" | "muted" | "lead"
    as?: React.ElementType
}

export function Typography({
    variant = "p",
    as,
    className,
    children,
    ...props
}: TypographyProps) {
    const Component = as || getDefaultElement(variant)

    const variantClasses = {
        h1: "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl",
        h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
        h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
        h4: "scroll-m-20 text-xl font-semibold tracking-tight",
        p: "leading-7 text-muted-foreground",
        lead: "text-xl text-muted-foreground",
        small: "text-sm font-medium leading-none",
        muted: "text-sm text-muted-foreground",
    }

    return (
        <Component
            className={cn(variantClasses[variant], className)}
            {...props}
        >
            {children}
        </Component>
    )
}

function getDefaultElement(variant: TypographyProps["variant"]): React.ElementType {
    switch (variant) {
        case "h1":
            return "h1"
        case "h2":
            return "h2"
        case "h3":
            return "h3"
        case "h4":
            return "h4"
        case "small":
            return "small"
        case "lead":
            return "p"
        case "muted":
            return "p"
        default:
            return "p"
    }
}
