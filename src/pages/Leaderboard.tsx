import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Loader2, ThumbsUp, ThumbsDown, FileText, Flame, Crown, Medal, DollarSign, Calendar } from "lucide-react";
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

const POINTS_PER_POST = 2;
const POINTS_PER_LIKE = 1;
const POINTS_PER_DISLIKE = -1;

const useCountUp = (target: number, duration = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
};

const BigPoints = ({ value, size = "md" }: { value: number; size?: "xl" | "lg" | "md" | "sm" }) => {
  const n = useCountUp(value);
  const sizes = {
    xl: "text-6xl md:text-7xl",
    lg: "text-5xl",
    md: "text-4xl",
    sm: "text-2xl",
  };
  return (
    <span
      className={`${sizes[size]} font-black tracking-tight bg-gradient-to-br from-primary via-accent to-info bg-clip-text text-transparent leading-none tabular-nums`}
      style={{ filter: "drop-shadow(0 2px 12px hsl(var(--primary) / 0.25))" }}
    >
      {n.toLocaleString()}
    </span>
  );
};

const PRIZE_POOL_TOTAL = 1000;
const PRIZE_SPLITS = [
  { rank: 1, pct: 0.5, label: "1st Place", color: "from-primary to-primary/60", icon: <Crown className="w-5 h-5" /> },
  { rank: 2, pct: 0.3, label: "2nd Place", color: "from-accent to-accent/60", icon: <Medal className="w-5 h-5" /> },
  { rank: 3, pct: 0.2, label: "3rd Place", color: "from-info to-info/60", icon: <Medal className="w-5 h-5" /> },
];

const getNextPayoutDate = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const PrizePool = () => {
  const nextPayout = getNextPayoutDate();
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 md:p-8">
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-black tracking-widest text-primary uppercase">Live Pool</span>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Prize Pool</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-primary via-accent to-info bg-clip-text text-transparent leading-none tabular-nums"
              style={{ filter: "drop-shadow(0 4px 16px hsl(var(--primary) / 0.4))" }}>
              ${PRIZE_POOL_TOTAL.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">USD</span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>Pays out <span className="font-bold text-foreground">{nextPayout}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {PRIZE_SPLITS.map((s) => (
            <div key={s.rank} className="bg-background/60 backdrop-blur border border-border rounded-xl p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} text-white mb-2 shadow-lg`}>
                {s.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-2xl md:text-3xl font-black tracking-tight mt-1">
                ${Math.round(PRIZE_POOL_TOTAL * s.pct).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold">{Math.round(s.pct * 100)}%</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-[11px] text-muted-foreground mt-5 pt-4 border-t border-border/50">
        Top 3 ranked users at month-end get paid via PayPal or Stripe. Points earned this month count toward the pool.
      </p>
    </div>
  );
};
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
        const postsN = postsByUser.get(p.user_id) || 0;
        const likes = likesByUser.get(p.user_id) || 0;
        const dislikes = dislikesByUser.get(p.user_id) || 0;
        const points = postsN * POINTS_PER_POST + likes * POINTS_PER_LIKE + dislikes * POINTS_PER_DISLIKE;
        return { user_id: p.user_id, username: p.username, avatar_url: p.avatar_url, posts: postsN, likes, dislikes, points };
      })
        .filter(r => r.posts > 0 || r.likes > 0 || r.dislikes > 0)
        .sort((a, b) => b.points - a.points);

      setRows(ranked);
      setLoading(false);
    })();
  }, []);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[184px] pb-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Hero header */}
          <div className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-info/10 p-8 md:p-12">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-end gap-6 justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 mb-4">
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-widest">Live Rankings</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
                  The <span className="bg-gradient-to-br from-primary via-accent to-info bg-clip-text text-transparent">Leaderboard</span>
                </h1>
                <p className="text-muted-foreground mt-3 max-w-lg">
                  Earn points. Win arguments. Climb the ranks.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-bold">
                  <FileText className="w-3.5 h-3.5 text-info" /> +{POINTS_PER_POST} post
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-bold">
                  <ThumbsUp className="w-3.5 h-3.5 text-accent" /> +{POINTS_PER_LIKE} like
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm font-bold">
                  <ThumbsDown className="w-3.5 h-3.5 text-destructive" /> {POINTS_PER_DISLIKE} dislike
                </span>
              </div>
            </div>
          </div>

          {/* Prize Pool */}
          <PrizePool />



          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <Trophy className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No rankings yet</h3>
              <p className="text-sm text-muted-foreground">Start posting and engaging to climb the board.</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              {podium.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[1, 0, 2].map((order) => {
                    const r = podium[order];
                    if (!r) return <div key={order} className="hidden md:block" />;
                    const rank = order + 1;
                    const styles = [
                      { ring: "ring-primary", bg: "from-primary/25 to-primary/5", icon: <Crown className="w-6 h-6 text-primary" />, label: "CHAMPION", height: "md:pt-0" },
                      { ring: "ring-accent", bg: "from-accent/25 to-accent/5", icon: <Medal className="w-6 h-6 text-accent" />, label: "RUNNER-UP", height: "md:pt-8" },
                      { ring: "ring-info", bg: "from-info/25 to-info/5", icon: <Medal className="w-6 h-6 text-info" />, label: "THIRD", height: "md:pt-8" },
                    ][order];
                    return (
                      <Link
                        key={r.user_id}
                        to={`/profile/${r.username}`}
                        className={`group relative ${styles.height}`}
                      >
                        <div className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${styles.bg} p-6 hover:scale-[1.02] transition-transform`}>
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-[10px] font-black tracking-widest">
                            {styles.icon}
                            <span>#{rank}</span>
                          </div>
                          <Avatar className={`w-20 h-20 ring-4 ${styles.ring} ring-offset-2 ring-offset-background mb-4`}>
                            {r.avatar_url ? <AvatarImage src={r.avatar_url} /> : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                              {r.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-lg group-hover:text-primary transition-colors truncate">@{r.username}</p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 font-bold">{styles.label}</p>
                          <div className="flex items-baseline gap-2">
                            <BigPoints value={r.points} size={order === 0 ? "xl" : "lg"} />
                            <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">pts</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                            <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{r.posts}</span>
                            <span className="inline-flex items-center gap-1 text-accent"><ThumbsUp className="w-3 h-3" />{r.likes}</span>
                            <span className="inline-flex items-center gap-1 text-destructive"><ThumbsDown className="w-3 h-3" />{r.dislikes}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Rest of the board */}
              {rest.length > 0 && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  {rest.map((r, i) => {
                    const rank = i + 4;
                    return (
                      <Link
                        key={r.user_id}
                        to={`/profile/${r.username}`}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors border-b border-border/60 last:border-b-0 group"
                      >
                        <div className="w-12 text-center font-black text-2xl text-muted-foreground/60 tabular-nums shrink-0">
                          {rank}
                        </div>
                        <Avatar className="w-12 h-12">
                          {r.avatar_url ? <AvatarImage src={r.avatar_url} /> : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {r.username?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base group-hover:text-primary transition-colors truncate">@{r.username}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" />{r.posts}</span>
                            <span className="inline-flex items-center gap-1 text-accent"><ThumbsUp className="w-3 h-3" />{r.likes}</span>
                            <span className="inline-flex items-center gap-1 text-destructive"><ThumbsDown className="w-3 h-3" />{r.dislikes}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-baseline gap-1.5">
                          <BigPoints value={r.points} size="md" />
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">pts</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Leaderboard;
