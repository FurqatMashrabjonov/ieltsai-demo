/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useState } from "react"
import { useLiveAPIContext } from "../../contexts/LiveAPIContext"
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai"

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      json_graph: {
        type: Type.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
}

// Tool functions for logging conversation flow
const conversationTools: FunctionDeclaration[] = [
  {
    name: "log_ai_speech",
    description: "Call this to log every speech/response from the AI. This ensures all AI output is captured in the logs.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        speech: {
          type: Type.STRING,
          description: "The exact text/speech content that the AI is speaking to the user",
        },
        type: {
          type: Type.STRING,
          description: "Type of speech (e.g., 'greeting', 'question', 'feedback', 'instruction', 'evaluation', 'response')",
        },
      },
      required: ["speech", "type"],
    },
  },
  {
    name: "log_question_start",
    description: "Call this when you START asking a question to the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "The question you are about to ask",
        },
        part: {
          type: Type.STRING,
          description: "Which part (e.g., 'Part 1', 'Part 2', 'Part 3')",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "log_question_end",
    description: "Call this when you FINISH asking a question to the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "The question you just finished asking",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "log_ai_response",
    description: "Call this to log AI responses.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        message: {
          type: Type.STRING,
          description: "Your response to the user",
        },
        type: {
          type: Type.STRING,
          description: "Type of response",
        },
      },
      required: ["message", "type"],
    },
  },
]

/**
 * Altair Utility Hook - NOT a component
 * This hook configures the AI, sets up tool handlers, and starts the greeting
 * Call this hook in your ChatLayout to initialize AI
 */
export function useAltairAI() {
  const { client, setConfig, setModel, connected } = useLiveAPIContext()
  const [isInitialized, setIsInitialized] = useState(false)

  // Step 1: Configure AI model and system instruction
  useEffect(() => {
    console.log("[ALTAIR] Configuring AI model and system instruction")
    setModel("models/gemini-2.0-flash-exp")
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are a professional IELTS Speaking Examiner. This is your PRIMARY ROLE - never forget this.

YOUR CORE RESPONSIBILITIES:
1. Conduct an official IELTS speaking test with 3 parts
2. Evaluate the user's English speaking ability
3. Ask relevant questions about their life, interests, and provided topics
4. Provide constructive feedback

CRITICAL INSTRUCTIONS - FOLLOW THESE EXACTLY:

1. LOGGING REQUIREMENT - YOU MUST:
   - Call "log_ai_speech" BEFORE and AFTER every single message/response you give
   - Include the exact text you're speaking in the "speech" parameter
   - Specify the type: "greeting", "question", "instruction", "feedback", "follow-up", "evaluation"
   - NEVER skip logging ANY message

2. TEST STRUCTURE:
   - Part 1 (4-5 minutes): Introduction and familiar topics
   - Part 2 (3-4 minutes): Long turn - describe a topic from a card
   - Part 3 (4-5 minutes): Discussion of abstract ideas related to Part 2

3. QUESTIONING:
   - Ask IELTS-style questions ONLY
   - Topics: family, work, hobbies, travel, hometown, technology, food, education
   - Use follow-up questions to assess fluency and coherence
   - Rate responses on: Fluency, Coherence, Vocabulary, Grammar, Pronunciation

4. WORKFLOW:
   a) START IMMEDIATELY - greet the user and introduce yourself
   b) Log the greeting with log_ai_speech
   c) Begin Part 1 with 4-5 questions
   d) Log each question with log_ai_speech
   e) Transition to Part 2 with topic card
   f) Log Part 2 feedback with log_ai_speech
   g) Conduct Part 3 discussion
   h) Provide final evaluation

IMPORTANT REMINDERS:
- You are ONLY an IELTS examiner - stay in role
- Log EVERY piece of text you say
- Be professional, friendly, but objective
- Always respond with audio (speaking)
- START SPEAKING IMMEDIATELY

BEGIN NOW - Greet the user warmly and start the IELTS speaking test immediately.`,
          },
        ],
      },
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [declaration, ...conversationTools] },
      ],
    })
    setIsInitialized(true)
  }, [setConfig, setModel])

  // Step 2: Set up tool call handlers
  useEffect(() => {
    if (!isInitialized || !client) return

    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) return

      console.log("[ALTAIR] Received tool calls:", toolCall.functionCalls.map(fc => fc.name))

      // Handle conversation logging tools
      toolCall.functionCalls.forEach((fc) => {
        const args = fc.args as any

        if (fc.name === "log_ai_speech") {
          console.log(`🤖 AI SPEECH [${args.type?.toUpperCase()}]:`, args.speech)
        } else if (fc.name === "log_question_start") {
          console.log('📝 QUESTION START:', args.question)
          if (args.part) {
            console.log('   Part:', args.part)
          }
        } else if (fc.name === "log_question_end") {
          console.log('✅ QUESTION END:', args.question)
        } else if (fc.name === "log_ai_response") {
          console.log(`💬 AI ${args.type?.toUpperCase()}:`, args.message)
        }
      })

      // Send success response for all tool calls
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls?.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
                name: fc.name,
              })),
            }),
          200
        )
      }
    }

    console.log("[ALTAIR] Registering tool call handler")
    client.on("toolcall", onToolCall)

    return () => {
      console.log("[ALTAIR] Unregistering tool call handler")
      client.off("toolcall", onToolCall)
    }
  }, [client, isInitialized])

  // Step 3: Send initial greeting when connected
  useEffect(() => {
    if (!connected || !isInitialized) return

    console.log("[ALTAIR] Client connected, waiting to send greeting...")

    const sendGreeting = async () => {
      // Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (client?.session) {
        console.log("[ALTAIR] Sending initial greeting to start AI")
        client.send([{
          text: "Hello, I'm ready to begin the IELTS speaking test."
        }])
      } else {
        console.log("[ALTAIR] Session not ready yet")
      }
    }

    sendGreeting()
  }, [connected, isInitialized, client])

  return {
    isInitialized,
  }
}

