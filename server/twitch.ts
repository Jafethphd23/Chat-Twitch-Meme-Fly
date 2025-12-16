import tmi from "tmi.js";
import { randomUUID } from "crypto";
import type { ChatMessage } from "@shared/schema";

export interface TwitchMessage {
  id: string;
  username: string;
  displayName: string;
  message: string;
  timestamp: number;
  color: string | null;
  badges: Record<string, string | undefined>;
}

export type MessageCallback = (message: TwitchMessage) => void;

export class TwitchClient {
  private client: tmi.Client | null = null;
  private currentChannel: string | null = null;
  private messageCallback: MessageCallback | null = null;
  private connectionCallback: ((connected: boolean, error?: string) => void) | null = null;

  constructor() {}

  setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
  }

  setConnectionCallback(callback: (connected: boolean, error?: string) => void) {
    this.connectionCallback = callback;
  }

  async connect(channel: string): Promise<void> {
    // Disconnect from any existing channel
    await this.disconnect();

    const channelName = channel.toLowerCase().replace(/^#/, "");

    this.client = new tmi.Client({
      options: { debug: false },
      connection: {
        secure: true,
        reconnect: true,
      },
      channels: [channelName],
    });

    this.client.on("message", (channel, tags, message, self) => {
      if (self) return; // Ignore messages from the bot itself

      const twitchMessage: TwitchMessage = {
        id: tags.id || randomUUID(),
        username: tags.username || "anonymous",
        displayName: tags["display-name"] || tags.username || "Anonymous",
        message: message,
        timestamp: Date.now(),
        color: tags.color || null,
        badges: tags.badges || {},
      };

      if (this.messageCallback) {
        this.messageCallback(twitchMessage);
      }
    });

    this.client.on("connected", () => {
      this.currentChannel = channelName;
      if (this.connectionCallback) {
        this.connectionCallback(true);
      }
    });

    this.client.on("disconnected", (reason) => {
      this.currentChannel = null;
      if (this.connectionCallback) {
        this.connectionCallback(false, reason);
      }
    });

    try {
      await this.client.connect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect to Twitch";
      if (this.connectionCallback) {
        this.connectionCallback(false, errorMessage);
      }
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
      this.client = null;
      this.currentChannel = null;
    }
  }

  getCurrentChannel(): string | null {
    return this.currentChannel;
  }

  isConnected(): boolean {
    return this.client !== null && this.currentChannel !== null;
  }
}
