import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, ZoomIn, Maximize2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import EmbedPlayer from "./EmbedPlayer";

interface TimelineMarker {
  time: number;
  label: string;
  user: string;
}

type VideoSource = "native" | "youtube" | "twitter" | "tiktok" | "instagram";

interface VideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  markers?: TimelineMarker[];
  embedUrl?: string;
  source?: VideoSource;
  onError?: () => void;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl, markers = [], embedUrl, source = "native", onError }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(35);
  const [duration] = useState(100);

  const defaultMarkers: TimelineMarker[] = [
    { time: 25, label: "Initial contact", user: "RefExpert22" },
    { time: 48, label: "Defender position", user: "HoopsAnalyst" },
    { time: 72, label: "Ball release", user: "GameTape" },
  ];
  const activeMarkers = markers.length > 0 ? markers : defaultMarkers;

  // If we have an embed URL, render the EmbedPlayer instead
  if (embedUrl && source !== "native") {
    return <EmbedPlayer url={embedUrl} platform={source} onError={onError} />;
  }

  // Native mp4 video player
  if (videoUrl && source === "native") {
    return (
      <div className="rounded-xl overflow-hidden bg-secondary/50 border border-border">
        <div className="relative aspect-video bg-black">
          <video
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden bg-secondary/50 border border-border">
      {/* Video Area */}
      <div className="relative aspect-video bg-black/80 flex items-center justify-center group">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="Play thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background opacity-50" />
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors hover:scale-105"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary-foreground" />
            ) : (
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            )}
          </button>
        </div>

        {/* Frame counter */}
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-sm">
          <span className="text-xs font-mono text-foreground">Frame 847 / 1200</span>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/60 backdrop-blur-sm hover:bg-black/80">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/60 backdrop-blur-sm hover:bg-black/80">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline with markers */}
      <div className="px-4 py-3 bg-card/50">
        <div className="relative mb-6">
          {/* Timeline track */}
          <div className="relative h-2 bg-secondary rounded-full">
            <div 
              className="absolute h-full bg-primary rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Markers */}
            {activeMarkers.map((marker, index) => (
              <div 
                key={index}
                className="absolute top-1/2 -translate-y-1/2 group/marker cursor-pointer"
                style={{ left: `${(marker.time / duration) * 100}%` }}
              >
                <div className="timeline-marker" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                    <div className="font-medium">{marker.label}</div>
                    <div className="text-muted-foreground">by {marker.user}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
            <span>0:00</span>
            <span>{Math.floor(currentTime / 60)}:{String(currentTime % 60).padStart(2, '0')}</span>
            <span>1:40</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-10 w-10"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <SkipForward className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground ml-2">Frame by frame: ← →</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider 
                defaultValue={[70]} 
                max={100} 
                step={1}
                className="w-20"
              />
            </div>
            <select className="bg-secondary text-sm rounded-md px-2 py-1 border border-border">
              <option>1x</option>
              <option>0.5x</option>
              <option>0.25x</option>
              <option>0.1x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
