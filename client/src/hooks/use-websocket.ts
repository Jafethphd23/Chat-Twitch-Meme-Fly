import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatMessage, ConnectionStatus, WSMessage } from "@shared/schema";

interface UseWebSocketReturn {
  messages: ChatMessage[];
  status: ConnectionStatus;
  currentChannel: string | null;
  error: string | null;
  connect: (channel: string, targetLanguage: string) => void;
  disconnect: () => void;
  setTargetLanguage: (language: string) => void;
  clearMessages: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const connect = useCallback((channel: string, targetLanguage: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "connect", channel, targetLanguage };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "disconnect" };
      wsRef.current.send(JSON.stringify(message));
    }
    setCurrentChannel(null);
    setStatus("disconnected");
  }, []);

  const setTargetLanguage = useCallback((targetLanguage: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WSMessage = { type: "setLanguage", targetLanguage };
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const createWebSocket = () => {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setError(null);
        reconnectAttempts.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSMessage;
          
          switch (data.type) {
            case "chatMessage":
              setMessages((prev) => {
                // Check if message already exists (update case)
                const existingIndex = prev.findIndex(m => m.id === data.message.id);
                if (existingIndex !== -1) {
                  // Update existing message with translation
                  const updated = [...prev];
                  updated[existingIndex] = data.message;
                  return updated;
                }
                
                // Add new message
                const newMessages = [...prev, data.message];
                // Keep only last 200 messages for performance
                if (newMessages.length > 200) {
                  return newMessages.slice(-200);
                }
                return newMessages;
              });
              break;
            case "status":
              setStatus(data.status);
              if (data.channel) {
                setCurrentChannel(data.channel);
              }
              if (data.error) {
                setError(data.error);
              } else {
                setError(null);
              }
              break;
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        // Only set to disconnected if we were connected to a channel
        if (currentChannel) {
          setStatus("disconnected");
        }
        
        // Exponential backoff for reconnection
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          createWebSocket();
        }, delay);
      };

      socket.onerror = () => {
        setError("WebSocket connection error");
      };
    };

    createWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    messages,
    status,
    currentChannel,
    error,
    connect,
    disconnect,
    setTargetLanguage,
    clearMessages,
  };
}
