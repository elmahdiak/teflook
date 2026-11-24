-- ====================================================================
-- TefLook: Product Reviews Table & Public RLS Policies
-- Ready to run directly in Supabase Dashboard > SQL Editor
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  product_handle text,
  author_name text NOT NULL,
  author_role text DEFAULT 'Parent',
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_verified boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Index for high-performance per-product review lookups
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_handle ON public.product_reviews (product_handle);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- 1. SELECT policy: Anyone can read reviews
DROP POLICY IF EXISTS "Allow public read access on product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public read access on product_reviews"
  ON public.product_reviews FOR SELECT
  USING (true);

-- 2. INSERT policy: Anyone can submit a review
DROP POLICY IF EXISTS "Allow public insert on product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public insert on product_reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (true);

-- 3. UPDATE policy: Allows moderation / toggling verified status
DROP POLICY IF EXISTS "Allow public update on product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public update on product_reviews"
  ON public.product_reviews FOR UPDATE
  USING (true);

-- 4. DELETE policy: Allows deleting reviews
DROP POLICY IF EXISTS "Allow public delete on product_reviews" ON public.product_reviews;
CREATE POLICY "Allow public delete on product_reviews"
  ON public.product_reviews FOR DELETE
  USING (true);
