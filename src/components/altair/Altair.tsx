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
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
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
            text: 'You are IELTS Speaking Examiner. Start part 1 as soon as the user says "start the test". Ask questions in a natural conversational way. IMPORTANT: Use these tools to log your conversation flow:\n- Call "log_question_start" BEFORE you ask each question\n- Call "log_question_end" AFTER you finish asking each question\n- Call "log_ai_response" when giving feedback or important responses\nThis helps track the conversation structure.',
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

        if (fc.name === "log_question_start") {
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
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
