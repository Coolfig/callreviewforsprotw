import { useState } from "react";
import { Link2, Send, Search, X, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postContent: string;
  username: string;
}

const ShareDialog = ({ open, onOpenChange, postId, postContent, username }: ShareDialogProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ user_id: string; username: string; avatar_url: string | null }[]>([]);
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/community`;

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (q.trim().length < 1) { setResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .ilike("username", `%${q}%`)
      .neq("user_id", user?.id || "")
      .limit(10);
    setResults(data || []);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!", description: "Post link copied to clipboard." });
  };

  const handleSendToUser = async (targetUserId: string, targetUsername: string) => {
    if (!user) return;
    setSending(targetUserId);

    try {
      // Find existing 1-on-1 conversation or create one
      const { data: myConvos } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      const myConvoIds = (myConvos || []).map(c => c.conversation_id);

      let convoId: string | null = null;

      if (myConvoIds.length > 0) {
        // Find a non-group conversation that includes the target user
        const { data: sharedConvos } = await supabase
          .from("conversation_members")
          .select("conversation_id")
          .eq("user_id", targetUserId)
          .in("conversation_id", myConvoIds);

        if (sharedConvos && sharedConvos.length > 0) {
          for (const sc of sharedConvos) {
            const { data: convo } = await supabase
              .from("conversations")
              .select("id, is_group")
              .eq("id", sc.conversation_id)
              .eq("is_group", false)
              .single();
            if (convo) { convoId = convo.id; break; }
          }
        }
      }

      if (!convoId) {
        // Create new conversation
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({ created_by: user.id, is_group: false })
          .select("id")
          .single();

        if (!newConvo) throw new Error("Failed to create conversation");
        convoId = newConvo.id;

        await supabase.from("conversation_members").insert([
          { conversation_id: convoId, user_id: user.id },
          { conversation_id: convoId, user_id: targetUserId },
        ]);
      }

      // Send the post as a message
      const shareMessage = `📢 Shared a post from @${username}:\n"${postContent.slice(0, 120)}${postContent.length > 120 ? "…" : ""}"\n\n${postUrl}`;
      await supabase.from("messages").insert({
        conversation_id: convoId,
        sender_id: user.id,
        content: shareMessage,
      });

      setSentTo(prev => [...prev, targetUserId]);
      toast({ title: "Sent!", description: `Post shared with ${targetUsername}` });
    } catch {
      toast({ title: "Error", description: "Could not send. Try again.", variant: "destructive" });
    } finally {
      setSending(null);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSearch("");
      setResults([]);
      setSentTo([]);
      setCopied(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold text-foreground">Share Post</DialogTitle>
        </DialogHeader>

        {/* Copy link */}
        <div className="px-5 pb-3">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-primary" />}
            </div>
            <p className="text-sm font-semibold text-foreground">{copied ? "Copied!" : "Copy link"}</p>
          </button>
        </div>

        {/* Share post via external */}
        <div className="px-5 pb-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Post by @${username}`, text: postContent.slice(0, 200), url: postUrl });
              } else {
                handleCopyLink();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Share post via…</p>
          </button>
        </div>

        {/* Divider */}
        <div className="px-5">
          <div className="h-px bg-border" />
        </div>

        {/* Send via Chat */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Send via Chat
          </p>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {search && (
              <button onClick={() => { setSearch(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* User list */}
        <div className="px-5 pb-5 max-h-64 overflow-y-auto subtle-scroll">
          {results.length === 0 && search.trim().length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">No users found</p>
          )}
          {results.length === 0 && search.trim().length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">Search for someone to share with</p>
          )}
          {results.map((u) => {
            const isSent = sentTo.includes(u.user_id);
            const isSending = sending === u.user_id;
            return (
              <div key={u.user_id} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-secondary/30 transition-colors">
                <Avatar className="w-9 h-9">
                  {u.avatar_url ? <AvatarImage src={u.avatar_url} /> : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {u.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.username}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                <Button
                  size="sm"
                  variant={isSent ? "outline" : "default"}
                  className="rounded-full px-4 h-8 text-xs font-semibold"
                  disabled={isSent || isSending}
                  onClick={() => handleSendToUser(u.user_id, u.username)}
                >
                  {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isSent ? (
                    <><Check className="w-3.5 h-3.5 mr-1" /> Sent</>
                  ) : "Send"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
