export interface CommentData {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  content: string;
  likes_count: number;
  dislikes_count: number;
  score: number;
  rule_reference: string | null;
  timestamp_reference: string | null;
  created_at: string;
  liked_by_me: boolean;
  disliked_by_me: boolean;
  bookmarked_by_me: boolean;
  replies: CommentData[];
}

export type SortMode = "top" | "recent" | "debated";
