export const theme = {
  colors: {
    "light-gray": "#F8F9FE",
    gray: "#E5E7EB",
    primary: "#FF6B9D", // Playful pink
    "primary-light": "#FFB3D1", // Light pink for disabled states
    secondary: "#FFB347", // Warm orange
    success: "#4ECDC4", // Mint green
    warning: "#FFD93D", // Sunshine yellow
    danger: "#FF8A80", // Soft coral red
    surface: "#FFF5F8", // Light pink tint
    text: "#2D3748", // Softer dark text
    muted: "#718096", // Warmer muted text
    border: "#F7FAFC", // Very light border
    white: "#FFFFFF",
    background: "#F0F4FF", // Soft blue-tinted background
    accent1: "#A78BFA", // Soft purple
    accent2: "#34D399", // Fresh green
    accent3: "#FBBF24", // Golden yellow
    accent4: "#60A5FA", // Sky blue
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
      shadowColor: "#FF6B9D",
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