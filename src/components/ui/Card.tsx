import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 pb-2 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 pt-2 ${className}`}>{children}</div>;
}
