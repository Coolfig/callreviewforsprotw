import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
  const [mentionQuery, setMentionQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [content]);

  const handleInput = async (value: string) => {
    setContent(value);
    // Check for @ mentions
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const textUpToCursor = value.slice(0, cursorPos);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      if (query.length >= 1) {
        const { data } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .ilike("username", `${query}%`)
          .limit(5);
        setSuggestions(data || []);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
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

  const handlePost = async () => {
    if (!user || !content.trim()) return;
    setPosting(true);
    await supabase.from("posts").insert({ user_id: user.id, content: content.trim() });
    setContent("");
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
                <button
                  key={s.username}
                  onClick={() => insertMention(s.username)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                >
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

          <div className="flex items-center justify-between mt-3 border-t border-border/30 pt-3">
            <p className="text-xs text-muted-foreground">
              💬 Everyone can reply
            </p>
            <Button
              size="sm"
              className="rounded-full px-5 font-semibold"
              disabled={!content.trim() || posting}
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
