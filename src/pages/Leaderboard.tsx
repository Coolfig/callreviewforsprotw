import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  user_id: string;
  username: string;
  avatar_url: string | null;
  posts: number;
  likes: number;
  dislikes: number;
  points: number;
};

// Scoring: +2 per post, +1 per like received, -1 per dislike received
const POINTS_PER_POST = 2;
const POINTS_PER_LIKE = 1;
const POINTS_PER_DISLIKE = -1;

const Leaderboard = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [{ data: profiles }, { data: posts }, { data: postLikes }, { data: comments }, { data: cLikes }, { data: cDislikes }] = await Promise.all([
        supabase.from("profiles").select("user_id, username, avatar_url"),
        supabase.from("posts").select("id, user_id"),
        supabase.from("post_likes").select("post_id"),
        supabase.from("comments").select("id, user_id"),
        supabase.from("comment_likes").select("comment_id"),
        supabase.from("comment_dislikes").select("comment_id"),
      ]);

      const postOwner = new Map<string, string>();
      const postsByUser = new Map<string, number>();
      (posts || []).forEach((p: any) => {
        postOwner.set(p.id, p.user_id);
        postsByUser.set(p.user_id, (postsByUser.get(p.user_id) || 0) + 1);
      });

      const commentOwner = new Map<string, string>();
      (comments || []).forEach((c: any) => commentOwner.set(c.id, c.user_id));

      const likesByUser = new Map<string, number>();
      (postLikes || []).forEach((l: any) => {
        const u = postOwner.get(l.post_id);
        if (u) likesByUser.set(u, (likesByUser.get(u) || 0) + 1);
      });
      (cLikes || []).forEach((l: any) => {
        const u = commentOwner.get(l.comment_id);
        if (u) likesByUser.set(u, (likesByUser.get(u) || 0) + 1);
      });

      const dislikesByUser = new Map<string, number>();
      (cDislikes || []).forEach((d: any) => {
        const u = commentOwner.get(d.comment_id);
        if (u) dislikesByUser.set(u, (dislikesByUser.get(u) || 0) + 1);
      });

      const ranked: Row[] = (profiles || []).map((p: any) => {
        const posts = postsByUser.get(p.user_id) || 0;
        const likes = likesByUser.get(p.user_id) || 0;
        const dislikes = dislikesByUser.get(p.user_id) || 0;
        const points = posts * POINTS_PER_POST + likes * POINTS_PER_LIKE + dislikes * POINTS_PER_DISLIKE;
        return { user_id: p.user_id, username: p.username, avatar_url: p.avatar_url, posts, likes, dislikes, points };
      })
        .filter(r => r.posts > 0 || r.likes > 0 || r.dislikes > 0)
        .sort((a, b) => b.points - a.points);

      setRows(ranked);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
            </div>
            <p className="text-muted-foreground">
              Ranked by community points. <span className="text-foreground font-semibold">+{POINTS_PER_POST}</span> per post,
              {" "}<span className="text-foreground font-semibold">+{POINTS_PER_LIKE}</span> per like received,
              {" "}<span className="text-destructive font-semibold">{POINTS_PER_DISLIKE}</span> per dislike received.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
              <p className="text-sm text-muted-foreground">Start posting and engaging to climb the board.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {rows.map((r, i) => {
                const medal = i === 0 ? "bg-primary text-primary-foreground" : i === 1 ? "bg-accent text-accent-foreground" : i === 2 ? "bg-info text-info-foreground" : "bg-secondary text-foreground";
                return (
                  <Link
                    key={r.user_id}
                    to={`/profile/${r.username}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors border-b border-border/60 last:border-b-0 group"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-lg shrink-0 ${medal}`}>
                      {i + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      {r.avatar_url ? <AvatarImage src={r.avatar_url} /> : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {r.username?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold group-hover:text-primary transition-colors truncate">@{r.username}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{r.posts}</span>
                        <span className="inline-flex items-center gap-1 text-green-500"><ThumbsUp className="w-3 h-3" />{r.likes}</span>
                        <span className="inline-flex items-center gap-1 text-destructive"><ThumbsDown className="w-3 h-3" />{r.dislikes}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold tracking-tight">{r.points}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">points</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
