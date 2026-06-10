-- ─────────────────────────────────────────────────────────────────────────────
-- FISAYOVIEW — Supabase Schema
-- Run this in the Supabase SQL editor (project dashboard → SQL editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Collections (projects / photo shoots)
CREATE TABLE IF NOT EXISTS collections (
  id                    SERIAL        PRIMARY KEY,
  name                  TEXT          NOT NULL,
  slug                  TEXT          UNIQUE NOT NULL,
  category              TEXT          NOT NULL CHECK (category IN ('WEDDING','BIRTHDAY','GRADUATION','LAW','OTHER')),
  folder_name           TEXT,                          -- original local folder path
  cover_cloudinary_id   TEXT,                          -- Cloudinary public_id for gallery card
  cover_url             TEXT,                          -- pre-built Cloudinary delivery URL
  label_bg_url          TEXT,                          -- for ABIODUN bg-clip-text effect
  instagram_url         TEXT,
  handle                TEXT,
  caption               TEXT,
  display_order         INT           NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Individual images within a collection
CREATE TABLE IF NOT EXISTS images (
  id                    SERIAL        PRIMARY KEY,
  collection_id         INT           NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  cloudinary_public_id  TEXT          NOT NULL,
  url                   TEXT          NOT NULL,        -- delivery URL (auto format + quality)
  filename              TEXT,                          -- original filename on disk
  width                 INT,
  height                INT,
  sort_order            INT           NOT NULL DEFAULT 0,
  is_cover              BOOLEAN       NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_collection ON images(collection_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_collections_order  ON collections(display_order);
CREATE INDEX IF NOT EXISTS idx_collections_slug   ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_cat    ON collections(category);

-- Enable Row Level Security (read-only public access)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE images      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Public read images" ON images
  FOR SELECT USING (true);
