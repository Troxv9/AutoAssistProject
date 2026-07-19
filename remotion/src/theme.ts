
import type { SpringConfig } from "remotion";

export const COLORS = {
  base: "#0A0A0A",
  surface: "#171717",
  ink: "#FFFFFF",
  inkSoft: "rgba(255,255,255,0.62)",
  inkFaint: "rgba(255,255,255,0.34)",
  accent: "#DC2626",
  accentDeep: "#7F1D1D",
  accentBright: "#EF4444",
  hairline: "rgba(255,255,255,0.10)",
} as const;

export const SURFACE = {
  bg: "#FFFFFF",
  bgSoft: "#F7F7F8",
  bgSunken: "#F1F1F3",
  ink: "#0A0A0A",
  inkSoft: "rgba(10,10,10,0.60)",
  inkFaint: "rgba(10,10,10,0.40)",
  border: "rgba(10,10,10,0.08)",
  borderStrong: "rgba(10,10,10,0.14)",
  success: "#16A34A",
  successSoft: "rgba(22,163,74,0.10)",
  warn: "#DC2626",
  warnSoft: "rgba(220,38,38,0.06)",
  accent: "#DC2626",
  accentSoft: "rgba(220,38,38,0.08)",
  shadow: "0 30px 80px -40px rgba(0,0,0,0.55), 0 8px 24px -12px rgba(0,0,0,0.25)",
} as const;

export const GLASS = {
  background:
    "linear-gradient(155deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
  border: `1px solid ${COLORS.hairline}`,
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow:
    "0 24px 80px -32px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)",
} as const;


export const FONTS = {
  sans: `"Noto Sans Georgian", "Inter", system-ui, -apple-system, sans-serif`,
  mono: `"JetBrains Mono", "Noto Sans Georgian", "SFMono-Regular", ui-monospace, monospace`,
} as const;


export const SPRINGS: Record<"SNAPPY" | "SETTLE" | "GLIDE" | "KINETIC", Partial<SpringConfig>> = {
  SNAPPY: { damping: 12, mass: 0.6, stiffness: 180 },
  SETTLE: { damping: 200, mass: 1, stiffness: 120 },
  GLIDE: { damping: 26, mass: 1.1, stiffness: 90 },
  KINETIC: { damping: 15, mass: 0.8, stiffness: 110 },
};


export const SCENES = {
  question: { from: 0, duration: 220 },
  analysis: { from: 190, duration: 320 },
  comparison: { from: 475, duration: 340 },
  verdict: { from: 780, duration: 300 },
  outro: { from: 1050, duration: 210 },
} as const;


export const DATA = {
  brand: "Auto Assist",
  url: "autoassist.ge",

  hook: {
    headline: "შეადარე Copart & IAAI აუქციონი autopapa.ge-ს",
  },
  
  chat: {
    question: "რამდენი დაჯდება აუქციონზე ნაყიდი მანქანის შეკეთება?",
    placeholder: "ჰკითხეთ ამ მანქანების შესახებ...",
    assistant: "AI ასისტენტი",
    time: "07:45 PM",
  },

  
  costStructure: [
    { label: "აუქციონზე შეძენა", pct: 37 },
    { label: "საზღვაო გადაზიდვა", pct: 15 },
    { label: "აქციზი", pct: 14 },
    { label: "დღგ (18%)", pct: 14 },
    { label: "Copart საკომისიო", pct: 9 },
    { label: "პორტის მომსახურება", pct: 4 },
    { label: "ხმელეთის ტრანსპორტი", pct: 3 },
    { label: "დაზღვევა", pct: 2 },
    { label: "საბაჟო / რეგისტრაცია", pct: 2 },
  ],

  importTotal: 21704,
  localTotal: 98813,
  savings: 77109,
  roi: 355.3,
  savingsPct: 78,

  copart: {
    title: "ამერიკული იმპორტი",
    brand: "COPART",
    pros: [
      "დაბალი ფასი - 78% დანაზოგი",
      "მაღალი ROI - 355.3%",
      "AWD წამყვანი სისტემა",
    ],
    cons: [
      "Salvage საბუთი - იურიდიული რისკი",
      "შეკეთების ხარჯი და ვადები",
      "გასაღები არ აქვს",
    ],
  },

  myauto: {
    title: "ადგილობრივი შეძენა",
    brand: "AUTOPAPA",
    pros: [
      "მზა მდგომარეობა, დაუყოვნებლივ",
      "Plug-in Hybrid - ეკონომიური",
      "სუფთა საბუთი და ისტორია",
    ],
    cons: [
      "მაღალი ფასი - 98,813 GEL",
      "გარბენი - 110,000 კმ",
    ],
  },

  params: [
    { label: "გარბენი", left: "არ არის მითითებული", right: "110 000 კმ" },
    { label: "წამყვანი თვლები", left: "AWD (4 წამყვანი)", right: "RWD (უკანა)" },
    { label: "საბუთის ტიპი", left: "SALVAGE (აღდგენადი)", right: "სუფთა საბუთი" },
    { label: "გასაღები", left: "არ აქვს", right: "აქვს" },
    { label: "ძრავის ტიპი", left: "2.0 ბენზინი", right: "2.0 Plug-in Hybrid" },
  ],

  verdict: {
    eyebrow: "საბოლოო ვერდიქტი",
    headline: "იმპორტი ფინანსურად\nუფრო მომგებიანია",
    subtext: "შეძენა · საკომისიო · ტრანსპორტი · განბაჟება · დამატებითი ხარჯები",
    savingsLabel: "პოტენციური ეკონომია",
  },

  outro: {
    tagline: "იპოვე ჭკვიანი გზა შენს მანქანამდე",
    cta: "დაიწყე შედარება",
  },
} as const;


export const gel = new Intl.NumberFormat("ka-GE");


export const redGlow = (size: number, opacity = 0.55): string =>
  `radial-gradient(${size}px ${size}px at 50% 50%, rgba(239,68,68,${opacity}) 0%, rgba(220,38,38,${opacity * 0.5}) 35%, rgba(220,38,38,0) 70%)`;
