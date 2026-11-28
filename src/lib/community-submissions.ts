export type NewsletterStatus = "active" | "unsubscribed";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus;
  created_at: string;
}

export type ContactMessageStatus = "unread" | "read";

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
}

export const NEWSLETTER_SQL_MIGRATION = `CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at
  ON public.newsletter_subscribers (created_at DESC);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.newsletter_subscribers;
CREATE POLICY "Allow public newsletter signup"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);`;

export const CONTACT_MESSAGES_SQL_MIGRATION = `CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unread';

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON public.contact_messages (created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public contact insert" ON public.contact_messages;
CREATE POLICY "Allow public contact insert"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);`;

export function isSupabaseMissingTableError(
  err: { code?: string; message?: string } | null | undefined
): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table")
  );
}

export function isSupabaseMissingColumnError(
  err: { code?: string; message?: string } | null | undefined,
  columnName: string
): boolean {
  if (!err) return false;
  const code = (err.code || "").toUpperCase();
  const msg = (err.message || "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    (msg.includes(columnName.toLowerCase()) &&
      (msg.includes("column") || msg.includes("schema cache")))
  );
}

