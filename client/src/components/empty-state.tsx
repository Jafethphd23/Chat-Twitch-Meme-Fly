import { MessageSquare, Wifi, Languages, ArrowRight } from "lucide-react";
import { SiTwitch } from "react-icons/si";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card border border-border">
          <SiTwitch className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-3">
        Twitch Chat Translator
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Connect to any Twitch channel and watch messages get translated in real-time. 
        Perfect for following international streams!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
        <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-medium text-sm mb-1">1. Connect</h3>
          <p className="text-xs text-muted-foreground text-center">
            Enter a Twitch channel name
          </p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-[hsl(185,100%,50%)]/10 flex items-center justify-center mb-3">
            <Languages className="w-5 h-5 text-[hsl(185,100%,50%)]" />
          </div>
          <h3 className="font-medium text-sm mb-1">2. Choose Language</h3>
          <p className="text-xs text-muted-foreground text-center">
            Select your preferred language
          </p>
        </div>

        <div className="flex flex-col items-center p-4 rounded-lg bg-card/50 border border-border">
          <div className="w-10 h-10 rounded-full bg-[hsl(145,100%,35%)]/10 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-[hsl(145,100%,35%)]" />
          </div>
          <h3 className="font-medium text-sm mb-1">3. Watch Translations</h3>
          <p className="text-xs text-muted-foreground text-center">
            See messages translated live
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-8 text-sm text-muted-foreground">
        <ArrowRight className="w-4 h-4" />
        <span>Enter a channel name above to get started</span>
      </div>
    </div>
  );
}
