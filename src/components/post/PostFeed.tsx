import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PostComposer from "./PostComposer";
import PostItem from "./PostItem";

interface PostWithProfile {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
}

const PostFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData) { setLoading(false); return; }

    // Get unique user IDs
    const userIds = [...new Set(postsData.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    // Get like counts
    const postIds = postsData.map((p) => p.id);
    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id")
      .in("post_id", postIds);

    const likeCounts = new Map<string, number>();
    likesData?.forEach((l) => likeCounts.set(l.post_id, (likeCounts.get(l.post_id) || 0) + 1));

    // Get replies counts
    const { data: repliesData } = await supabase
      .from("post_replies")
      .select("post_id")
      .in("post_id", postIds);

    const replyCounts = new Map<string, number>();
    repliesData?.forEach((r) => replyCounts.set(r.post_id, (replyCounts.get(r.post_id) || 0) + 1));

    // Check which posts current user liked
    let userLikes = new Set<string>();
    if (user) {
      const { data: myLikes } = await supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", postIds);
      userLikes = new Set(myLikes?.map((l) => l.post_id) || []);
    }

    const enriched: PostWithProfile[] = postsData.map((p) => {
      const profile = profileMap.get(p.user_id);
      return {
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        user_id: p.user_id,
        username: profile?.username || "Unknown",
        avatar_url: profile?.avatar_url || null,
        likes_count: likeCounts.get(p.id) || 0,
        replies_count: replyCounts.get(p.id) || 0,
        is_liked: userLikes.has(p.id),
      };
    });

    setPosts(enriched);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("posts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  return (
    <div>
      <PostComposer onPostCreated={fetchPosts} />
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-semibold text-foreground">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share your take!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} {...post} onDelete={fetchPosts} onLikeToggle={fetchPosts} />
        ))
      )}
    </div>
  );
};

export default PostFeed;
