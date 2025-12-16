import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessageType;
  showTranslation?: boolean;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getUsernameColor(color: string | null): string {
  if (!color) {
    // Generate a consistent color based on the default
    return "#9146FF";
  }
  return color;
}

export function ChatMessage({ message, showTranslation = false }: ChatMessageProps) {
  const usernameColor = getUsernameColor(message.color);
  const hasTranslation = message.translatedMessage && message.translatedMessage !== message.message;
  const isTranslating = message.detectedLanguage === null && !message.translatedMessage;

  return (
    <div
      className="group p-3 rounded-lg bg-card/50 hover-elevate message-animate border border-transparent hover:border-border/50 transition-colors"
      data-testid={`chat-message-${message.id}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="font-bold text-sm truncate"
              style={{ color: usernameColor }}
              data-testid={`username-${message.id}`}
            >
              {message.displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            {message.detectedLanguage && (
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0 h-5 gap-1"
                data-testid={`language-badge-${message.id}`}
              >
                <Languages className="w-3 h-3" />
                {message.detectedLanguage.toUpperCase()}
              </Badge>
            )}
          </div>

          {showTranslation ? (
            <div className="space-y-2">
              {hasTranslation ? (
                <>
                  <p 
                    className="text-sm text-foreground leading-relaxed break-words"
                    data-testid={`translated-text-${message.id}`}
                  >
                    {message.translatedMessage}
                  </p>
                  <p 
                    className="text-xs text-muted-foreground italic break-words"
                    data-testid={`original-text-small-${message.id}`}
                  >
                    Original: {message.message}
                  </p>
                </>
              ) : isTranslating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/30 animate-pulse" />
                  <span className="text-sm text-muted-foreground">Translating...</span>
                </div>
              ) : (
                <p 
                  className="text-sm text-foreground leading-relaxed break-words"
                  data-testid={`message-text-${message.id}`}
                >
                  {message.message}
                </p>
              )}
            </div>
          ) : (
            <p 
              className="text-sm text-foreground leading-relaxed break-words"
              data-testid={`original-message-${message.id}`}
            >
              {message.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="p-3 rounded-lg bg-card/50 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted/50 rounded" />
          </div>
          <div className="h-4 w-full bg-muted/70 rounded" />
          <div className="h-4 w-3/4 bg-muted/50 rounded mt-1" />
        </div>
      </div>
    </div>
  );
}
