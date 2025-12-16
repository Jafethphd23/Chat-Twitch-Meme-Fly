import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string(),
  message: z.string(),
  translatedMessage: z.string().nullable(),
  detectedLanguage: z.string().nullable(),
  targetLanguage: z.string(),
  timestamp: z.number(),
  color: z.string().nullable(),
  badges: z.record(z.string().optional()).optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const connectionStatusSchema = z.enum(["disconnected", "connecting", "connected", "error"]);
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;

export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("connect"),
    channel: z.string(),
    targetLanguage: z.string(),
  }),
  z.object({
    type: z.literal("disconnect"),
  }),
  z.object({
    type: z.literal("setLanguage"),
    targetLanguage: z.string(),
  }),
  z.object({
    type: z.literal("chatMessage"),
    message: chatMessageSchema,
  }),
  z.object({
    type: z.literal("status"),
    status: connectionStatusSchema,
    channel: z.string().optional(),
    error: z.string().optional(),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

export const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "no", name: "Norwegian" },
] as const;

export type LanguageCode = typeof supportedLanguages[number]["code"];
