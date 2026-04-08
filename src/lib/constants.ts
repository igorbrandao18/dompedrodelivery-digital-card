/* ── Design Tokens (matching mobile app_colors.ts / app_dimensions.ts) ── */

export const colors = {
  primary: "#DC2626",
  primaryDark: "#B91C1C",
  primaryTint: "rgba(220, 38, 38, 0.08)",

  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",

  textPrimary: "#111827",
  textSecondary: "#6B7280",

  border: "#E5E7EB",
  borderLight: "rgba(229, 231, 235, 0.5)",

  danger: "#DC2626",
  success: "#22C55E",
  whatsapp: "#25D366",

  bannerFallback: "#FEE2E2",
  overlay: "rgba(0, 0, 0, 0.12)",
  scrim: "rgba(0, 0, 0, 0.40)",

  logoRing: "rgba(220, 38, 38, 0.35)",
  logoShadow: "rgba(220, 38, 38, 0.2)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 28,
} as const;

export const fontSize = {
  "2xs": 10,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 22,
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
export const CARDAPIO_DOMAIN = "dompedrodelivery.com.br";
export const SERVICE_FEE = 0.99;
export const BASE_DELIVERY_FEE = 5.99;
export const FAST_DELIVERY_SURCHARGE = 3.00;
