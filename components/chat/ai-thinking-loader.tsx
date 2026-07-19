"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

const PETAL_PATH =
  "M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z"

type PegtopSvgProps = {
  uid: string
  className?: string
}

function PegtopSvg({ uid, className }: PegtopSvgProps) {
  const shine = `${uid}-shine`
  const mask = `${uid}-mask`
  const g1 = `${uid}-gradient-1`
  const g2 = `${uid}-gradient-2`
  const g3 = `${uid}-gradient-3`
  const g4 = `${uid}-gradient-4`
  const g5 = `${uid}-gradient-5`

  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <filter id={shine}>
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <mask id={mask}>
          <path d={PETAL_PATH} fill="white" />
        </mask>
        <radialGradient
          id={g1}
          cx={50}
          cy={66}
          fx={50}
          fy={66}
          r={30}
          gradientTransform="translate(0 35) scale(1 0.5)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="black" stopOpacity="0.3" />
          <stop offset="50%" stopColor="black" stopOpacity="0.1" />
          <stop offset="100%" stopColor="black" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g2} cx={55} cy={20} fx={55} fy={20} r={30} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="50%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g3} cx={85} cy={50} fx={85} fy={50} href={`#${g2}`} />
        <radialGradient
          id={g4}
          cx={50}
          cy={58}
          fx={50}
          fy={58}
          r={60}
          gradientTransform="translate(0 47) scale(1 0.2)"
          href={`#${g3}`}
        />
        <linearGradient id={g5} x1={50} y1={90} x2={50} y2={10} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="black" stopOpacity="0.2" />
          <stop offset="40%" stopColor="black" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g>
        <path d={PETAL_PATH} className="ai-pegtop-loader__petal" />
        <path d={PETAL_PATH} fill={`url(#${g1})`} />
        <path
          d={PETAL_PATH}
          fill="none"
          stroke="white"
          opacity="0.3"
          strokeWidth={3}
          filter={`url(#${shine})`}
          mask={`url(#${mask})`}
        />
        <path d={PETAL_PATH} fill={`url(#${g2})`} />
        <path d={PETAL_PATH} fill={`url(#${g3})`} />
        <path d={PETAL_PATH} fill={`url(#${g4})`} />
        <path d={PETAL_PATH} fill={`url(#${g5})`} />
      </g>
    </svg>
  )
}

type AiThinkingLoaderProps = {
  className?: string
  size?: "avatar" | "sm" | "md"
}

export function AiThinkingLoader({ className, size = "sm" }: AiThinkingLoaderProps) {
  const baseId = useId().replace(/:/g, "")

  return (
    <div
      className={cn(
        "ai-pegtop-loader",
        size === "avatar" && "ai-pegtop-loader--avatar",
        size === "sm" && "ai-pegtop-loader--sm",
        size === "md" && "ai-pegtop-loader--md",
        className
      )}
      role="status"
      aria-label="პასუხის მომზადება"
    >
      <PegtopSvg uid={`${baseId}-one`} className="ai-pegtop-loader__one" />
      <PegtopSvg uid={`${baseId}-two`} className="ai-pegtop-loader__two" />
      <PegtopSvg uid={`${baseId}-three`} className="ai-pegtop-loader__three" />
    </div>
  )
}
