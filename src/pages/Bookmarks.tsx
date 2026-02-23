import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2 } from "lucide-react";
import PlayCard from "@/components/play/PlayCard";
import { sportsVideos } from "@/data/sportsVideos";

const Bookmarks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("bookmarks").select("play_id").eq("user_id", user.id).order("created_at", { ascending: false });
    setBookmarkedIds(data?.map(b => b.play_id) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const bookmarkedVideos = sportsVideos.filter(v => bookmarkedIds.includes(v.id));

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 text-center">
          <p className="text-muted-foreground">Please sign in to view bookmarks.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Your Vault</h1>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : bookmarkedVideos.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-foreground">No bookmarks yet</p>
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
                  voteCount={video.voteCount}
                  commentCount={video.commentCount}
                  embedUrl={video.embedUrl}
                  videoUrl={video.videoUrl}
                  videoSource={video.videoSource}
                  ruleData={video.ruleData}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bookmarks;
