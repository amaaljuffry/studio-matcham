-- For 'cafes' table
ALTER TABLE public.cafes
DROP COLUMN IF EXISTS socialinstagram,
DROP COLUMN IF EXISTS socialfacebook,
DROP COLUMN IF EXISTS socialtwitter,
DROP COLUMN IF EXISTS socialtiktok;

-- For 'pending_cafes' table
ALTER TABLE public.pending_cafes
DROP COLUMN IF EXISTS socialinstagram,
DROP COLUMN IF EXISTS socialfacebook,
DROP COLUMN IF EXISTS socialtwitter,
DROP COLUMN IF EXISTS socialtiktok;