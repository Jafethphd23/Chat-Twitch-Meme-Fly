import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Languages,
  Send,
  AlertCircle,
  Plug,
  CheckCircle2,
} from "lucide-react";

interface Activity {
  id: string;
  type: "connected" | "message_received" | "translating" | "message_sent" | "error";
  timestamp: number;
  data: any;
}

export function BotActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host || "localhost:5000";
      const wsUrl = `${protocol}//${host}/ws`;

      console.log("Connecting WebSocket to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to bot activity feed");
    };

    ws.onmessage = (event) => {
      try {
        const botEvent = JSON.parse(event.data);
        const activity: Activity = {
          id: `${botEvent.timestamp}-${Math.random()}`,
          type: botEvent.type,
          timestamp: botEvent.timestamp,
          data: botEvent.data,
        };

        setActivities((prev) => {
          const updated = [activity, ...prev];
          return updated.slice(0, 100); // Keep last 100 activities
        });
      } catch (err) {
        console.error("Failed to parse bot event:", err);
      }
    };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "connected":
        return <Plug className="w-4 h-4 text-[hsl(145,100%,35%)]" />;
      case "message_received":
        return <MessageCircle className="w-4 h-4 text-primary" />;
      case "translating":
        return <Languages className="w-4 h-4 text-[hsl(185,100%,50%)]" />;
      case "message_sent":
        return <Send className="w-4 h-4 text-[hsl(145,100%,35%)]" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getLabel = (type: Activity["type"]) => {
    switch (type) {
      case "connected":
        return "Connected";
      case "message_received":
        return "Message Received";
      case "translating":
        return "Translating...";
      case "message_sent":
        return "Message Sent";
      case "error":
        return "Error";
    }
  };

  const getVariant = (
    type: Activity["type"]
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "connected":
        return "default";
      case "message_received":
        return "secondary";
      case "translating":
        return "outline";
      case "message_sent":
        return "default";
      case "error":
        return "destructive";
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderActivityDetails = (activity: Activity) => {
    switch (activity.type) {
      case "connected":
        return (
          <p className="text-sm text-muted-foreground">
            Connected to #{activity.data.channel} • Translating to{" "}
            <span className="font-medium">{activity.data.language}</span>
          </p>
        );
      case "message_received":
        return (
          <div className="text-sm">
            <p className="font-medium">{activity.data.user}</p>
            <p className="text-muted-foreground break-words">
              {activity.data.message}
            </p>
          </div>
        );
      case "translating":
        return (
          <div className="text-sm">
            <p className="font-medium">{activity.data.user}</p>
            <p className="text-muted-foreground text-xs">Translating...</p>
          </div>
        );
      case "message_sent":
        return (
          <div className="text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium">{activity.data.user}</span> (
              {activity.data.language.toUpperCase()})
            </p>
            <p className="text-foreground break-words">
              {activity.data.translated}
            </p>
          </div>
        );
      case "error":
        return (
          <p className="text-sm text-destructive">{activity.data.error}</p>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/90 rounded-xl border border-pink-200 shadow-md">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-pink-200 bg-pink-50/50">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <h2 className="font-medium text-sm text-[hsl(340,50%,35%)]">Bot Activity</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {activities.length} events
        </span>
      </div>

      <ScrollArea className="flex-1 chat-scrollbar" ref={scrollRef}>
        <div className="p-3 space-y-2">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageCircle className="w-8 h-8 text-pink-300 mb-2" />
              <p className="text-xs text-muted-foreground">
                No bot activity yet
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 rounded-lg bg-pink-50/50 border border-pink-100 hover-elevate transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{getIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={getVariant(activity.type)}
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {getLabel(activity.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm">
                      {renderActivityDetails(activity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
