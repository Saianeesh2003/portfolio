export type Format = "post" | "story" | "carousel";

export type SlideType = "hook" | "content" | "stat" | "quote" | "cta";

export interface Slide {
  id: string;
  type: SlideType;
  headline: string;
  subtext: string;
  imagePrompt: string;
  imageUrl?: string;
  layout: "centered" | "left" | "split";
}

export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  tone: string;
}

export interface GenerateRequest {
  prompt: string;
  format: Format;
  brand: BrandConfig;
  slideCount?: number;
}

export interface GenerateResponse {
  title: string;
  format: Format;
  slides: Slide[];
}

export const DEFAULT_BRAND: BrandConfig = {
  primaryColor: "#1a237e",
  secondaryColor: "#ffffff",
  accentColor: "#ff6f00",
  fontFamily: "Inter",
  tone: "educational, warm, confident",
};

export const PALETTES: { name: string; primary: string; secondary: string; accent: string }[] = [
  { name: "Cuemath Blue", primary: "#1a237e", secondary: "#ffffff", accent: "#ff6f00" },
  { name: "Ocean", primary: "#0c4a6e", secondary: "#f0f9ff", accent: "#06b6d4" },
  { name: "Forest", primary: "#14532d", secondary: "#f0fdf4", accent: "#22c55e" },
  { name: "Sunset", primary: "#7c2d12", secondary: "#fff7ed", accent: "#f97316" },
  { name: "Purple", primary: "#3b0764", secondary: "#faf5ff", accent: "#a855f7" },
  { name: "Dark Pro", primary: "#0f172a", secondary: "#f8fafc", accent: "#6366f1" },
];
