import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Square, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { BotActivityFeed } from "@/components/bot-activity-feed";
import { supportedLanguages } from "@shared/schema";
import { SiTwitch } from "react-icons/si";

export default function Home() {
  const [channel, setChannel] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedChannel, setConnectedChannel] = useState<string | null>(null);
  const [profanityFilter, setProfanityFilter] = useState(true);

  useEffect(() => {
    checkStatus();
    fetchProfanityFilter();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfanityFilter = async () => {
    try {
      const response = await fetch("/api/settings/profanity-filter");
      const data = await response.json();
      setProfanityFilter(data.enabled);
    } catch (err) {
      console.error("Failed to fetch profanity filter:", err);
    }
  };

  const toggleProfanityFilter = async () => {
    try {
      const response = await fetch("/api/settings/profanity-filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !profanityFilter }),
      });
      const data = await response.json();
      setProfanityFilter(data.enabled);
    } catch (err) {
      console.error("Failed to toggle profanity filter:", err);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/bot/status");
      const data = await response.json();
      setIsConnected(data.connected);
      setConnectedChannel(data.channel);
    } catch (err) {
      console.error("Failed to check status:", err);
    }
  };

  const startBot = async () => {
    if (!channel.trim()) {
      setError("Please enter a channel name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: channel.toLowerCase().replace(/^#/, ""),
          targetLanguage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start bot");
      }

      const data = await response.json();
      setConnectedChannel(data.channel);
      setIsConnected(true);
      setChannel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start bot");
    } finally {
      setIsLoading(false);
    }
  };

  const stopBot = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bot/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to stop bot");
      }

      setIsConnected(false);
      setConnectedChannel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop bot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && !isConnected) {
      startBot();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[hsl(190,70%,90%)] via-[hsl(350,100%,95%)] to-[hsl(340,80%,88%)]">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <SiTwitch className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-semibold text-[hsl(340,50%,35%)]">Meme Translate Bot</h1>
          </div>
          <Badge variant="outline" className="px-3 py-1.5 text-sm bg-white/50">
            {isConnected ? "Active" : "Inactive"}
          </Badge>
        </div>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Bad Words Filter Toggle */}
          <div className="p-4 rounded-xl bg-white/90 border border-pink-200 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-[hsl(340,50%,35%)]">Bad Words</p>
                  <p className="text-xs text-muted-foreground">Block bad words in chat</p>
                </div>
              </div>
              <Switch
                checked={profanityFilter}
                onCheckedChange={toggleProfanityFilter}
                data-testid="switch-profanity-filter"
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white/90 border border-pink-200 shadow-md">
            <div className="flex items-start gap-3 mb-6">
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-[hsl(145,100%,35%)] mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-muted-foreground mt-0.5" />
              )}
              <div>
                <h2 className="font-semibold mb-1">
                  {isConnected ? "Bot is Active" : "Bot is Inactive"}
                </h2>
                {isConnected && connectedChannel ? (
                  <p className="text-sm text-muted-foreground">
                    Running in{" "}
                    <span className="font-medium text-foreground">
                      #{connectedChannel}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start the bot to begin
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Channel Name
                  </label>
                  <Input
                    placeholder="e.g., xqc, shroud"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    data-testid="input-channel"
                    className="bg-background border-input"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Target Language
                  </label>
                  <Select
                    value={targetLanguage}
                    onValueChange={setTargetLanguage}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      className="bg-background border-input"
                      data-testid="select-language"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={startBot}
                  disabled={!channel.trim() || isLoading}
                  size="lg"
                  className="w-full"
                  data-testid="button-start"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Bot
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-pink-100/80 border border-pink-200">
                  <p className="text-sm text-[hsl(340,50%,35%)] mb-2">
                    Bot translating messages in <strong>#{connectedChannel}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Watch the activity feed to see messages
                  </p>
                </div>

                <Button
                  onClick={stopBot}
                  disabled={isLoading}
                  variant="destructive"
                  size="lg"
                  className="w-full"
                  data-testid="button-stop"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Stopping...
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Bot
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="lg:col-span-2 flex flex-col">
          <BotActivityFeed />
        </div>
      </main>

      <footer className="border-t border-pink-200 py-3 px-4 text-center bg-white/60">
        <p className="text-xs text-muted-foreground">
          Created by Ostian for Nagayama Meme
        </p>
      </footer>
    </div>
  );
}
