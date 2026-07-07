/** @type {import('tailwindcss').Config} */
const darkMode = ["class", "[data-theme='dark']"];

export default {
  darkMode,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        brand: {
          bg: "hsl(var(--brand-bg) / <alpha-value>)",
          surface: "hsl(var(--brand-surface) / <alpha-value>)",
          elevated: "hsl(var(--brand-elevated) / <alpha-value>)",
          border: "hsl(var(--brand-border) / <alpha-value>)",
          'border-subtle': "hsl(var(--brand-border-subtle) / <alpha-value>)",
          text: "hsl(var(--brand-text) / <alpha-value>)",
          'text-secondary': "hsl(var(--brand-text-secondary) / <alpha-value>)",
          'text-muted': "hsl(var(--brand-text-muted) / <alpha-value>)",
          accent: "hsl(var(--brand-accent) / <alpha-value>)",
          'accent-hover': "hsl(var(--brand-accent-hover) / <alpha-value>)",
          success: "hsl(var(--brand-success) / <alpha-value>)",
          error: "hsl(var(--brand-error) / <alpha-value>)",
          'error-bg': "hsl(var(--brand-error-bg) / <alpha-value>)",
          'error-border': "hsl(var(--brand-error-border) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
