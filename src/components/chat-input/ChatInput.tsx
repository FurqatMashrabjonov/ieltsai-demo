import { useState, useRef, KeyboardEvent } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Send } from "lucide-react";

export default function ChatInput() {
  const { connected, client } = useLiveAPIContext();
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!textInput.trim()) return;
    
    console.log('👤 USER TEXT:', textInput);
    client.send([{ text: textInput }]);

    setTextInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Send Message</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something..."
            disabled={!connected}
            className="min-h-[80px] resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!connected || !textInput.trim()}
            size="icon"
            className="h-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

