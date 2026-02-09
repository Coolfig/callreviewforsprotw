import { useState } from "react";
import { ExternalLink, Youtube, Twitter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type EmbedPlatform = "youtube" | "twitter" | "tiktok" | "instagram";

interface EmbedPlayerProps {
  url: string;
  platform?: EmbedPlatform;
}

const detectPlatform = (url: string): EmbedPlatform | null => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return null;
};

const getYouTubeEmbedUrl = (url: string): string => {
  // If already an embed URL with params, return as-is
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  let videoId = "";
  let extraParams = "";
  
  if (url.includes("youtu.be/")) {
    const parts = url.split("youtu.be/")[1] || "";
    videoId = parts.split("?")[0] || "";
    const query = parts.split("?")[1];
    if (query) {
      const params = new URLSearchParams(query);
      if (params.get("t")) extraParams = `?start=${params.get("t")}`;
    }
  } else if (url.includes("youtube.com/watch")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v") || "";
    const start = urlParams.get("t") || urlParams.get("start");
    const end = urlParams.get("end");
    const parts: string[] = [];
    if (start) parts.push(`start=${start}`);
    if (end) parts.push(`end=${end}`);
    if (parts.length) extraParams = `?${parts.join("&")}`;
  }
  
  return `https://www.youtube.com/embed/${videoId}${extraParams}`;
};

const getTwitterEmbedId = (url: string): string => {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : "";
};

const platformConfig: Record<EmbedPlatform, { name: string; color: string; icon: React.ReactNode }> = {
  youtube: { name: "YouTube", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <Youtube className="w-3 h-3" /> },
  twitter: { name: "X", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Twitter className="w-3 h-3" /> },
  tiktok: { name: "TikTok", color: "bg-pink-500/20 text-pink-400 border-pink-500/30", icon: null },
  instagram: { name: "Instagram", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: null },
};

const EmbedPlayer = ({ url, platform: explicitPlatform }: EmbedPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const platform = explicitPlatform || detectPlatform(url);
  
  if (!platform) {
    return (
      <div className="rounded-xl overflow-hidden bg-secondary/50 border border-border aspect-video flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2">Unsupported embed URL</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1 justify-center"
          >
            Open original <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  const config = platformConfig[platform];

  const renderEmbed = () => {
    switch (platform) {
      case "youtube":
        return (
          <iframe
            src={getYouTubeEmbedUrl(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        );
      
      case "twitter":
        const tweetId = getTwitterEmbedId(url);
        return (
          <div className="w-full h-full flex items-center justify-center bg-card p-4">
            <blockquote className="twitter-tweet" data-theme="dark">
              <a href={url}>Loading tweet...</a>
            </blockquote>
            <script async src="https://platform.twitter.com/widgets.js" />
          </div>
        );
      
      case "tiktok":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">TikTok embeds require external widget</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Watch on TikTok <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
      
      case "instagram":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Instagram embeds require external widget</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Watch on Instagram <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl overflow-hidden bg-secondary/50 border border-border">
      {/* Platform badge */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
          {config.icon}
          {config.name}
        </Badge>
      </div>
      
      {/* Embed container */}
      <div className="relative aspect-video">
        {isLoading && platform === "youtube" && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/80">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        )}
        
        {hasError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Failed to load embed</p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Watch original <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : (
          renderEmbed()
        )}
      </div>
      
      {/* Source link */}
      <div className="px-4 py-2 border-t border-border bg-card/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground truncate max-w-[80%]">{url}</span>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Source <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default EmbedPlayer;
