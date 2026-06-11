-- ──────────────────────────────────────────────────────────────────────────────
-- FISAYOVIEW Admin Schema
-- Run this in the Supabase SQL editor
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Add optional columns to collections table
ALTER TABLE collections
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- 2. Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id              serial PRIMARY KEY,
  instagram_url   text,
  whatsapp        text,
  email           text,
  about_text      text,
  about_heading   text,
  seo_title       text,
  seo_description text,
  seo_keywords    text,
  og_image        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Trigger: keep updated_at fresh
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Insert a default row if none exists
INSERT INTO site_settings (
  instagram_url, whatsapp, email,
  about_heading, about_text,
  seo_title, seo_description, seo_keywords
)
SELECT
  'https://instagram.com/fisayoview',
  '+2348000000000',
  'bookfisayoview@gmail.com',
  'About Fisayo',
  'Fisayo is a Nigerian-based photographer specialising in portraits, weddings, and editorial work.',
  'Fisayoview Photography',
  'Professional photography by Fisayoview — weddings, birthdays, graduations, and studio sessions.',
  'photography, Nigeria, wedding photographer, portrait photographer, fisayoview'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- ──────────────────────────────────────────────────────────────────────────────
-- RLS Policies
-- ──────────────────────────────────────────────────────────────────────────────

-- collections ──────────────────────────────────────────────────────────────────
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_collections" ON collections;
CREATE POLICY "public_select_collections"
  ON collections FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_collections" ON collections;
CREATE POLICY "admin_all_collections"
  ON collections FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  );

-- images ───────────────────────────────────────────────────────────────────────
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_images" ON images;
CREATE POLICY "public_select_images"
  ON images FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_images" ON images;
CREATE POLICY "admin_all_images"
  ON images FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  );

-- site_settings ────────────────────────────────────────────────────────────────
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_site_settings" ON site_settings;
CREATE POLICY "public_select_site_settings"
  ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_site_settings" ON site_settings;
CREATE POLICY "admin_all_site_settings"
  ON site_settings FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.email() IN ('bookfisayoview@gmail.com', 'obalanatosin16@gmail.com')
  );
