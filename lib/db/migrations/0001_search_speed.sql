-- Enable pg_trgm for fast ILIKE operations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for faster title/description searches
CREATE INDEX IF NOT EXISTS images_title_trgm_idx ON images USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS images_description_trgm_idx ON images USING gin (description gin_trgm_ops);
