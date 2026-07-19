import { cn } from "@/lib/utils"

type AutoAssistLogoIconProps = {
  className?: string
}

export function AutoAssistLogoIcon({ className }: AutoAssistLogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M16 4L4 26H9L16 11.5L23 26H28L16 4Z" fill="currentColor" />
      <path d="M16 10L9 23H13L16 17L19 23H23L16 10Z" fill="#DC2626" />
      <rect x="3" y="19" width="26" height="1.5" fill="white" transform="rotate(-5 16 19.75)" />
    </svg>
  )
}

type AutoAssistWordmarkProps = {
  className?: string
}

export function AutoAssistWordmark({ className }: AutoAssistWordmarkProps) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      <span className="text-foreground">Auto</span>
      <span className="font-semibold text-primary">Assist</span>
    </span>
  )
}
