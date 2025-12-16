# Twitch Chat Translator Bot - Chibi

## Overview

A Twitch chat bot for Nagayama Meme (ながやまめめ) channel that provides:
- Real-time translation of chat messages using OpenAI gpt-4.1-mini
- ChatGPT-powered chat assistant (!chibi command) with kawaii personality
- Multi-language profanity filtering with toggle control
- Protection against AI/programming topic discussions

**Creator**: ostian
**Channel**: https://www.twitch.tv/nagayama_meme

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: Shadcn/ui components built on Radix UI primitives, providing accessible and customizable UI elements.

**Styling Approach**: Tailwind CSS with a custom Twitch-inspired dark theme:
- Primary: #9146FF (Twitch purple)
- Secondary: #772CE8 (dark purple)
- Background: #0E0E10 (Twitch dark)
- Text: #EFEFF1 (light grey)
- Accent: #00F5FF (cyan)
- Success: #00FA54 (green)

**State Management**: 
- React hooks for local component state
- Custom WebSocket hook (`useWebSocket`) for real-time chat communication
- Message deduplication by ID for proper original/translated pairing

**Key Components**:
- `ConnectionHeader`: Channel input, language selector, connection status
- `ChatPanel`: Scrollable message display with auto-scroll
- `ChatMessage`: Individual message bubbles with username, timestamp, translation
- `EmptyState`: Instructions when not connected

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript.

**Real-time Communication**: WebSocket server using the `ws` library at `/ws` path:
- Channel connection/disconnection commands
- Target language selection
- Streaming chat messages with translations
- Connection status updates

**Twitch Integration**: TMI.js for anonymous read-only Twitch IRC chat connection

**Translation Service**: OpenAI gpt-4.1-mini API
- Automatic language detection
- Supports 20+ languages
- Caching for repeated messages

### Chat Assistant (!chibi command)

The bot includes a chat assistant accessible via the !chibi command:
- Kawaii personality designed for the Nagayama Meme community
- Responds in the same language as the user
- Protected against revealing AI-related information
- Cannot discuss programming or technical topics
- Protects streamer's reputation

### Content Filters

**Profanity Filter** (toggleable via UI):
- Multi-language support: English, Spanish, Japanese, Russian, Korean, Chinese
- Applies to both translations and chat responses

**AI/Tech Word Filter** (always active):
- Blocks mentions of ChatGPT, OpenAI, GPT, AI, and similar terms in all languages
- Blocks programming-related discussions

**Protected Information**:
- Never reveals personal information about the streamer
- Never discusses how the bot works technically
- Creator credit: ostian

### Data Flow

1. Client connects via WebSocket and sends channel/language preferences
2. Server creates a TMI.js client instance per connection
3. Twitch messages are received from IRC
4. Messages are translated via OpenAI API with caching
5. !chibi commands are processed separately through the chat assistant
6. Full messages (with translation) are forwarded to client
7. Frontend displays in two synchronized columns

### External Dependencies

**Twitch Integration**: 
- TMI.js library for connecting to Twitch IRC chat
- Authenticated connection for sending messages (TWITCH_USERNAME, TWITCH_OAUTH_TOKEN)

**OpenAI Integration**:
- gpt-4.1-mini model for translations and chat responses
- Environment variable: OPENAI_API_KEY

### Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Thai, Vietnamese, Dutch, Polish, Turkish, Swedish, Danish, Norwegian

### Streamer Info

**Nagayama Meme** (ながやまめめ) - 2.5D streamer who creates gaming and music content
- Plays: Valorant, Apex, Disney games, Pokémon
- Music: Guitar, singing
- SNS:
  - Twitch: twitch.tv/nagayama_meme
  - YouTube: youtube.com/@nagayama_meme
  - Linktree: linktr.ee/nagayama_meme
