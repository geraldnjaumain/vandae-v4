-- =====================================================
-- AUTO-CREATE DEFAULT CHANNELS FOR COMMUNITIES
-- =====================================================
-- This trigger automatically creates default channels when a community is created
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_community_channels()
RETURNS TRIGGER AS $$
BEGIN
  -- Create general channel
  INSERT INTO public.channels (community_id, name, description, type, created_by)
  VALUES (
    NEW.id,
    'general',
    'General discussion',
    'text',
    NEW.creator_id
  );

  -- Create announcements channel
  INSERT INTO public.channels (community_id, name, description, type, created_by)
  VALUES (
    NEW.id,
    'announcements',
    'Important announcements',
    'announcement',
    NEW.creator_id
  );

  -- Create resources channel
  INSERT INTO public.channels (community_id, name, description, type, created_by)
  VALUES (
    NEW.id,
    'resources',
    'Share study materials and resources',
    'text',
    NEW.creator_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create channels
CREATE TRIGGER on_community_created
  AFTER INSERT ON public.communities
  FOR EACH ROW EXECUTE FUNCTION create_default_community_channels();

-- =====================================================
-- BACKFILL: Create channels for existing communities
-- =====================================================
DO $$
DECLARE
  community_record RECORD;
BEGIN
  FOR community_record IN SELECT id, creator_id FROM public.communities LOOP
    -- Check if channels already exist
    IF NOT EXISTS (
      SELECT 1 FROM public.channels WHERE community_id = community_record.id
    ) THEN
      -- Create default channels
      INSERT INTO public.channels (community_id, name, description, type, created_by)
      VALUES 
        (community_record.id, 'general', 'General discussion', 'text', community_record.creator_id),
        (community_record.id, 'announcements', 'Important announcements', 'announcement', community_record.creator_id),
        (community_record.id, 'resources', 'Share study materials and resources', 'text', community_record.creator_id);
    END IF;
  END LOOP;
END $$;
