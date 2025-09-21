export const theme = {
  colors: {
    // Neutrals
    "light-gray": "#F8F9FE",          // unchanged
    gray: "#E5E7EB",                  // unchanged
    text: "#1F2937",                  // darker for legibility
    muted: "#64748B",                 // cooler secondary text
    border: "#E2E8F0",                // stronger than before for crisp edges
    "border-subtle": "#F1F5F9",       // hairline dividers / card outlines
    white: "#FFFFFF",

    // App canvas
    background: "#ECF2FF",            // slightly deeper cool blue (vs #F0F4FF)
    surface: "#FFFFFF",               // bars, sheets, panels → clear contrast on background
    "surface-alt": "#FFEAF2",         // OPTIONAL: gentle pink tint for emphasized bars

    // Brand & states (unchanged vibe)
    primary: "#FF6B9D",               // playful pink
    "primary-light": "#FFB3D1",
    secondary: "#FFB347",             // warm orange
    success: "#4ECDC4",               // mint
    warning: "#FFD93D",               // sunshine yellow
    danger: "#FF8A80",                // soft coral red

    // Accents (unchanged vibe)
    accent1: "#A78BFA",               // soft purple
    accent2: "#34D399",               // fresh green
    accent3: "#FBBF24",               // golden yellow
    accent4: "#60A5FA",               // sky blue
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
  shadow: {
    card: {
      elevation: 6,
      shadowColor: "#999",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    soft: {
      elevation: 3,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  },
  typography: {
    family: { regular: "Nunito_400Regular", bold: "Nunito_700Bold" },
    size: { sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 },
  },
};