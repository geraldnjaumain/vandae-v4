-- =====================================================
-- VADAE - MESSAGING & NOTIFICATIONS SYSTEM
-- =====================================================
-- This migration creates all messaging and notification tables
-- =====================================================

-- =====================================================
-- TABLE: notifications
-- User notifications system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'info', 'warning', 'success', 'error'
  link TEXT, -- Optional link to relevant page
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- TABLE: channels
-- Community channels for organized discussions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'text' NOT NULL, -- 'text', 'voice', 'announcement'
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_channel_per_community UNIQUE(community_id, name)
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view channels in their communities"
  ON public.channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = channels.community_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = channels.community_id AND c.is_private = false
    )
  );

CREATE POLICY "Community admins can create channels"
  ON public.channels
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = channels.community_id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Community admins can update channels"
  ON public.channels
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = channels.community_id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Community admins can delete channels"
  ON public.channels
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = channels.community_id 
        AND user_id = auth.uid() 
        AND role IN ('admin', 'moderator')
    )
  );

-- Indexes
CREATE INDEX idx_channels_community_id ON public.channels(community_id);

-- =====================================================
-- TABLE: messages
-- Messages within community channels
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view messages in channels they have access to"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.channels ch
      JOIN public.community_members cm ON ch.community_id = cm.community_id
      WHERE ch.id = messages.channel_id AND cm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.channels ch
      JOIN public.communities c ON ch.community_id = c.id
      WHERE ch.id = messages.channel_id AND c.is_private = false
    )
  );

CREATE POLICY "Users can create messages in channels they have access to"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND
    EXISTS (
      SELECT 1 FROM public.channels ch
      JOIN public.community_members cm ON ch.community_id = cm.community_id
      WHERE ch.id = messages.channel_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_author_id ON public.messages(author_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- =====================================================
-- TABLE: message_reactions
-- Reactions to messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_message_reaction UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reactions on messages they can see"
  ON public.message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.channels ch ON m.channel_id = ch.id
      JOIN public.community_members cm ON ch.community_id = cm.community_id
      WHERE m.id = message_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);

-- =====================================================
-- TABLE: direct_message_channels
-- DM channels between users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.direct_message_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.direct_message_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view DM channels they are part of"
  ON public.direct_message_channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants
      WHERE dm_channel_id = id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- TABLE: direct_message_participants
-- Participants in DM channels
-- =====================================================
CREATE TABLE IF NOT EXISTS public.direct_message_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_channel_id UUID NOT NULL REFERENCES public.direct_message_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_dm_participant UNIQUE(dm_channel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.direct_message_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view participants in their DM channels"
  ON public.direct_message_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants dmp
      WHERE dmp.dm_channel_id = direct_message_participants.dm_channel_id 
        AND dmp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create DM participants when creating channels"
  ON public.direct_message_participants
  FOR INSERT
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_dm_participants_channel_id ON public.direct_message_participants(dm_channel_id);
CREATE INDEX idx_dm_participants_user_id ON public.direct_message_participants(user_id);

-- =====================================================
-- TABLE: direct_messages
-- Direct messages between users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_channel_id UUID NOT NULL REFERENCES public.direct_message_channels(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view messages in their DM channels"
  ON public.direct_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants
      WHERE dm_channel_id = direct_messages.dm_channel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their DM channels"
  ON public.direct_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND
    EXISTS (
      SELECT 1 FROM public.direct_message_participants
      WHERE dm_channel_id = direct_messages.dm_channel_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own DM messages"
  ON public.direct_messages
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own DM messages"
  ON public.direct_messages
  FOR DELETE
  USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX idx_direct_messages_channel_id ON public.direct_messages(dm_channel_id);
CREATE INDEX idx_direct_messages_author_id ON public.direct_messages(author_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);
CREATE INDEX idx_direct_messages_is_read ON public.direct_messages(is_read) WHERE is_read = false;

-- =====================================================
-- TABLE: direct_message_reactions
-- Reactions to direct messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.direct_message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dm_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT unique_dm_reaction UNIQUE(dm_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.direct_message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view reactions on DMs they can see"
  ON public.direct_message_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_messages dm
      JOIN public.direct_message_participants dmp ON dm.dm_channel_id = dmp.dm_channel_id
      WHERE dm.id = dm_id AND dmp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add DM reactions"
  ON public.direct_message_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own DM reactions"
  ON public.direct_message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_dm_reactions_dm_id ON public.direct_message_reactions(dm_id);
CREATE INDEX idx_dm_reactions_user_id ON public.direct_message_reactions(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dm_channels_updated_at BEFORE UPDATE ON public.direct_message_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_messages_updated_at BEFORE UPDATE ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update DM channel timestamp when new message is sent
CREATE OR REPLACE FUNCTION update_dm_channel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.direct_message_channels
  SET updated_at = NOW()
  WHERE id = NEW.dm_channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dm_channel_on_new_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION update_dm_channel_timestamp();

-- =====================================================
-- COMPLETED
-- =====================================================
