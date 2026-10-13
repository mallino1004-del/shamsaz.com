CREATE TABLE practitioner_categories (
 id TEXT PRIMARY KEY, label TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE public_practitioners (
 id TEXT PRIMARY KEY, display_name TEXT NOT NULL, specialty TEXT NOT NULL,
 category_id TEXT NOT NULL REFERENCES practitioner_categories(id),
 city TEXT NOT NULL, address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '',
 source_url TEXT NOT NULL CHECK(source_url LIKE 'https://%'), image_source_url TEXT,
 source_checked_at TIMESTAMPTZ NOT NULL, imported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 photo_bytes BYTEA, photo_mime TEXT CHECK(photo_mime IN ('image/jpeg','image/png','image/webp')),
 photo_fetched_at TIMESTAMPTZ, account_id TEXT UNIQUE REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'published' CHECK(status IN ('published','hidden')),
 CHECK((photo_bytes IS NULL AND photo_mime IS NULL) OR (photo_bytes IS NOT NULL AND photo_mime IS NOT NULL)),
 CHECK(photo_bytes IS NULL OR octet_length(photo_bytes)<=2097152)
);
CREATE INDEX public_practitioners_category_city ON public_practitioners(category_id,city) WHERE status='published';
