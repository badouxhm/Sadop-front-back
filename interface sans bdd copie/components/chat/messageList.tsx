"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "@/components/types"


interface MessageListProps {
  messages: Message[]
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, scrollRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
              msg.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            <Avatar className={cn("w-8 h-8 ring-1 ring-white/10", msg.role === "assistant" ? "bg-primary/20" : "")}>
              {msg.role === "assistant" ? (
                <div className="bg-primary/20 w-full h-full flex items-center justify-center">
                  <img src="/logo2.png" alt="AI Logo" className="h-6 w-flex"/>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  U.
                </div>
              )}
            </Avatar>
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                ? "bg-white text-black font-medium"
                : "bg-black/10 text-white/90 border border-white/10"

              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </div>
  )
}
