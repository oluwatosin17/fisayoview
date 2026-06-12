-- CMS Migration — run once in Supabase SQL editor
-- Adds about_portraits to site_settings and seeds existing data

-- 1. Add about_portraits column
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS about_portraits JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Ensure collections has description + featured (idempotent)
ALTER TABLE collections ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- 3. Upsert site_settings with current hardcoded content
INSERT INTO site_settings (
  about_heading,
  about_text,
  instagram_url,
  whatsapp,
  email,
  about_portraits,
  seo_title,
  seo_description,
  seo_keywords
)
SELECT
  'FISAYOVIEW',
  E'I''m Obalana Fisayo — the lead photographer, creative and the mind behind fisayoview.\n\nWhat you see on this page isn''t just photography.\nIts intention, It''s detail, It''s understanding people beyond the surface. Every frame I create is built on one thing and that''s making you feel seen not just photographed.\n\nFrom portraits to events, I focus on capturing moments in a way that actually means something because anyone can take a picture but not everyone can tell your story properly.\n\nIf you''re new here, you''re in the right place. Let''s create something timeless.',
  'https://www.instagram.com/fisayoview/',
  '+2348136404224',
  'bookfisayoview@gmail.com',
  '[
    {"cloudinary_public_id":"fisayoview/about/IMG_9296","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296","sort_order":0},
    {"cloudinary_public_id":"fisayoview/about/IMG_9297_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy","sort_order":1},
    {"cloudinary_public_id":"fisayoview/about/IMG_9309","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309","sort_order":2},
    {"cloudinary_public_id":"fisayoview/about/IMG_9322_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy","sort_order":3},
    {"cloudinary_public_id":"fisayoview/about/S_PX1005_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy","sort_order":4}
  ]'::jsonb,
  'FISAYOVIEW — Photography by Fisayo Obalana',
  'FISAYOVIEW is the photography portfolio of Fisayo Obalana — capturing birthdays, weddings, graduations, studio sessions and portraits across Nigeria with intention and detail.',
  'fisayoview, Fisayo Obalana, photographer Nigeria, portrait photographer Lagos, birthday photographer Nigeria, wedding photographer Lagos'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- 4. If row already exists, fill about_portraits if still empty
UPDATE site_settings
SET about_portraits = '[
    {"cloudinary_public_id":"fisayoview/about/IMG_9296","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9296","sort_order":0},
    {"cloudinary_public_id":"fisayoview/about/IMG_9297_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9297_copy","sort_order":1},
    {"cloudinary_public_id":"fisayoview/about/IMG_9309","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9309","sort_order":2},
    {"cloudinary_public_id":"fisayoview/about/IMG_9322_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/IMG_9322_copy","sort_order":3},
    {"cloudinary_public_id":"fisayoview/about/S_PX1005_copy","url":"https://res.cloudinary.com/oluwatosin17/image/upload/f_auto,q_auto/fisayoview/about/S_PX1005_copy","sort_order":4}
  ]'::jsonb
WHERE (about_portraits IS NULL OR about_portraits = '[]'::jsonb);

-- 5. Mark first 6 collections as featured (homepage showcase)
UPDATE collections SET featured = true WHERE display_order <= 6;

-- 6. Fix sequences after manual ID inserts (prevents "duplicate key" on new collections/images)
SELECT setval(pg_get_serial_sequence('collections', 'id'), (SELECT MAX(id) FROM collections));
SELECT setval(pg_get_serial_sequence('images', 'id'), (SELECT MAX(id) FROM images));

-- 7. Grant RLS access for service role (admin key bypasses RLS anyway, this is for anon reads)
-- Public can read site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Public read site_settings'
  ) THEN
    CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
  END IF;
END $$;
