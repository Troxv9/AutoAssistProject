"use client"

import { useTranslation } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

export function FlagGe({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn("size-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" fill="#FFFFFF" />
      <rect x="8.5" y="0" width="3" height="20" fill="#E60026" />
      <rect x="0" y="8.5" width="20" height="3" fill="#E60026" />
      {/* Top Left Cross */}
      <g transform="translate(4.5, 4.5)">
        <path d="M-1.5 0h3M0 -1.5v3" stroke="#E60026" strokeWidth="0.8" />
        <path d="M-0.8 -0.8l1.6 1.6M-0.8 0.8l1.6 -1.6" stroke="#E60026" strokeWidth="0.5" />
      </g>
      {/* Top Right Cross */}
      <g transform="translate(15.5, 4.5)">
        <path d="M-1.5 0h3M0 -1.5v3" stroke="#E60026" strokeWidth="0.8" />
        <path d="M-0.8 -0.8l1.6 1.6M-0.8 0.8l1.6 -1.6" stroke="#E60026" strokeWidth="0.5" />
      </g>
      {/* Bottom Left Cross */}
      <g transform="translate(4.5, 15.5)">
        <path d="M-1.5 0h3M0 -1.5v3" stroke="#E60026" strokeWidth="0.8" />
        <path d="M-0.8 -0.8l1.6 1.6M-0.8 0.8l1.6 -1.6" stroke="#E60026" strokeWidth="0.5" />
      </g>
      {/* Bottom Right Cross */}
      <g transform="translate(15.5, 15.5)">
        <path d="M-1.5 0h3M0 -1.5v3" stroke="#E60026" strokeWidth="0.8" />
        <path d="M-0.8 -0.8l1.6 1.6M-0.8 0.8l1.6 -1.6" stroke="#E60026" strokeWidth="0.5" />
      </g>
    </svg>
  )
}

export function FlagUs({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={cn("size-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" fill="#FFFFFF" />
      {/* 9 stripes (5 red, 4 white) */}
      <rect y="0" width="20" height="2.22" fill="#B22234" />
      <rect y="4.44" width="20" height="2.22" fill="#B22234" />
      <rect y="8.89" width="20" height="2.22" fill="#B22234" />
      <rect y="13.33" width="20" height="2.22" fill="#B22234" />
      <rect y="17.78" width="20" height="2.22" fill="#B22234" />
      {/* Blue canton */}
      <rect x="0" y="0" width="10.5" height="11.11" fill="#3C3B6E" />
      {/* Stars definition */}
      <defs>
        <g id="switcher-us-star">
          <polygon points="0,-0.75 0.22,-0.22 0.75,-0.22 0.32,0.09 0.49,0.62 0,0.3 -0.49,0.62 -0.32,0.09 -0.75,-0.22 -0.22,-0.22" fill="#FFFFFF" />
        </g>
      </defs>
      {/* Star placements */}
      <use href="#switcher-us-star" x="3.2" y="3.2" />
      <use href="#switcher-us-star" x="7.3" y="3.2" />
      <use href="#switcher-us-star" x="5.25" y="5.56" />
      <use href="#switcher-us-star" x="3.2" y="7.92" />
      <use href="#switcher-us-star" x="7.3" y="7.92" />
    </svg>
  )
}

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation()

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-0.5 shadow-sm backdrop-blur-[4px]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setLocale("ka")}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
          locale === "ka"
            ? "bg-background text-foreground shadow-sm scale-105"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="size-[18px] overflow-hidden rounded-full border border-black/5 flex-shrink-0 flex items-center justify-center">
          <FlagGe />
        </span>
        <span>ქარ</span>
      </button>

      <button
        type="button"
        onClick={() => setLocale("en")}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer",
          locale === "en"
            ? "bg-background text-foreground shadow-sm scale-105"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span className="size-[18px] overflow-hidden rounded-full border border-black/5 flex-shrink-0 flex items-center justify-center">
          <FlagUs />
        </span>
        <span>EN</span>
      </button>
    </div>
  )
}
