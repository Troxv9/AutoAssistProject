import { AutoAssistLogoIcon } from "@/components/auto-assist-brand"
import { cn } from "@/lib/utils"
import { AiThinkingLoader } from "./ai-thinking-loader"

type ChatAssistantAvatarProps = {
  thinking?: boolean
  className?: string
}

export function ChatAssistantAvatar({ thinking = false, className }: ChatAssistantAvatarProps) {
  return (
    <span
      className={cn(
        "relative mt-0.5 flex size-7 shrink-0 items-center justify-center overflow-visible",
        className
      )}
    >
      {thinking ? (
        <>
          <AiThinkingLoader size="avatar" />
          <span className="sr-only">ასისტენტი ფიქრობს</span>
        </>
      ) : (
        <span
          className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-foreground"
          aria-hidden="true"
        >
          <AutoAssistLogoIcon className="size-4" />
        </span>
      )}
    </span>
  )
}
