import { useEffect, useRef } from "react"
import { useLoggerStore } from "../../lib/store-logger"
import { Card } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"
import { cn } from "../../lib/utils-cn"
import { X } from "lucide-react"

interface LogsViewerProps {
  onClose?: () => void
}

export function LogsViewer({ onClose }: LogsViewerProps) {
  const { logs } = useLoggerStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (type: string) => {
    if (type.includes("error")) return "text-red-500"
    if (type.includes("audio")) return "text-blue-500"
    if (type.includes("send")) return "text-green-500"
    if (type.includes("receive")) return "text-orange-500"
    return "text-slate-400"
  }

  const getEmoji = (type: string) => {
    if (type.includes("error")) return "❌"
    if (type.includes("audio")) return "🎵"
    if (type.includes("question")) return "❓"
    if (type.includes("send")) return "📤"
    if (type.includes("receive")) return "📥"
    return "📝"
  }

  return (
    <Card className="h-full bg-slate-50 border-l border-slate-200 rounded-none flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">Logs</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No logs yet...</p>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className="text-xs font-mono bg-white p-2 rounded border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex gap-2">
                  <span className="text-lg">{getEmoji(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-semibold", getLevelColor(log.type))}>
                      {log.type}
                    </div>
                    <div className="text-slate-600 whitespace-pre-wrap break-words">
                      {typeof log.message === "string"
                        ? log.message
                        : JSON.stringify(log.message, null, 2)}
                    </div>
                    <div className="text-slate-400 mt-1">
                      {log.date.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}

