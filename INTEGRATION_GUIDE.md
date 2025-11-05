# IELTS Speaking Test - Audio-Only Integration Guide

## Overview
This is a simplified, audio-only version of the Google Gemini Live API web console, specifically designed for IELTS speaking practice. All video/screen sharing features have been removed, and the UI has been rebuilt with shadcn/ui components for easy integration into Laravel-ReactJS applications.

## Features ✨
- 🎤 **Audio-only communication** - No video/screen sharing complexity
- 💬 **Text chat interface** - Send text messages alongside voice
- 📊 **Altair chart support** - Visual data representation when needed
- 🎨 **shadcn/ui components** - Modern, accessible, and customizable UI
- 🔧 **Tool functions for conversation logging**:
  - `log_question_start` - Logs when AI starts asking a question
  - `log_question_end` - Logs when AI finishes asking a question
  - `log_ai_response` - Logs AI feedback and responses
- 📝 **Console logging** for all conversation context:
  - User text messages
  - User speech transcriptions
  - AI text responses
  - Grounding search queries

## Tech Stack
- React 18
- TypeScript
- Tailwind CSS v3
- shadcn/ui components
- Google Gemini Live API (@google/genai)
- Lucide React icons

## Project Structure

```
src/
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── textarea.tsx
│   ├── audio-control-tray/          # Audio controls (mic, volume, connect)
│   │   └── AudioControlTray.tsx
│   ├── chat-input/                  # Text message input
│   │   └── ChatInput.tsx
│   └── altair/                      # Chart/graph component
│       └── Altair.tsx
├── contexts/
│   └── LiveAPIContext.tsx           # Gemini Live API context
├── hooks/
│   └── use-live-api.ts              # Main API hook
├── lib/
│   ├── audio-recorder.ts            # Audio recording logic
│   ├── audio-streamer.ts            # Audio playback logic
│   ├── genai-live-client.ts         # API client with logging
│   └── utils-cn.ts                  # Tailwind merge utility
└── App.tsx                          # Main app component
```

## Installation

### 1. Copy Required Files

Copy these directories to your Laravel-React project:

```bash
# Core functionality
src/components/audio-control-tray/
src/components/chat-input/
src/components/altair/
src/components/ui/
src/contexts/
src/hooks/
src/lib/
src/types.ts

# Configuration
tailwind.config.js
postcss.config.js
craco.config.js (if using Create React App)
```

### 2. Install Dependencies

```bash
npm install @google/genai eventemitter3 lodash zustand
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-label
npm install vega vega-embed vega-lite
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
```

### 3. Environment Variables

Create a `.env` file:

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Update Your CSS

Add to your main CSS file (e.g., `index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}
```

## Usage in Your Laravel-React App

### Basic Integration

```tsx
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { Altair } from './components/altair/Altair';
import AudioControlTray from './components/audio-control-tray/AudioControlTray';
import ChatInput from './components/chat-input/ChatInput';

function IELTSSpeakingTest() {
  const apiOptions = {
    apiKey: process.env.REACT_APP_GEMINI_API_KEY || '',
  };

  return (
    <div className="min-h-screen bg-background">
      <LiveAPIProvider options={apiOptions}>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight">
                IELTS Speaking Test
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-powered speaking practice
              </p>
            </div>

            {/* Chart/Graph Display */}
            <Altair />

            {/* Audio Controls */}
            <AudioControlTray />

            {/* Text Input */}
            <ChatInput />
          </div>
        </div>
      </LiveAPIProvider>
    </div>
  );
}
```

### As a Laravel Blade Component

```php
<!-- resources/views/ielts/speaking-test.blade.php -->
@extends('layouts.app')

@section('content')
<div id="ielts-speaking-root"></div>
@endsection

@push('scripts')
<script src="{{ mix('js/ielts-speaking.js') }}"></script>
@endpush
```

## Console Logging

All conversation context is automatically logged to the browser console:

```javascript
👤 USER TEXT: Hello, I want to practice speaking
🎤 USER AUDIO: Speaking...
🎤 USER SPEECH (transcribed): Hello, I want to practice speaking
🔍 GROUNDING SEARCH: IELTS speaking test format
📝 QUESTION START: Let's begin with Part 1. Can you tell me about your hometown?
🤖 AI TEXT: Let's begin with Part 1. Can you tell me about your hometown?
✅ QUESTION END: Let's begin with Part 1. Can you tell me about your hometown?
```

## Customization

### Styling Components

All shadcn/ui components support className prop:

```tsx
<Button className="bg-blue-500 hover:bg-blue-600">
  Custom Button
</Button>

<Card className="shadow-lg border-2">
  <CardContent>Custom Card</CardContent>
</Card>
```

### Modifying System Instructions

Edit `src/components/altair/Altair.tsx`:

```tsx
systemInstruction: {
  parts: [{
    text: 'Your custom AI instructions here...'
  }]
}
```

### Adding More Tool Functions

Add new tool functions in `conversationTools` array in `Altair.tsx`:

```tsx
{
  name: "your_tool_name",
  description: "What your tool does",
  parameters: {
    type: Type.OBJECT,
    properties: {
      param1: {
        type: Type.STRING,
        description: "Parameter description"
      }
    },
    required: ["param1"]
  }
}
```

## Removed Components

The following have been removed for simplification:
- ❌ Video/webcam functionality
- ❌ Screen capture functionality
- ❌ Side panel logger
- ❌ Settings dialog (embedded in Altair component)
- ❌ Audio pulse visualization
- ❌ Material Design icons (replaced with Lucide React)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (requires HTTPS for microphone access)

## Security Notes

⚠️ **Important**: 
- Always use HTTPS in production for microphone access
- Never expose your API key in client-side code
- Consider using a backend proxy for API calls in production

## License

Copyright 2024 Google LLC - Licensed under Apache 2.0

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify microphone permissions
3. Ensure API key is valid
4. Test audio recording in browser settings

---

**Ready for Laravel-React Integration** ✅

