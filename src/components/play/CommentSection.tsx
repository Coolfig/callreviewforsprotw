import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComments } from "@/hooks/useComments";
import CommentComposer from "./CommentComposer";
import CommentCard from "./CommentCard";
import type { SortMode } from "@/types/comments";

const CommentSection = ({ playId }: { playId: string }) => {
  const {
    comments, loading, hasMore, fetchComments, loadMore,
    handleLike, handleDislike, handleBookmark, handlePost, handleReply, handleDelete,
  } = useComments(playId);
  const [sortMode, setSortMode] = useState<SortMode>("top");

  useEffect(() => { fetchComments(0); }, [fetchComments]);

  const sorted = [...comments].sort((a, b) => {
    if (sortMode === "top") return b.score - a.score;
    if (sortMode === "debated") return b.replies.length - a.replies.length;
    return 0;
  });

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Discussion</h3>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{comments.length}</span>
        </div>
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="bg-transparent text-xs text-muted-foreground rounded-md px-2 py-1 border border-border cursor-pointer focus:outline-none"
        >
          <option value="top">Top</option>
          <option value="recent">Recent</option>
          <option value="debated">Debated</option>
        </select>
      </div>

      <CommentComposer onPost={handlePost} />

      <div className="px-5 py-4 space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-6">Loading discussion…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to break it down!</p>
        ) : (
          sorted.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDislike={handleDislike}
              onBookmark={handleBookmark}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))
        )}
        {hasMore && !loading && sorted.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs" onClick={loadMore}>
            Load more
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
