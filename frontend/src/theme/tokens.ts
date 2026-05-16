export const tokens = {
  colors: {
    collector: {
      black: "#090909",
      ink: "#010101",
      green: "#183028",
      deep: "#10211B",
      architectural: "#31463D",
      moss: "#3D4C45",
      champagne: "#C2A878",
      ivory: "#F3EFE7",
      warmMuted: "#8E8A83",
    },
    surface: {
      dashboard: "#151713",
      dashboardRaised: "#1A1B18",
      dashboardInset: "#0D1411",
      darkCard: "#171816",
      lightInventory: "#FEFDFC",
      lightCard: "#F5F2EC",
    },
    text: {
      primaryDark: "#F3EFE7",
      mutedDark: "#8E8A83",
      primaryLight: "#111111",
      mutedLight: "#6E6A63",
    },
    border: {
      dark: "rgba(255, 255, 255, 0.10)",
      champagne: "rgba(194, 168, 120, 0.34)",
      light: "#DDD7CC",
    },
    status: {
      success: "#7EA17A",
      warning: "#C2A878",
      info: "#86A9B6",
      destructive: "#8F4E42",
    },
  },
  typography: {
    heading:
      '"Baskerville", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
    body: '"Avenir Next", "Neue Haas Grotesk Text Pro", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  radius: {
    sm: "0.2rem",
    md: "0.35rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
  },
  shadows: {
    soft: "0 18px 46px rgba(0, 0, 0, 0.14)",
    panel: "0 24px 60px rgba(64, 45, 26, 0.08)",
    modal: "0 28px 90px rgba(0, 0, 0, 0.42)",
  },
  zIndex: {
    base: 0,
    dropdown: 20,
    header: 30,
    modal: 50,
    toast: 60,
  },
  transitions: {
    fast: "150ms ease",
    base: "240ms ease",
    slow: "500ms ease",
  },
  breakpoints: {
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "80rem",
    "2xl": "96rem",
  },
} as const;

export type DesignTokens = typeof tokens;
