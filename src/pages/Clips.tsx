import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchAllClips } from "@/lib/api/clips";
import { Search, Play, Loader2, ExternalLink, Film } from "lucide-react";

function ClipCard({ clip }: { clip: any }) {
  const video = clip.videos;
  const youtubeId = video?.youtube_id;
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const containerIdRef = useRef(`clip-player-${clip.id}`);
  const intervalRef = useRef<number | null>(null);

  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?start=${clip.start_seconds}&end=${clip.end_seconds}&enablejsapi=1`
    : null;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  const handlePlayClip = () => {
    if (!youtubeId) return;

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.seekTo(clip.start_seconds, true);
        playerRef.current.playVideo();
        startMonitor();
        return;
      }

      playerRef.current = new window.YT.Player(containerIdRef.current, {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, start: clip.start_seconds, modestbranding: 1, rel: 0, controls: 1 },
        events: {
          onReady: (e: any) => {
            e.target.seekTo(clip.start_seconds, true);
            e.target.playVideo();
            startMonitor();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else {
              setPlaying(false);
            }
          },
        },
      });
    };

    const startMonitor = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (!playerRef.current) return;
        const t = playerRef.current.getCurrentTime();
        if (t >= clip.end_seconds) {
          playerRef.current.pauseVideo();
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setPlaying(false);
        }
      }, 250);
    };

    if (window.YT?.Player) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  };

  const formatRange = (s: number, e: number) => {
    const fmt = (v: number) => `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, "0")}`;
    return `${fmt(s)} – ${fmt(e)}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="aspect-video bg-muted relative">
        {youtubeId ? (
          <>
            <div id={containerIdRef.current} className="w-full h-full" />
            {!playing && !playerRef.current && (
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <Button
                  onClick={handlePlayClip}
                  size="lg"
                  className="relative z-10 bg-primary/90 hover:bg-primary rounded-full h-14 w-14"
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Film className="h-8 w-8 opacity-40" />
            <p className="text-sm">Video unavailable</p>
            {video?.youtube_url && (
              <a href={video.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                Open on YouTube <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-sm">{clip.clip_title}</h3>
        <p className="text-xs text-muted-foreground font-mono">
          {formatRange(clip.start_seconds, clip.end_seconds)} ({clip.end_seconds - clip.start_seconds}s)
        </p>
        {clip.notes && <p className="text-xs text-muted-foreground">{clip.notes}</p>}
        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {clip.tags.map((t: string) => (
              <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>
            ))}
          </div>
        )}
        {!playing && playerRef.current && (
          <Button variant="secondary" size="sm" onClick={handlePlayClip} className="w-full mt-2">
            <Play className="h-3.5 w-3.5 mr-1" /> Replay Clip
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Clips() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: clips = [], isLoading } = useQuery({
    queryKey: ["all-clips"],
    queryFn: fetchAllClips,
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    clips.forEach((c: any) => c.tags?.forEach((t: string) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [clips]);

  const filtered = useMemo(() => {
    return clips.filter((c: any) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        c.clip_title?.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q) ||
        c.tags?.some((t: string) => t.toLowerCase().includes(q));
      const matchesTag = !selectedTag || c.tags?.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [clips, search, selectedTag]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Sports Clips</h1>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clips..."
              className="pl-9"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={selectedTag ? "outline" : "default"}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((t) => (
                <Badge
                  key={t}
                  variant={selectedTag === t ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedTag(selectedTag === t ? null : t)}
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Film className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No clips found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((clip: any) => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
