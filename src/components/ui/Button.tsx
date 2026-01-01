import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90",
        secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:opacity-90",
        outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-secondary)] hover:text-[var(--color-secondary-foreground)]",
        ghost: "hover:bg-[var(--color-secondary)] hover:text-[var(--color-secondary-foreground)]",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
