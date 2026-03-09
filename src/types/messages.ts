export interface ConversationMember {
  user_id: string;
  username: string;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  name: string | null;
  is_group: boolean;
  updated_at: string;
  members: ConversationMember[];
  last_message?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  is_read: boolean;
  created_at: string;
  sender_username?: string;
}
