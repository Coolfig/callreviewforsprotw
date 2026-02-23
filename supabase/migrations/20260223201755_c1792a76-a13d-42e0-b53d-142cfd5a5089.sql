
-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  from_user_id uuid,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  play_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, play_id)
);
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation members
CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  video_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Typing indicators table
CREATE TABLE public.typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Security definer function to check conversation membership
CREATE OR REPLACE FUNCTION public.is_conversation_member(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- RLS for conversations
CREATE POLICY "Members can view conversations" ON public.conversations FOR SELECT USING (public.is_conversation_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Members can update conversations" ON public.conversations FOR UPDATE USING (public.is_conversation_member(auth.uid(), id));

-- RLS for conversation_members
CREATE POLICY "Members can view members" ON public.conversation_members FOR SELECT USING (public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Conversation creators can add members" ON public.conversation_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can leave conversations" ON public.conversation_members FOR DELETE USING (auth.uid() = user_id);

-- RLS for messages
CREATE POLICY "Members can view messages" ON public.messages FOR SELECT USING (public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Members can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Senders can update messages" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

-- RLS for typing_indicators
CREATE POLICY "Members can view typing" ON public.typing_indicators FOR SELECT USING (public.is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Users can set typing" ON public.typing_indicators FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update typing" ON public.typing_indicators FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete typing" ON public.typing_indicators FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for messages and typing
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger to create notification on follow
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  follower_username text;
BEGIN
  SELECT username INTO follower_username FROM public.profiles WHERE user_id = NEW.follower_id LIMIT 1;
  INSERT INTO public.notifications (user_id, type, title, body, from_user_id, link)
  VALUES (NEW.following_id, 'follow', 'New Follower', follower_username || ' started following you', NEW.follower_id, '/profile/' || follower_username);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_follow_notify
AFTER INSERT ON public.followers
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Trigger to update conversation updated_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_update_conversation
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();
