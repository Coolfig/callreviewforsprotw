import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, MessageSquare, Users } from "lucide-react";
import PlayCard from "@/components/play/PlayCard";
import { sportsVideos } from "@/data/sportsVideos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface BookmarkedComment {
  id: string;
  content: string;
  play_id: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface BookmarkedReply {
  id: string;
  content: string;
  post_id: string;
  created_at: string;
  username: string;
  avatar_url: string | null;
  kind: "post" | "reply";
}

// Parse [gif]URL[/gif] segments and inline @mentions; render text + <img> for gifs.
const renderRichContent = (text: string) => {
  const gifRegex = /\[gif\](.*?)\[\/gif\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = gifRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <img key={key++} src={match[1]} alt="GIF" className="rounded-lg max-h-48 mt-2 border border-border/30" />
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return parts;
};

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedComments, setBookmarkedComments] = useState<BookmarkedComment[]>([]);
  const [bookmarkedReplies, setBookmarkedReplies] = useState<BookmarkedReply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    // Play bookmarks
    const { data } = await supabase.from("bookmarks").select("play_id").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookmarkedIds(data?.map(b => b.play_id) || []);

    // Play comment bookmarks
    const { data: cb } = await supabase
      .from("comment_bookmarks")
      .select("comment_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const commentIds = cb?.map(c => c.comment_id) || [];
    if (commentIds.length) {
      const { data: comments } = await supabase
        .from("comments")
        .select("id, content, play_id, created_at, user_id")
        .in("id", commentIds);
      const userIds = [...new Set(comments?.map(c => c.user_id) || [])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds);
      const pMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const mapped: BookmarkedComment[] = (comments || []).map(c => {
        const p = pMap.get(c.user_id);
        return { id: c.id, content: c.content, play_id: c.play_id, created_at: c.created_at, username: p?.username || "Unknown", avatar_url: p?.avatar_url || null };
      });
      mapped.sort((a, b) => commentIds.indexOf(a.id) - commentIds.indexOf(b.id));
      setBookmarkedComments(mapped);
    } else {
      setBookmarkedComments([]);
    }

    // Community reply bookmarks
    const { data: rb } = await supabase
      .from("post_reply_bookmarks")
      .select("reply_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const replyIds = rb?.map(r => r.reply_id) || [];
    if (replyIds.length) {
      const { data: replies } = await supabase
        .from("post_replies")
        .select("id, content, post_id, created_at, user_id")
        .in("id", replyIds);
      const userIds = [...new Set(replies?.map(r => r.user_id) || [])];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds);
      const pMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const mapped: BookmarkedReply[] = (replies || []).map(r => {
        const p = pMap.get(r.user_id);
        return { id: r.id, content: r.content, post_id: r.post_id, created_at: r.created_at, username: p?.username || "Unknown", avatar_url: p?.avatar_url || null, kind: "reply" as const };
      });
      mapped.sort((a, b) => replyIds.indexOf(a.id) - replyIds.indexOf(b.id));
      setBookmarkedReplies(mapped);
    } else {
      setBookmarkedReplies([]);
    }

    // Community post bookmarks
    const { data: pb } = await supabase
      .from("post_bookmarks")
      .select("post_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const pIds = pb?.map(b => b.post_id) || [];
    if (pIds.length) {
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, created_at, user_id")
        .in("id", pIds);
      const uIds = [...new Set(posts?.map(p => p.user_id) || [])];
      const { data: profs } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", uIds);
      const pMap2 = new Map(profs?.map(p => [p.user_id, p]) || []);
      const mappedPosts: BookmarkedReply[] = (posts || []).map(p => {
        const pr = pMap2.get(p.user_id);
        return { id: p.id, content: p.content, post_id: p.id, created_at: p.created_at, username: pr?.username || "Unknown", avatar_url: pr?.avatar_url || null, kind: "post" as const };
      });
      mappedPosts.sort((a, b) => pIds.indexOf(a.id) - pIds.indexOf(b.id));
      setBookmarkedReplies(prev => [...mappedPosts, ...prev]);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const bookmarkedVideos = sportsVideos.filter(v => bookmarkedIds.includes(v.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-[160px] text-center">
          <p className="text-muted-foreground">Please sign in to view bookmarks.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[160px] pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Your Vault</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Tabs defaultValue="plays">
              <TabsList className="mb-6">
                <TabsTrigger value="plays">Plays ({bookmarkedVideos.length})</TabsTrigger>
                <TabsTrigger value="comments">Comments ({bookmarkedComments.length})</TabsTrigger>
                <TabsTrigger value="community">Community ({bookmarkedReplies.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="plays">
                {bookmarkedVideos.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold text-foreground">No saved plays yet</p>
                    <p className="text-sm mt-1">Save posts from the feed to find them here later</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookmarkedVideos.map(video => (
                      <PlayCard
                        key={video.id}
                        id={video.id}
                        title={video.title}
                        description={video.description}
                        league={video.league}
                        teams={video.teams}
                        date={video.date}
                        gameContext={video.gameContext}
                        isHot={video.isHot}
                        embedUrl={video.embedUrl}
                        videoUrl={video.videoUrl}
                        videoSource={video.videoSource}
                        ruleData={video.ruleData}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments">
                {bookmarkedComments.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold text-foreground">No saved comments yet</p>
                    <p className="text-sm mt-1">Tap the bookmark icon on any comment to save it</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarkedComments.map(c => (
                      <Link
                        key={c.id}
                        to={`/?play=${c.play_id}#comment-${c.id}`}
                        className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={c.avatar_url || undefined} />
                            <AvatarFallback>{c.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{c.username}</p>
                            <div className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">
                              {renderRichContent(c.content)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="community">
                {bookmarkedReplies.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold text-foreground">No saved community comments</p>
                    <p className="text-sm mt-1">Save replies from the Community page to keep them here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookmarkedReplies.map(r => (
                      <Link
                        key={r.id}
                        to={`/community#post-${r.post_id}`}
                        className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={r.avatar_url || undefined} />
                            <AvatarFallback>{r.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{r.username}</p>
                            <div className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">
                              {renderRichContent(r.content)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;
