/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "action-primary": "var(--action-primary, #4285F4)",
        "status-success": "#34A853",
        "status-warning": "#FBBC05",
        "status-error": "#EA4335",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "surface-page": "var(--surface-page)",
        "surface-card": "var(--surface-card)",
        "surface-subtle": "var(--surface-subtle)",
        "border-subtle": "var(--border-subtle)",
      },
      borderRadius: {
        "ios-card": "16px",
        "ios-btn": "12px",
      },
      boxShadow: {
        "card": "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 30px -4px rgba(0, 0, 0, 0.16)",
        "glow": "0 0 20px -4px var(--action-primary)",
      },
      animation: {
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 2s infinite ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
}
