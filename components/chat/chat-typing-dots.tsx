export function ChatTypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5" role="status" aria-label="პასუხის მომზადება">
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" />
    </div>
  )
}
