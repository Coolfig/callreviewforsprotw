import { useState, useRef, useEffect } from "react";
import { Loader2, Image, Film, Link2, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MentionSuggestion {
  username: string;
  avatar_url: string | null;
}

const PostComposer = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { user, username } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);

  const searchGifs = async (query: string) => {
    if (!query.trim()) { setGifResults([]); return; }
    setGifLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gif-search', {
        body: { query, type: 'search' },
      });
      if (error) throw error;
      setGifResults(data?.results || []);
    } catch { /* ignore */ } finally { setGifLoading(false); }
  };

  const fetchTrendingGifs = async () => {
    setGifLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gif-search', {
        body: { type: 'trending' },
      });
      if (error) throw error;
      setGifResults(data?.results || []);
    } catch { /* ignore */ } finally { setGifLoading(false); }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [content]);

  const handleInput = async (value: string) => {
    setContent(value);
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textUpToCursor = value.slice(0, cursorPos);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);
    if (mentionMatch && mentionMatch[1].length >= 1) {
      const { data } = await supabase.from("profiles").select("username, avatar_url").ilike("username", `${mentionMatch[1]}%`).limit(5);
      setSuggestions(data || []);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (mentionUsername: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textUpToCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    const newTextBefore = textUpToCursor.replace(/@\w*$/, `@${mentionUsername} `);
    setContent(newTextBefore + textAfterCursor);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setVideoFile(null); setVideoPreview(null);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setImageFile(null); setImagePreview(null);
    }
  };

  const handlePost = async () => {
    if (!user || (!content.trim() && !imageFile && !videoFile && !linkUrl.trim() && !selectedGifUrl)) return;
    setPosting(true);

    let imageUrl: string | null = null;
    let videoUrl: string | null = null;

    if (selectedGifUrl) {
      imageUrl = selectedGifUrl;
    } else if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("post-media").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    if (videoFile) {
      const ext = videoFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("post-media").upload(path, videoFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path);
        videoUrl = urlData.publicUrl;
      }
    }

    if (linkUrl.trim() && !imageUrl && !videoUrl) {
      const url = linkUrl.trim();
      if (url.match(/\.(mp4|webm|mov)$/i) || url.includes("youtube.com") || url.includes("youtu.be")) {
        videoUrl = url;
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        imageUrl = url;
      } else {
        videoUrl = url;
      }
    }

    const postContent = content.trim() || "";
    await supabase.from("posts").insert({
      user_id: user.id,
      content: postContent,
      image_url: imageUrl,
      video_url: videoUrl,
    });

    setContent("");
    setImageFile(null); setImagePreview(null);
    setVideoFile(null); setVideoPreview(null);
    setLinkUrl(""); setShowLinkInput(false);
    setSelectedGifUrl(null); setShowGifPicker(false);
    setPosting(false);
    onPostCreated?.();
  };

  if (!user) return null;

  return (
    <div className="border-b border-border/50 p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-secondary text-sm font-bold">
            {username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="What's your take? 🏈"
            className="w-full bg-transparent text-foreground text-lg placeholder:text-muted-foreground resize-none border-none outline-none min-h-[60px]"
            rows={1}
          />

          {/* @ mention suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-xl shadow-xl z-20 w-64 overflow-hidden">
              {suggestions.map((s) => (
                <button key={s.username} onClick={() => insertMention(s.username)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 transition-colors text-left">
                  <Avatar className="w-8 h-8">
                    {s.avatar_url ? <AvatarImage src={s.avatar_url} /> : null}
                    <AvatarFallback className="bg-secondary text-xs">{s.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{s.username}</p>
                    <p className="text-xs text-muted-foreground">@{s.username.toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Media preview */}
          {imagePreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="max-h-64 w-full object-cover" />
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          {videoPreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border">
              <video src={videoPreview} className="max-h-64 w-full" controls />
              <button onClick={() => { setVideoFile(null); setVideoPreview(null); }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          {/* GIF preview */}
          {selectedGifUrl && (
            <div className="relative mt-2 inline-block">
              <img src={selectedGifUrl} alt="GIF" className="rounded-xl max-h-48 object-contain" />
              <button onClick={() => setSelectedGifUrl(null)} className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Link input */}
          {showLinkInput && (
            <div className="mt-2 flex gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Paste a URL (YouTube, image, video link...)"
                className="flex-1 bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button onClick={() => { setShowLinkInput(false); setLinkUrl(""); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* GIF Picker */}
          {showGifPicker && (
            <div className="mt-2 bg-card border border-border rounded-xl p-3 max-h-72 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") searchGifs(gifSearch); }}
                  placeholder="Search GIFs…"
                  className="flex-1 bg-secondary/50 border-none rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => searchGifs(gifSearch)}>Search</Button>
              </div>
              <div className="overflow-y-auto subtle-scroll flex-1">
                {gifLoading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {gifResults.map((gif: any) => {
                      const url = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url || "";
                      return (
                        <button
                          key={gif.id}
                          onClick={() => { setSelectedGifUrl(url); setShowGifPicker(false); setImageFile(null); setImagePreview(null); }}
                          className="rounded overflow-hidden hover:opacity-80 transition-opacity"
                        >
                          <img src={url} alt="" className="w-full h-20 object-cover" loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 text-right">Powered by Tenor</p>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 border-t border-border/30 pt-3">
            <div className="flex items-center gap-1">
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-full hover:bg-secondary/50 text-primary transition-colors" title="Add image">
                <Image className="w-5 h-5" />
              </button>
              <button onClick={() => videoInputRef.current?.click()} className="p-2 rounded-full hover:bg-secondary/50 text-primary transition-colors" title="Add video">
                <Film className="w-5 h-5" />
              </button>
              <button onClick={() => setShowLinkInput(!showLinkInput)} className="p-2 rounded-full hover:bg-secondary/50 text-primary transition-colors" title="Add link">
                <Link2 className="w-5 h-5" />
              </button>
              <button onClick={() => { setShowGifPicker(v => !v); if (!showGifPicker) fetchTrendingGifs(); }} className="p-2 rounded-full hover:bg-secondary/50 text-primary transition-colors font-bold text-xs" title="Add GIF">
                GIF
              </button>
            </div>
            <Button
              size="sm"
              className="rounded-full px-5 font-semibold"
              disabled={(!content.trim() && !imageFile && !videoFile && !linkUrl.trim() && !selectedGifUrl) || posting}
              onClick={handlePost}
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
