import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "var(--color-primary)",
                    foreground: "var(--color-primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--color-secondary)",
                    foreground: "var(--color-secondary-foreground)",
                },
                accent: {
                    DEFAULT: "var(--color-accent)",
                    foreground: "var(--color-accent-foreground)",
                },
                background: "var(--color-background)",
                foreground: "var(--color-foreground)",
                surface: "var(--color-surface)",
                border: "var(--color-border)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
        },
    },
    plugins: [],
};
export default config;
