import { useEffect, useState, memo, useRef } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { AudioRecorder } from "../../lib/audio-recorder";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { cn } from "../../lib/utils-cn";

export type AudioControlTrayProps = {
  enableEditingSettings?: boolean;
};

function AudioControlTray({ enableEditingSettings }: AudioControlTrayProps) {
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const connectButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect, volume } =
    useLiveAPIContext();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Microphone Toggle */}
          <Button
            variant={muted ? "destructive" : "secondary"}
            size="icon"
            onClick={() => setMuted(!muted)}
            disabled={!connected}
            className="h-12 w-12 rounded-full"
          >
            {!muted ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {/* Volume Indicator */}
          <div className="flex items-center gap-2">
            <div className="h-12 w-32 bg-secondary rounded-full flex items-center px-3">
              <div
                className={cn(
                  "h-6 bg-primary rounded-full transition-all duration-100",
                  connected ? "opacity-100" : "opacity-50"
                )}
                style={{
                  width: `${Math.min(Math.max(volume * 100, 5), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Connect/Disconnect Button */}
          <Button
            ref={connectButtonRef}
            variant={connected ? "destructive" : "default"}
            size="icon"
            onClick={connected ? disconnect : connect}
            className="h-12 w-12 rounded-full"
          >
            {connected ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Status Text */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {connected ? "Connected - Streaming" : "Click play to start"}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default memo(AudioControlTray);

