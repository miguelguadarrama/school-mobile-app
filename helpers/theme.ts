export const theme = {
  colors: {
    primary: "#6C8CF5",
    secondary: "#FFB86B",
    success: "#62D095",
    warning: "#FFD166",
    danger: "#FF6B6B",
    surface: "#FFF8F1",
    text: "#2B2B2B",
    muted: "#63707A",
    border: "#E8E2DA",
    white: "#FFFFFF",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  shadow: {
    card: { elevation: 2 }, // iOS shadow + Android elevation if you like
  },
  typography: {
    // hook these up to your loaded fonts
    family: { regular: "Nunito_400Regular", bold: "Nunito_700Bold" },
    size: { sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 },
  },
};