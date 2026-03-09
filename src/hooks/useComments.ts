import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import type { CommentData } from "@/types/comments";

const PAGE_SIZE = 10;

export const useComments = (playId: string) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async (pageNum = 0, append = false) => {
    const { data: rawComments, error } = await supabase
      .from("comments")
      .select("*")
      .eq("play_id", playId)
      .is("parent_id", null)
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (error) { console.error("Error fetching comments:", error); return; }
    if (!rawComments || rawComments.length < PAGE_SIZE) setHasMore(false);

    const userIds = rawComments?.map(c => c.user_id) ?? [];
    const { data: profiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", userIds);
    const profileMap = new Map(profiles?.map(p => [p.user_id, { username: p.username, avatar_url: p.avatar_url }]) ?? []);

    const commentIds = rawComments?.map(c => c.id) ?? [];
    const { data: replies } = await supabase.from("comments").select("*").in("parent_id", commentIds).order("created_at", { ascending: true });

    const replyUserIds = replies?.map(r => r.user_id).filter(id => !profileMap.has(id)) ?? [];
    if (replyUserIds.length > 0) {
      const { data: replyProfiles } = await supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", replyUserIds);
      replyProfiles?.forEach(p => profileMap.set(p.user_id, { username: p.username, avatar_url: p.avatar_url }));
    }

    let myLikes = new Set<string>();
    let myDislikes = new Set<string>();
    let myBookmarks = new Set<string>();
    if (user) {
      const allIds = [...commentIds, ...(replies?.map(r => r.id) ?? [])];
      if (allIds.length > 0) {
        const [likesRes, dislikesRes, bookmarksRes] = await Promise.all([
          supabase.from("comment_likes").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
          supabase.from("comment_dislikes").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
          supabase.from("comment_bookmarks").select("comment_id").eq("user_id", user.id).in("comment_id", allIds),
        ]);
        myLikes = new Set(likesRes.data?.map(l => l.comment_id) ?? []);
        myDislikes = new Set(dislikesRes.data?.map(l => l.comment_id) ?? []);
        myBookmarks = new Set(bookmarksRes.data?.map(l => l.comment_id) ?? []);
      }
    }

    const mapComment = (c: any): CommentData => {
      const profile = profileMap.get(c.user_id);
      return {
        id: c.id, user_id: c.user_id,
        username: profile?.username || "Unknown",
        avatar_url: profile?.avatar_url || null,
        content: c.content, likes_count: c.likes_count, dislikes_count: c.dislikes_count ?? 0, score: c.score,
        rule_reference: c.rule_reference, timestamp_reference: c.timestamp_reference,
        created_at: c.created_at, liked_by_me: myLikes.has(c.id), disliked_by_me: myDislikes.has(c.id),
        bookmarked_by_me: myBookmarks.has(c.id), replies: [],
      };
    };

    const repliesByParent = new Map<string, CommentData[]>();
    replies?.forEach(r => {
      const mapped = mapComment(r);
      if (!repliesByParent.has(r.parent_id!)) repliesByParent.set(r.parent_id!, []);
      repliesByParent.get(r.parent_id!)!.push(mapped);
    });

    const mapped = rawComments?.map(c => ({ ...mapComment(c), replies: repliesByParent.get(c.id) || [] })) ?? [];
    if (append) setComments(prev => [...prev, ...mapped]);
    else setComments(mapped);
    setLoading(false);
  }, [playId, user]);

  const requireAuth = useCallback(() => {
    if (!user) { toast({ title: "Sign up to participate" }); navigate("/auth"); return false; }
    return true;
  }, [user, navigate]);

  const handleLike = useCallback(async (commentId: string) => {
    if (!requireAuth()) return;
    setComments(prev => prev.map(c => {
      const update = (item: CommentData): CommentData => {
        if (item.id !== commentId) return item;
        if (item.liked_by_me) return { ...item, liked_by_me: false, likes_count: item.likes_count - 1 };
        if (item.disliked_by_me) return { ...item, liked_by_me: true, disliked_by_me: false, likes_count: item.likes_count + 1, dislikes_count: item.dislikes_count - 1 };
        return { ...item, liked_by_me: true, likes_count: item.likes_count + 1 };
      };
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_likes").select("id").eq("comment_id", commentId).eq("user_id", user!.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_dislikes").delete().eq("comment_id", commentId).eq("user_id", user!.id);
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user!.id });
    }
  }, [user, requireAuth]);

  const handleDislike = useCallback(async (commentId: string) => {
    if (!requireAuth()) return;
    setComments(prev => prev.map(c => {
      const update = (item: CommentData): CommentData => {
        if (item.id !== commentId) return item;
        if (item.disliked_by_me) return { ...item, disliked_by_me: false, dislikes_count: item.dislikes_count - 1 };
        if (item.liked_by_me) return { ...item, disliked_by_me: true, liked_by_me: false, dislikes_count: item.dislikes_count + 1, likes_count: item.likes_count - 1 };
        return { ...item, disliked_by_me: true, dislikes_count: item.dislikes_count + 1 };
      };
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_dislikes").select("id").eq("comment_id", commentId).eq("user_id", user!.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_dislikes").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", user!.id);
      await supabase.from("comment_dislikes").insert({ comment_id: commentId, user_id: user!.id });
    }
  }, [user, requireAuth]);

  const handleBookmark = useCallback(async (commentId: string) => {
    if (!requireAuth()) return;
    setComments(prev => prev.map(c => {
      const update = (item: CommentData): CommentData => item.id === commentId ? { ...item, bookmarked_by_me: !item.bookmarked_by_me } : item;
      return { ...update(c), replies: c.replies.map(update) };
    }));
    const { data: existing } = await supabase.from("comment_bookmarks").select("id").eq("comment_id", commentId).eq("user_id", user!.id).maybeSingle();
    if (existing) {
      await supabase.from("comment_bookmarks").delete().eq("id", existing.id);
    } else {
      await supabase.from("comment_bookmarks").insert({ comment_id: commentId, user_id: user!.id });
      toast({ title: "Comment bookmarked" });
    }
  }, [user, requireAuth]);

  const handlePost = async (content: string, ruleRef: string, timeRef: string, gifUrl: string | null) => {
    if (!requireAuth()) return false;
    let finalContent = content.trim();
    if (gifUrl) {
      finalContent = finalContent ? `${finalContent} [gif]${gifUrl}[/gif]` : `[gif]${gifUrl}[/gif]`;
    }
    if (!finalContent) { toast({ title: "Write something first", variant: "destructive" }); return false; }
    const { error } = await supabase.from("comments").insert({
      user_id: user!.id, play_id: playId, content: finalContent,
      rule_reference: ruleRef.trim() || null, timestamp_reference: timeRef.trim() || null,
    });
    if (error) { toast({ title: "Error", description: "Failed to post.", variant: "destructive" }); return false; }
    toast({ title: "Posted!" });
    fetchComments(0);
    return true;
  };

  const handleReply = async (parentId: string, replyContent: string) => {
    if (!requireAuth()) return false;
    if (!replyContent.trim()) return false;
    const { error } = await supabase.from("comments").insert({
      user_id: user!.id, play_id: playId, parent_id: parentId, content: replyContent.trim(),
    });
    if (error) { toast({ title: "Error", variant: "destructive" }); return false; }
    fetchComments(0);
    return true;
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
    } else {
      toast({ title: "Comment deleted" });
      fetchComments(0);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchComments(next, true);
  };

  return {
    comments, loading, hasMore, fetchComments, loadMore,
    handleLike, handleDislike, handleBookmark, handlePost, handleReply, handleDelete,
  };
};
