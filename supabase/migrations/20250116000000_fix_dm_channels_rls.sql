-- Fix missing INSERT policy for direct_message_channels
-- This allows authenticated users to create new DM channels

CREATE POLICY "Users can create DM channels"
  ON public.direct_message_channels
  FOR INSERT
  WITH CHECK (true);
