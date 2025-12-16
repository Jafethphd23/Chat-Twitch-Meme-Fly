import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatMessageSkeleton } from "./chat-message";
import { MessageSquare, Languages, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatPanelProps {
  title: string;
  messages: ChatMessageType[];
  showTranslation?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  icon?: "original" | "translated";
}

export function ChatPanel({
  title,
  messages,
  showTranslation = false,
  isLoading = false,
  emptyMessage = "No messages yet",
  icon = "original",
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  useEffect(() => {
    if (isNearBottomRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    isNearBottomRef.current = isNearBottom;
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isNearBottomRef.current = true;
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-2">
          {icon === "original" ? (
            <MessageSquare className="w-4 h-4 text-primary" />
          ) : (
            <Languages className="w-4 h-4 text-[hsl(185,100%,50%)]" />
          )}
          <h2 className="font-medium text-sm">{title}</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {messages.length} messages
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <ScrollArea
          className="h-full chat-scrollbar"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div className="p-3 space-y-2">
            {isLoading && messages.length === 0 ? (
              <>
                <ChatMessageSkeleton />
                <ChatMessageSkeleton />
                <ChatMessageSkeleton />
              </>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {icon === "original" ? (
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                ) : (
                  <Languages className="w-12 h-12 text-muted-foreground/30 mb-3" />
                )}
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  showTranslation={showTranslation}
                />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {messages.length > 5 && !isNearBottomRef.current && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lg"
            onClick={scrollToBottom}
            data-testid="button-scroll-bottom"
          >
            <ArrowDown className="w-4 h-4 mr-1" />
            New messages
          </Button>
        )}
      </div>
    </div>
  );
}
