-- Add dedicated onboarding flag for inspiration cards
ALTER TABLE public.inspiration_items
  ADD COLUMN IF NOT EXISTS is_onboarding boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.inspiration_items.is_onboarding IS 'Marks inspiration rows eligible for onboarding swipe setup';

-- Seed at least 8 onboarding cards spanning distinct aesthetics
INSERT INTO public.inspiration_items (id, image_url, source, tags, is_onboarding)
VALUES
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a101',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['minimalist','black','neutral','tops','casual'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a102',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['streetwear','graphic','oversized','bottoms','casual'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a103',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['bohemian','floral','earth','dresses','weekend'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a104',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['preppy','classic','navy','outerwear','office'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a105',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['edgy','leather','black','outerwear','party'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a106',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['romantic','pastel','silk','dresses','date'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a107',
    'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['sporty','activewear','fitted','gray','workout'],
    true
  ),
  (
    '8f8e54e1-3c4b-46b5-95bf-2f36df90a108',
    'https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1200&q=80',
    'onboarding_seed',
    ARRAY['classic','formal','beige','outerwear','office'],
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  image_url = EXCLUDED.image_url,
  source = EXCLUDED.source,
  tags = EXCLUDED.tags,
  is_onboarding = EXCLUDED.is_onboarding;
