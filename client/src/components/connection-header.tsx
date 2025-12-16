import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2, MessageSquare, Globe, Zap } from "lucide-react";
import { supportedLanguages, type ConnectionStatus } from "@shared/schema";
import { SiTwitch } from "react-icons/si";

interface ConnectionHeaderProps {
  status: ConnectionStatus;
  currentChannel: string | null;
  targetLanguage: string;
  onConnect: (channel: string, targetLanguage: string) => void;
  onDisconnect: () => void;
  onLanguageChange: (language: string) => void;
  error: string | null;
}

export function ConnectionHeader({
  status,
  currentChannel,
  targetLanguage,
  onConnect,
  onDisconnect,
  onLanguageChange,
  error,
}: ConnectionHeaderProps) {
  const [channelInput, setChannelInput] = useState("");

  const handleConnect = () => {
    const channel = channelInput.trim().toLowerCase().replace(/^#/, "");
    if (channel) {
      onConnect(channel, targetLanguage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && status !== "connecting") {
      handleConnect();
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case "connected":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(145,100%,35%)] status-glow" />
            <span className="text-sm text-[hsl(145,100%,35%)]">Connected</span>
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
            <span className="text-sm text-primary pulse-glow">Connecting...</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm text-destructive">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">Disconnected</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SiTwitch className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              Chat Translator
            </h1>
          </div>
          <Badge variant="secondary" className="hidden sm:flex gap-1 items-center">
            <Zap className="w-3 h-3" />
            Real-time
          </Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            {status === "connected" ? (
              <>
                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                  <MessageSquare className="w-3 h-3" />
                  #{currentChannel}
                </Badge>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDisconnect}
                  data-testid="button-disconnect"
                >
                  <WifiOff className="w-4 h-4 mr-1.5" />
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <div className="relative flex-1 sm:w-48">
                  <SiTwitch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Channel name..."
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 bg-background border-input focus:ring-2 focus:ring-primary"
                    disabled={status === "connecting"}
                    data-testid="input-channel"
                  />
                </div>
                <Button
                  onClick={handleConnect}
                  disabled={!channelInput.trim() || status === "connecting"}
                  data-testid="button-connect"
                >
                  {status === "connecting" ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4 mr-1.5" />
                  )}
                  Connect
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select
              value={targetLanguage}
              onValueChange={onLanguageChange}
              data-testid="select-language"
            >
              <SelectTrigger className="w-[140px] bg-background" data-testid="select-language-trigger">
                <SelectValue placeholder="Target language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} data-testid={`language-option-${lang.code}`}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {getStatusIndicator()}
        </div>
      </div>

      {error && (
        <div className="px-4 pb-3">
          <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        </div>
      )}
    </header>
  );
}
