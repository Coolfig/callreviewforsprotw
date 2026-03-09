import { useState, useRef, useEffect } from "react";
import { Smile, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import EmojiPicker, { Theme, EmojiClickData, EmojiStyle } from "emoji-picker-react";
import GifPicker from "./GifPicker";

interface CommentComposerProps {
  onPost: (content: string, ruleRef: string, timeRef: string, gifUrl: string | null) => Promise<boolean>;
}

const CommentComposer = ({ onPost }: CommentComposerProps) => {
  const { user, username: authUsername } = useAuth();
  const [content, setContent] = useState("");
  const [ruleRef, setRuleRef] = useState("");
  const [timeRef, setTimeRef] = useState("");
  const [showRuleInput, setShowRuleInput] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGifUrl, setSelectedGifUrl] = useState<string | null>(null);
  const [authAvatarUrl, setAuthAvatarUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("avatar_url").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setAuthAvatarUrl(data.avatar_url);
    });
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const updated = content.slice(0, start) + emojiData.emoji + content.slice(end);
      setContent(updated);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length); }, 0);
    } else {
      setContent(prev => prev + emojiData.emoji);
    }
    setShowEmojiPicker(false);
  };

  const handlePost = async () => {
    const success = await onPost(content, ruleRef, timeRef, selectedGifUrl);
    if (success) {
      setContent(""); setRuleRef(""); setTimeRef("");
      setShowRuleInput(false); setShowTimeInput(false);
      setShowEmojiPicker(false); setSelectedGifUrl(null); setShowGifPicker(false);
    }
  };

  return (
    <div className="px-5 py-4 border-b border-border">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          {authAvatarUrl && <AvatarImage src={authAvatarUrl} alt={authUsername || "You"} />}
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {authUsername ? authUsername.slice(0, 2).toUpperCase() : "YO"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your take on this call…"
              className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 pr-10"
              rows={3}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(v => !v)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="absolute top-12 right-0 z-50">
                <EmojiPicker
                  theme={Theme.DARK}
                  emojiStyle={EmojiStyle.NATIVE}
                  onEmojiClick={onEmojiClick}
                  width={350}
                  height={450}
                  searchPlaceHolder="Search emojis…"
                  previewConfig={{ showPreview: false }}
                />
              </div>
            )}
          </div>

          {showRuleInput && (
            <input value={ruleRef} onChange={e => setRuleRef(e.target.value)} placeholder="e.g. Rule 3, Section 2, Art. 7"
              className="mt-2 w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          )}
          {showTimeInput && (
            <input value={timeRef} onChange={e => setTimeRef(e.target.value)} placeholder="e.g. 0:35"
              className="mt-2 w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          )}

          {selectedGifUrl && (
            <div className="relative mt-2 inline-block">
              <img src={selectedGifUrl} alt="GIF" className="rounded-lg max-h-32 object-contain" />
              <button onClick={() => setSelectedGifUrl(null)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">×</button>
            </div>
          )}

          {showGifPicker && (
            <GifPicker onSelect={(url) => { setSelectedGifUrl(url); setShowGifPicker(false); }} />
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <Button variant={showRuleInput ? "default" : "ghost"} size="sm" className="text-xs gap-1 h-7 px-2.5" onClick={() => setShowRuleInput(v => !v)}>
                <BookOpen className="w-3.5 h-3.5" />Cite Rule
              </Button>
              <Button variant={showTimeInput ? "default" : "ghost"} size="sm" className="text-xs gap-1 h-7 px-2.5" onClick={() => setShowTimeInput(v => !v)}>
                <Clock className="w-3.5 h-3.5" />Timestamp
              </Button>
              <Button variant={showGifPicker ? "default" : "ghost"} size="sm" className="text-xs gap-1 h-7 px-2.5" onClick={() => setShowGifPicker(v => !v)}>
                GIF
              </Button>
            </div>
            <Button size="sm" className="h-8 px-4" onClick={handlePost}>Post</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentComposer;
