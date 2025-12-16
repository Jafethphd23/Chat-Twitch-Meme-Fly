import tmi from "tmi.js";
import { translateMessage } from "./translate";
import { chatWithAI } from "./chat";

interface BotConfig {
  channel: string;
  targetLanguage: string;
}

type EventCallback = (event: BotEvent) => void;

export interface BotEvent {
  type: "connected" | "message_received" | "translating" | "message_sent" | "error";
  timestamp: number;
  data: any;
}

function limpiarMensaje(msg: string, tags: tmi.ChatUserstate): string {
  if (!tags.emotes) return msg;

  let copia = msg;

  Object.values(tags.emotes).forEach(rangos => {
    rangos.forEach(rango => {
      const [inicio, fin] = rango.split('-').map(Number);
      const texto = msg.substring(inicio, fin + 1);
      copia = copia.replace(texto, '');
    });
  });

  return copia.replace(/\s+/g, ' ').trim();
}

export class TwitchBot {
  private client: tmi.Client | null = null;
  private config: BotConfig | null = null;
  private messageQueue: Array<{ text: string; user: string }> = [];
  private isProcessing = false;
  private eventCallbacks: EventCallback[] = [];
  private translationEnabled = false;

  onEvent(callback: EventCallback) {
    this.eventCallbacks.push(callback);
  }

  private emitEvent(event: BotEvent) {
    this.eventCallbacks.forEach(cb => cb(event));
  }

  async start(config: BotConfig): Promise<void> {
    this.config = config;

    const botUsername = process.env.TWITCH_BOT_USERNAME;
    const accessToken = process.env.TWITCH_ACCESS_TOKEN;

    console.log(`[BOT] Starting bot as ${botUsername} for channel #${config.channel}`);
    console.log(`[BOT] Target language: ${config.targetLanguage}`);

    if (!botUsername || !accessToken) {
      throw new Error("Missing TWITCH_BOT_USERNAME or TWITCH_ACCESS_TOKEN");
    }

    this.client = new tmi.Client({
      options: { debug: true },
      identity: {
        username: botUsername,
        password: `oauth:${accessToken}`,
      },
      channels: [config.channel],
    });

    this.client.on("message", async (channel, tags, message, self) => {
      if (self) {
        console.log(`[SELF] Ignoring own message: ${message}`);
        return;
      }

      // Skip gift/sub messages from Twitch
      if (tags["msg-id"] && (tags["msg-id"].includes("sub") || tags["msg-id"].includes("gift"))) {
        console.log(`[SKIP] Gift/Sub message ignored: ${message}`);
        return;
      }

      // Handle !ton command to start translation
      if (message.trim() === "!ton") {
        console.log(`[COMMAND] !ton - Starting translation`);
        this.translationEnabled = true;
        this.emitEvent({
          type: "connected",
          timestamp: Date.now(),
          data: {
            channel: config.channel,
            language: config.targetLanguage,
          },
        });
        return;
      }

      // Handle !toff command to stop translation
      if (message.trim() === "!toff") {
        console.log(`[COMMAND] !toff - Stopping translation`);
        this.translationEnabled = false;
        this.emitEvent({
          type: "error",
          timestamp: Date.now(),
          data: {
            error: "Translation stopped",
          },
        });
        return;
      }

      // Handle !chibi command for chat
      const lowerMessage = message.trim().toLowerCase();
      if (lowerMessage === "!chibi" || lowerMessage.startsWith("!chibi ") || lowerMessage.startsWith("!chibi?") || lowerMessage.startsWith("!chibi,")) {
        const question = message.substring(6).trim().replace(/^[?,\s]+/, '');
        const user = tags["display-name"] || tags.username || "User";
        
        if (question.length === 0) {
          if (this.client && this.config) {
            await this.client.say(this.config.channel, `@${user} Escribe algo después de !chibi para preguntarme`);
          }
          return;
        }
        
        console.log(`[COMMAND] !chibi - Chat question: ${question}`);
        
        try {
          const response = await chatWithAI(question);
          if (this.client && this.config) {
            if (response) {
              const outMessage = `@${user} ${response}`;
              console.log(`[CHAT RESPONSE] ${outMessage}`);
              await this.client.say(this.config.channel, outMessage);
              
              this.emitEvent({
                type: "message_sent",
                timestamp: Date.now(),
                data: {
                  user,
                  original: question,
                  translated: response,
                  language: "chat",
                },
              });
            } else {
              await this.client.say(this.config.channel, `@${user} No puedo responder a eso`);
            }
          }
        } catch (err) {
          console.error("[CHAT ERROR]", err);
        }
        return;
      }

      // Skip other commands
      if (message.startsWith("!")) {
        console.log(`[SKIP] Other command message ignored: ${message}`);
        return;
      }

      // Skip if translation is not enabled
      if (!this.translationEnabled) {
        console.log(`[SKIP] Translation disabled: ${message}`);
        return;
      }

      // Clean emotes from message
      const cleanedMessage = limpiarMensaje(message, tags);
      
      if (cleanedMessage.length < 2) {
        console.log(`[SKIP] Message too short after cleaning: ${cleanedMessage}`);
        return;
      }

      const user = tags["display-name"] || tags.username || "User";
      
      // Skip messages that look like bot translations (format: "user: translated text")
      const botUsername = process.env.TWITCH_BOT_USERNAME?.toLowerCase();
      if (botUsername && tags.username?.toLowerCase() === botUsername) {
        console.log(`[SKIP] Bot's own message: ${cleanedMessage}`);
        return;
      }
      
      console.log(`[MESSAGE RECEIVED] ${user}: ${cleanedMessage}`);

      this.emitEvent({
        type: "message_received",
        timestamp: Date.now(),
        data: {
          user,
          message: cleanedMessage,
          channel: config.channel,
        },
      });

      this.messageQueue.push({
        text: cleanedMessage,
        user,
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });

    this.client.on("connected", (addr, port) => {
      console.log(`[BOT] Connected to ${addr}:${port}`);
      this.emitEvent({
        type: "connected",
        timestamp: Date.now(),
        data: {
          channel: config.channel,
          language: config.targetLanguage,
        },
      });

      if (this.client) {
        const message = `🤖 TranslateBot is live! Messages will be translated to ${config.targetLanguage}`;
        console.log(`[BOT] Sending connection message`);
        this.client.say(config.channel, message).catch(err => {
          console.error("[BOT] Failed to send connection message:", err);
        });
      }
    });

    this.client.on("logon", () => {
      console.log(`[BOT] Bot logged in successfully as ${process.env.TWITCH_BOT_USERNAME}`);
    });

    this.client.on("disconnected", (reason) => {
      console.log(`[BOT] Disconnected: ${reason}`);
    });

    try {
      console.log("[BOT] Attempting to connect...");
      await this.client.connect();
      console.log("[BOT] Connect promise resolved");
    } catch (error) {
      console.error("[BOT] Failed to connect:", error);
      this.emitEvent({
        type: "error",
        timestamp: Date.now(),
        data: {
          error: error instanceof Error ? error.message : "Failed to connect",
        },
      });
      throw error;
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0 || !this.client || !this.config) {
      return;
    }

    this.isProcessing = true;
    console.log(`[QUEUE] Processing ${this.messageQueue.length} message(s)`);

    while (this.messageQueue.length > 0) {
      const { text, user } = this.messageQueue.shift()!;

      try {
        this.emitEvent({
          type: "translating",
          timestamp: Date.now(),
          data: {
            user,
            message: text,
          },
        });

        const translation = await translateMessage(text, this.config.targetLanguage);

        if (translation.isTranslated && translation.translatedText.trim().length > 0) {
          const outMessage = `${user}: ${translation.translatedText}`;
          console.log(`[POSTING] ${outMessage}`);

          try {
            if (!this.client) {
              throw new Error("Client is not connected");
            }
            await this.client.say(this.config.channel, outMessage);
            console.log(`[POSTED] Message sent successfully`);

            this.emitEvent({
              type: "message_sent",
              timestamp: Date.now(),
              data: {
                user,
                original: text,
                translated: translation.translatedText,
                language: translation.detectedLanguage,
              },
            });
          } catch (postError: any) {
            console.error(`[POST ERROR] Failed to post message:`, postError);
            this.emitEvent({
              type: "error",
              timestamp: Date.now(),
              data: {
                error: postError?.message || "Failed to post message",
              },
            });
          }
        } else {
          console.log(`[SKIP] Message already in target language: ${text}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ERROR] Translation processing error:`, error);
        this.emitEvent({
          type: "error",
          timestamp: Date.now(),
          data: {
            error: error instanceof Error ? error.message : "Translation error",
          },
        });
      }
    }

    this.isProcessing = false;
    console.log(`[QUEUE] Queue processing complete`);
  }

  async stop(): Promise<void> {
    console.log("[BOT] Stopping bot...");
    if (this.client) {
      try {
        await this.client.disconnect();
        this.client = null;
        console.log("[BOT] Bot stopped");
      } catch (error) {
        console.error("[BOT] Error disconnecting:", error);
      }
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getConnectedChannel(): string | null {
    return this.config?.channel || null;
  }
}
