import { useEffect, useRef, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Clock, Scissors } from "lucide-react";

declare global {
  interface Window {
    YT: {
      Player: new (
        el: string | HTMLElement,
        config: Record<string, unknown>
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YouTubePlayerProps {
  youtubeId: string;
  onSetStart: (seconds: number) => void;
  onSetEnd: (seconds: number) => void;
  previewRange?: { start: number; end: number } | null;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function YouTubePlayer({ youtubeId, onSetStart, onSetEnd, previewRange }: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const previewRef = useRef(previewRange);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  previewRef.current = previewRange;

  const startTimeTracking = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;
      const t = playerRef.current.getCurrentTime();
      setCurrentTime(t);
      // Auto-pause at end of preview range
      if (previewRef.current && t >= previewRef.current.end) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    }, 250);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initPlayer = () => {
      if (!mounted || !containerRef.current) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      playerRef.current = new window.YT.Player("yt-player-container", {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          controls: 0,
        },
        events: {
          onReady: () => {
            if (mounted) setReady(true);
          },
          onStateChange: (event: { data: number }) => {
            if (!mounted) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else {
              setIsPlaying(false);
              if (event.data !== window.YT.PlayerState.PAUSED) stopTimeTracking();
            }
          },
        },
      } as Record<string, unknown>);
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      mounted = false;
      stopTimeTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [youtubeId, startTimeTracking, stopTimeTracking]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handlePreview = () => {
    if (!playerRef.current || !previewRange) return;
    playerRef.current.seekTo(previewRange.start, true);
    playerRef.current.playVideo();
  };

  return (
    <div className="space-y-3">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
        <div id="yt-player-container" ref={containerRef} className="w-full h-full" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">Loading player...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={togglePlay} disabled={!ready}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-md">
          <Clock className="h-3.5 w-3.5" />
          <span>{Math.round(currentTime)}s</span>
          <span className="text-muted-foreground/60">({formatTime(currentTime)})</span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetStart(Math.round(currentTime))}
          disabled={!ready}
        >
          <Scissors className="h-4 w-4 mr-1" />
          Set Start
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetEnd(Math.round(currentTime))}
          disabled={!ready}
        >
          <Scissors className="h-4 w-4 mr-1" />
          Set End
        </Button>

        {previewRange && (
          <Button variant="default" size="sm" onClick={handlePreview} disabled={!ready}>
            <Play className="h-4 w-4 mr-1" />
            Preview Clip ({previewRange.start}s – {previewRange.end}s)
          </Button>
        )}
      </div>
    </div>
  );
}
