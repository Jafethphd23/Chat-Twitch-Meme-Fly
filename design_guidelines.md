# Twitch Chat Translation Tool - Design Guidelines

## Design Approach
**Reference-Based:** Inspired by Twitch's native chat interface and Google Translate's clean translation displays. Combine Twitch's familiar chat layout with translation-focused dual-pane design.

## Core Design Principles
1. **Chat-First Interface:** Prioritize readability and real-time message flow
2. **Translation Clarity:** Clear visual separation between original and translated content
3. **Twitch Authenticity:** Maintain Twitch's signature dark theme and purple accent system
4. **Minimal Friction:** Quick channel connection and immediate translation feedback

## Color System (User-Specified)
- Primary: `#9146FF` (Twitch purple) - CTAs, active states, primary actions
- Secondary: `#772CE8` (dark purple) - hover states, secondary elements
- Background: `#0E0E10` (Twitch dark) - main background
- Text: `#EFEFF1` (light grey) - primary text
- Accent: `#00F5FF` (cyan) - highlights, links, status indicators
- Success: `#00FA54` (green) - connection status, successful actions

## Typography
**Font Families:** Inter for UI elements, Roboto for chat messages
- Headings: Inter, 600-700 weight
- Body/Chat: Roboto, 400 weight
- UI Elements: Inter, 500 weight
- Usernames: Roboto, 700 weight

**Scale:**
- Chat messages: 14-15px
- Usernames: 13px (bold)
- Timestamps: 11px
- Page title: 24-28px
- Section headers: 18-20px

## Layout System
**Spacing Units:** Tailwind units of 2, 3, 4, 6, 8 for consistency

**Primary Layout:**
- Full-width application container
- Two-column split for original/translated messages (50/50 or 45/55)
- Fixed header with channel input and language selector
- Scrollable chat areas with auto-scroll to latest messages
- Sticky connection controls at top

**Responsive Breakpoints:**
- Desktop (lg): Side-by-side dual columns
- Tablet (md): Stacked columns or tabbed view
- Mobile: Single column with toggle between original/translated

## Component Library

### 1. Header/Connection Bar
- Channel name input field (dark input with purple focus ring)
- Connect/Disconnect button (purple primary)
- Language selector dropdown (dark background, purple accent)
- Connection status indicator (cyan when connected, grey when disconnected)
- Compact layout: h-16, items aligned horizontally

### 2. Chat Message Bubbles
- Container: Dark background (#18181B or similar), subtle border
- Username: Bold, colored (maintain Twitch username colors if possible)
- Timestamp: Small, muted grey text
- Message text: Clean, readable, wrapped properly
- Padding: p-3 to p-4
- Spacing: mb-2 between messages
- Hover state: Slight background lightening

### 3. Translation Pane Header
- Label: "Original Messages" / "Translated Messages"
- Language indicator badge
- Subtle separator line below
- Height: h-12

### 4. Empty States
- "Connect to a Twitch channel to begin" - centered message
- Icon: Twitch logo or chat icon in muted purple
- Brief instructions

### 5. Loading States
- Pulsing purple indicator when connecting
- Shimmer effect on message skeletons
- "Translating..." indicator with cyan accent

### 6. Input Fields
- Dark background (#1F1F23)
- Purple focus ring (ring-2 ring-[#9146FF])
- Light grey placeholder text
- Rounded corners (rounded-md to rounded-lg)

### 7. Dropdowns/Selects
- Dark background matching inputs
- Purple highlight for selected option
- Smooth transitions
- Max height with scroll for long lists

## Interaction Patterns

### Chat Scrolling
- Auto-scroll to newest messages by default
- Pause auto-scroll when user scrolls up
- "New messages" indicator when paused (cyan badge)
- Smooth scroll animation

### Message Flow
- Messages appear with subtle fade-in
- Original and translated messages sync visually (same vertical position)
- Timestamp synchronization between columns

### Connection Flow
1. Enter channel name
2. Select target language
3. Click Connect (button transitions to "Connected" state)
4. Messages begin flowing
5. Disconnect returns to input state

## Visual Enhancements
- Subtle gradient on purple buttons (from #9146FF to #772CE8)
- Glow effect on connection status indicator when active
- Minimal animations - focus on performance
- Chat message badges (subscriber, mod, etc.) if applicable

## Accessibility
- High contrast text (#EFEFF1 on #0E0E10)
- Focus indicators on all interactive elements (purple ring)
- Keyboard navigation for channel input and language selection
- Screen reader labels for status indicators

## Performance Considerations
- Virtual scrolling for chat messages if volume is high
- Message limit (e.g., display last 100 messages)
- Efficient re-rendering of only new messages

## No Images Required
This application is utility-focused with no hero section needed. The interface is purely functional chat display.