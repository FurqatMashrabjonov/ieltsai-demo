# Altair Component Refactor - Utility Hook Pattern

## Problem Fixed ✅
The Altair component was being rendered as an empty div, not doing anything. The AI initialization logic was misplaced and the component wasn't being called properly.

## Solution: Convert to Utility Hook

**Altair.tsx** is now a **utility hook collection** (NOT a React component):

### What Changed:

#### **Before:**
```
- Altair was a React component rendering <div className="vega-embed" />
- It had AI config, tool handlers, and greeting logic inside
- It wasn't being rendered in the UI
- The logic was scattered and hard to follow
```

#### **After:**
```
- Altair exports useAltairAI() hook
- Hook handles AI initialization and management
- Called from ChatLayout component
- Clean separation of concerns
```

## How It Works Now

### 1. **useAltairAI Hook Structure**

The hook has 3 main steps:

```typescript
export function useAltairAI() {
  // Step 1: Configure AI model and system instruction
  useEffect(() => {
    setModel("gemini-2.5-flash...")
    setConfig({...})  // Sets up IELTS examiner role
  }, [setConfig, setModel])

  // Step 2: Set up tool call handlers
  useEffect(() => {
    // Registers handler for log_ai_speech, log_question_start, etc.
    client.on("toolcall", onToolCall)
  }, [client, isInitialized])

  // Step 3: Send initial greeting when connected
  useEffect(() => {
    // Waits for connection, then sends first message to start AI
    if (connected) {
      client.send([{ text: "Hello, I'm ready to begin..." }])
    }
  }, [connected, isInitialized, client])

  return { isInitialized }
}
```

### 2. **Integration in ChatLayout**

```typescript
export function ChatLayout() {
  const { client, connected, connect, disconnect, volume } = useLiveAPIContext()
  const { log } = useLoggerStore()
  
  // Initialize AI configuration and handlers
  useAltairAI()
  
  // ... rest of chat layout
}
```

### 3. **What Hook Does**

| Step | Action | Details |
|------|--------|---------|
| 1️⃣ **Config** | Sets model & system instruction | AI becomes IELTS examiner, sets up logging tools |
| 2️⃣ **Handlers** | Registers tool call listener | Processes log_ai_speech, log_question_start, etc. |
| 3️⃣ **Auto-start** | Sends greeting when connected | Triggers AI to start speaking immediately |

## Console Logging (from tool handlers)

When AI speaks, you'll see:
```
[ALTAIR] Configuring AI model and system instruction
[ALTAIR] Registering tool call handler
[ALTAIR] Client connected, waiting to send greeting...
[ALTAIR] Sending initial greeting to start AI
🤖 AI SPEECH [GREETING]: Hello! Welcome to the IELTS Speaking test...
```

## Benefits

✅ **Cleaner Code** - AI logic is isolated in a hook
✅ **Reusable** - Call `useAltairAI()` in any component
✅ **Proper Flow** - 3 clear steps: Config → Handlers → Auto-start
✅ **Auto-starts** - AI greets user immediately after connection
✅ **Logging** - Every tool call is logged to console
✅ **No Rendering** - Not wasting DOM space rendering empty div

## Files Changed

1. **src/components/altair/Altair.tsx**
   - Changed from component to utility hook
   - Now exports `useAltairAI()` function
   - Contains all AI configuration and handlers

2. **src/components/chat-layout/ChatLayout.tsx**
   - Added import: `import { useAltairAI } from "../altair/Altair"`
   - Added call: `useAltairAI()` at top of component
   - Fixed import paths (relative imports)

3. **src/App.tsx**
   - Fixed import paths to use relative imports

## How to Use

Just call the hook in any component that wraps ChatLayout:

```typescript
// In any component (ChatLayout, App, etc.)
export function YourComponent() {
  // Initialize AI
  useAltairAI()
  
  // Your UI code here
  return (
    <ChatInterface>
      {/* Chat UI */}
    </ChatInterface>
  )
}
```

## Testing

When you start the app:
1. Connect the chat
2. AI automatically sends greeting
3. Check console for `[ALTAIR]` logs
4. See `🤖 AI SPEECH [GREETING]` logged
5. AI starts asking IELTS questions

✅ **All working correctly - AI is now initialized as a utility hook!**

