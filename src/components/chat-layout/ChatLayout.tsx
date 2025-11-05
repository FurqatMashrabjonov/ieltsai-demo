import { useState, useEffect } from "react"
import { useLiveAPIContext } from "../../contexts/LiveAPIContext"
import { useLoggerStore } from "../../lib/store-logger"
import { useAltairAI } from "../altair/Altair"
import { Sidebar, SidebarContent, SidebarItem } from "../ui/sidebar"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { LogsViewer } from "../logs-viewer/LogsViewer"
import { Plus, Settings, LogOut, Menu, X, Mic, MicOff, Send } from "lucide-react"
import { cn } from "../../lib/utils-cn"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatLayout() {
  const { client, connected, connect, disconnect, volume } =
    useLiveAPIContext()
  const { log } = useLoggerStore()

  // Initialize AI configuration and handlers
  useAltairAI()

  const [messages, setMessages] = useState<Message[]>([])
  const [textInput, setTextInput] = useState("")
  const [muted, setMuted] = useState(false)
  const [showLogs, setShowLogs] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  // Listen to logs for conversation logging
  useEffect(() => {
    client.on("log", log)
    return () => {
      client.off("log", log)
    }
  }, [client, log])

  const handleSendMessage = () => {
    if (!textInput.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: textInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    console.log("👤 USER TEXT:", textInput)
    client.send([{ text: textInput }])
    setTextInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar>
          <div className="p-4 border-b border-slate-700">
            <Button
              onClick={() => setMessages([])}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <SidebarContent>
            {messages.length > 0 && (
              <SidebarItem>
                {messages[0].content.substring(0, 30)}...
              </SidebarItem>
            )}
          </SidebarContent>

          <div className="border-t border-slate-700 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              onClick={disconnect}
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Sidebar>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {showSidebar ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <h1 className="text-xl font-semibold">IELTS Speaking Practice</h1>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                connected ? "bg-green-500" : "bg-slate-300"
              )}
            />
            <span className="text-sm text-slate-600">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  IELTS Speaking Test
                </h2>
                <p className="text-slate-600 mb-6">
                  AI-powered speaking practice with real-time feedback
                </p>
                <Button
                  onClick={connected ? disconnect : connect}
                  className={cn(
                    "w-full",
                    connected
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {connected ? "Stop" : "Start"} Conversation
                </Button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-md px-4 py-3 rounded-lg",
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-900 rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-slate-500"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 px-6 py-4 bg-white">
          <div className="flex gap-3">
            <Button
              variant={muted ? "destructive" : "secondary"}
              size="icon"
              onClick={() => setMuted(!muted)}
              disabled={!connected}
              className="flex-shrink-0"
            >
              {muted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <div className="flex-1 flex gap-2">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (Shift+Enter for new line)"
                disabled={!connected}
                className="min-h-12 resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!connected || !textInput.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Volume Indicator */}
          {connected && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-6 w-32 bg-slate-200 rounded-full flex items-center px-2">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-100"
                  style={{
                    width: `${Math.min(Math.max(volume * 100, 5), 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-500">Volume</span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Sidebar */}
      {showLogs && (
        <div className="w-96 border-l border-slate-200">
          <LogsViewer onClose={() => setShowLogs(false)} />
        </div>
      )}

      {/* Toggle Logs Button */}
      {!showLogs && (
        <button
          onClick={() => setShowLogs(true)}
          className="fixed bottom-4 right-4 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
          title="Show Logs"
        >
          📋
        </button>
      )}
    </div>
  )
}

