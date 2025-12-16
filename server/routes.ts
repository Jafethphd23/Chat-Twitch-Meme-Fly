import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { TwitchBot, type BotEvent } from "./bot";
import { setProfanityFilter, isProfanityFilterEnabled } from "./chat";

let botInstance: TwitchBot | null = null;
const wsClients: Set<WebSocket> = new Set();

function broadcastBotEvent(event: BotEvent) {
  const message = JSON.stringify(event);
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    wsClients.add(ws);
    console.log("Dashboard client connected");

    ws.on("close", () => {
      wsClients.delete(ws);
      console.log("Dashboard client disconnected");
    });
  });

  // API endpoint to start the bot
  app.post("/api/bot/start", async (req, res) => {
    try {
      const { channel, targetLanguage } = req.body;

      if (!channel || !targetLanguage) {
        return res.status(400).json({ error: "Missing channel or targetLanguage" });
      }

      if (botInstance) {
        await botInstance.stop();
      }

      botInstance = new TwitchBot();
      
      // Set up event listener
      botInstance.onEvent((event) => {
        broadcastBotEvent(event);
      });
      
      await botInstance.start({ channel, targetLanguage });

      return res.json({
        success: true,
        message: `Bot connected to #${channel}`,
        channel,
        language: targetLanguage,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start bot";
      console.error("Bot start error:", error);
      return res.status(500).json({ error: errorMessage });
    }
  });

  // API endpoint to stop the bot
  app.post("/api/bot/stop", async (req, res) => {
    try {
      if (!botInstance) {
        return res.status(400).json({ error: "Bot is not running" });
      }

      await botInstance.stop();
      botInstance = null;

      return res.json({ success: true, message: "Bot stopped" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stop bot";
      return res.status(500).json({ error: errorMessage });
    }
  });

  // API endpoint to get bot status
  app.get("/api/bot/status", (req, res) => {
    const isConnected = botInstance?.isConnected() || false;
    const channel = botInstance?.getConnectedChannel();

    return res.json({
      connected: isConnected,
      channel,
    });
  });

  // API endpoint to get profanity filter status
  app.get("/api/settings/profanity-filter", (req, res) => {
    return res.json({
      enabled: isProfanityFilterEnabled(),
    });
  });

  // API endpoint to toggle profanity filter
  app.post("/api/settings/profanity-filter", (req, res) => {
    const { enabled } = req.body;
    
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }
    
    setProfanityFilter(enabled);
    console.log(`[SETTINGS] Profanity filter ${enabled ? "enabled" : "disabled"}`);
    
    return res.json({
      success: true,
      enabled: isProfanityFilterEnabled(),
    });
  });

  return httpServer;
}
