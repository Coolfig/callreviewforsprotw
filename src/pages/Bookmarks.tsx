import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, MessageSquare } from "lucide-react";
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

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkedComments, setBookmarkedComments] = useState<BookmarkedComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("bookmarks").select("play_id").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookmarkedIds(data?.map(b => b.play_id) || []);

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
      // preserve bookmark order
      mapped.sort((a, b) => commentIds.indexOf(a.id) - commentIds.indexOf(b.id));
      setBookmarkedComments(mapped);
    } else {
      setBookmarkedComments([]);
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
                        to={`/?play=${c.play_id}`}
                        className="block p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={c.avatar_url || undefined} />
                            <AvatarFallback>{c.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{c.username}</p>
                            <p className="text-sm text-foreground/90 mt-1 line-clamp-3 whitespace-pre-wrap">{c.content}</p>
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
