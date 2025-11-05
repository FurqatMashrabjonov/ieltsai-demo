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
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";

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
};

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
    description: "Call this when you START asking a question to the user. This marks the beginning of your question.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "The question you are about to ask the user",
        },
        part: {
          type: Type.STRING,
          description: "Which part of the conversation (e.g., 'Part 1', 'Part 2', 'Part 3')",
        },
      },
      required: ["question"],
    },
  },
  {
    name: "log_question_end",
    description: "Call this when you FINISH asking a question to the user. This marks the end of your question.",
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
    description: "Call this to log important information about what you're saying or responding to the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        message: {
          type: Type.STRING,
          description: "Your response or comment to the user",
        },
        type: {
          type: Type.STRING,
          description: "Type of response (e.g., 'feedback', 'question', 'instruction', 'evaluation')",
        },
      },
      required: ["message", "type"],
    },
  },
];

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();

  useEffect(() => {
    setModel("gemini-2.5-flash-native-audio-preview-09-2025");
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
   - Rate responses mentally on: Fluency, Coherence, Vocabulary, Grammar, Pronunciation

4. WORKFLOW:
   a) START IMMEDIATELY - When connection is established, greet the user and introduce yourself
   b) Log the greeting with log_ai_speech
   c) Begin Part 1 with 4-5 questions
   d) Log each question and response with log_ai_speech
   e) Transition to Part 2 with topic card
   f) Log Part 2 instructions and feedback with log_ai_speech
   g) Conduct Part 3 discussion
   h) Provide final evaluation

IMPORTANT REMINDERS:
- You are ONLY an IELTS examiner - stay in this role completely
- Log EVERY piece of text you say - this is mandatory for quality assurance
- Be professional, friendly, but objective in assessment
- Don't answer personal questions - redirect to test
- Keep responses to reasonable length for speaking test
- Always respond with audio (speaking)
- START SPEAKING IMMEDIATELY - DO NOT WAIT FOR USER INPUT

BEGIN NOW - Greet the user warmly and start the IELTS speaking test immediately. Begin Part 1 by asking them to introduce themselves.`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [declaration, ...conversationTools] },
      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }

      // Handle conversation logging tools
      toolCall.functionCalls.forEach((fc) => {
        const args = fc.args as any;

        if (fc.name === "log_ai_speech") {
          console.log(`🤖 AI SPEECH [${args.type?.toUpperCase()}]:`, args.speech);
        } else if (fc.name === "log_question_start") {
          console.log('📝 QUESTION START:', args.question);
          if (args.part) {
            console.log('   Part:', args.part);
          }
        } else if (fc.name === "log_question_end") {
          console.log('✅ QUESTION END:', args.question);
        } else if (fc.name === "log_ai_response") {
          console.log(`💬 AI ${args.type?.toUpperCase()}:`, args.message);
        }
      });

      // Handle render_altair tool
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }

      // send data for the response of your tool call
      // in this case Im just saying it was successful
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
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("jsonString", jsonString);
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);

  // Auto-start greeting when component mounts and client is connected
  useEffect(() => {
    const startGreeting = async () => {
      // Wait a bit for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Send initial greeting to start the AI speaking
      if (client && client.session) {
        client.send([{
          text: "Hello, I'm ready to begin the IELTS speaking test. Please start speaking."
        }]);
      }
    };

    // Only trigger once when component mounts
    startGreeting();
  }, [client]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
