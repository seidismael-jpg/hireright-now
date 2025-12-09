import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: { 
      center: true, 
      padding: "1.25rem", 
      screens: { "2xl": "1400px" } 
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { 
          DEFAULT: "hsl(var(--primary))", 
          foreground: "hsl(var(--primary-foreground))" 
        },
        secondary: { 
          DEFAULT: "hsl(var(--secondary))", 
          foreground: "hsl(var(--secondary-foreground))" 
        },
        destructive: { 
          DEFAULT: "hsl(var(--destructive))", 
          foreground: "hsl(var(--destructive-foreground))" 
        },
        muted: { 
          DEFAULT: "hsl(var(--muted))", 
          foreground: "hsl(var(--muted-foreground))" 
        },
        accent: { 
          DEFAULT: "hsl(var(--accent))", 
          foreground: "hsl(var(--accent-foreground))" 
        },
        popover: { 
          DEFAULT: "hsl(var(--popover))", 
          foreground: "hsl(var(--popover-foreground))" 
        },
        card: { 
          DEFAULT: "hsl(var(--card))", 
          foreground: "hsl(var(--card-foreground))" 
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        divider: "hsl(var(--divider))",
      },
      fontFamily: {
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "xs": ["0.75rem", { lineHeight: "1rem" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "base": ["0.9375rem", { lineHeight: "1.5rem" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },
      borderRadius: { 
        lg: "var(--radius)", 
        md: "calc(var(--radius) - 2px)", 
        sm: "calc(var(--radius) - 4px)", 
        xl: "1.25rem",
        "2xl": "1.5rem", 
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        "soft": "0 2px 8px -2px hsl(0 0% 0% / 0.06)",
        "medium": "0 4px 16px -4px hsl(0 0% 0% / 0.1)",
        "strong": "0 8px 24px -6px hsl(0 0% 0% / 0.12)",
        "float": "0 12px 40px -12px hsl(0 0% 0% / 0.15)",
        "card": "0 4px 20px -4px hsl(0 0% 0% / 0.08)",
      },
      keyframes: {
        "accordion-down": { 
          from: { height: "0", opacity: "0" }, 
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" } 
        },
        "accordion-up": { 
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" }, 
          to: { height: "0", opacity: "0" } 
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { 
        "accordion-down": "accordion-down 0.2s ease-out", 
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
