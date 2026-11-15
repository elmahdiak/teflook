-- TefLook Seed Data for Local Development / Testing

-- Demo profile insertion (requires a corresponding auth.user in local dev or supabase studio)
-- Note: Replace UUIDs with valid auth user UUIDs from your local Supabase instance.
/*
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'demo@teflook.app', 'Alex Developer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, user_id, name, description, status, metadata)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'TefLook Analytics Pipeline', 'Real-time telemetry and data exploration dashboard', 'active', '{"version": "1.0", "env": "production"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'E-Commerce Model Sync', 'Sync orders and inventory with Supabase realtime', 'draft', '{"version": "0.1", "env": "staging"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
*/
