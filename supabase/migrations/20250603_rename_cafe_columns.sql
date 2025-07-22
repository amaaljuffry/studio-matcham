-- For 'cafes' table
ALTER TABLE public.cafes
DROP COLUMN IF EXISTS socialmedialinks, -- Drop the old JSONB column if it exists
ADD COLUMN websitelink TEXT,
ADD COLUMN socialwhatsapp TEXT;

-- For 'pending_cafes' table
ALTER TABLE public.pending_cafes
DROP COLUMN IF EXISTS socialmedialinks, -- Drop the old JSONB column if it exists
ADD COLUMN websitelink TEXT,
ADD COLUMN socialwhatsapp TEXT;

    -- Example: Migrate existing website links (run BEFORE dropping socialmedialinks)
    UPDATE public.cafes
    SET websitelink = socialmedialinks->>'website'
    WHERE socialmedialinks->>'website' IS NOT NULL;

    -- Example: Migrate existing whatsapp links/numbers
    UPDATE public.cafes
    SET socialwhatsapp = socialmedialinks->>'whatsapp'
    WHERE socialmedialinks->>'whatsapp' IS NOT NULL;

    -- Do the same for public.pending_cafes if it also has existing data.