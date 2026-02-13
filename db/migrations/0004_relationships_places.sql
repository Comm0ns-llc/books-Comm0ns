-- User verification status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('unverified', 'active');
  END IF;
END;
$$;

-- Relationship and place enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE relationship_type AS ENUM (
      'family',
      'friend',
      'housemate',
      'colleague',
      'mentor',
      'community',
      'other'
    );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_type') THEN
    CREATE TYPE place_type AS ENUM ('home', 'share_house', 'office', 'community_space', 'other');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_member_role') THEN
    CREATE TYPE place_member_role AS ENUM ('admin', 'member');
  END IF;
END;
$$;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'unverified';

CREATE TABLE IF NOT EXISTS public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type relationship_type NOT NULL DEFAULT 'community',
  note TEXT,
  confirmed_by_a BOOLEAN NOT NULL DEFAULT false,
  confirmed_by_b BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a_id <> user_b_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_relationships_pair
  ON public.relationships(LEAST(user_a_id, user_b_id), GREATEST(user_a_id, user_b_id));
CREATE INDEX IF NOT EXISTS idx_relationships_user_a ON public.relationships(user_a_id);
CREATE INDEX IF NOT EXISTS idx_relationships_user_b ON public.relationships(user_b_id);

CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  type place_type NOT NULL DEFAULT 'other',
  area VARCHAR(120),
  address TEXT,
  description TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.place_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role place_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(place_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_place_members_place ON public.place_members(place_id);
CREATE INDEX IF NOT EXISTS idx_place_members_user ON public.place_members(user_id);

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relationships: read own" ON public.relationships;
DROP POLICY IF EXISTS "Relationships: write own" ON public.relationships;
CREATE POLICY "Relationships: read own" ON public.relationships
  FOR SELECT USING (user_a_id = auth.uid() OR user_b_id = auth.uid());
CREATE POLICY "Relationships: write own" ON public.relationships
  FOR ALL USING (user_a_id = auth.uid() OR user_b_id = auth.uid())
  WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

DROP POLICY IF EXISTS "Places: read where member" ON public.places;
DROP POLICY IF EXISTS "Places: create own" ON public.places;
DROP POLICY IF EXISTS "Places: update as admin" ON public.places;
DROP POLICY IF EXISTS "Places: delete as admin" ON public.places;
CREATE POLICY "Places: read where member" ON public.places
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = places.id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Places: create own" ON public.places
  FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Places: update as admin" ON public.places
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = places.id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );
CREATE POLICY "Places: delete as admin" ON public.places
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = places.id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Place members: read own places" ON public.place_members;
DROP POLICY IF EXISTS "Place members: insert as admin" ON public.place_members;
DROP POLICY IF EXISTS "Place members: update as admin" ON public.place_members;
DROP POLICY IF EXISTS "Place members: delete as admin" ON public.place_members;
CREATE POLICY "Place members: read own places" ON public.place_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = place_members.place_id AND pm.user_id = auth.uid()
    )
  );
CREATE POLICY "Place members: insert as admin" ON public.place_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = place_members.place_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );
CREATE POLICY "Place members: update as admin" ON public.place_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = place_members.place_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );
CREATE POLICY "Place members: delete as admin" ON public.place_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM public.place_members pm
      WHERE pm.place_id = place_members.place_id AND pm.user_id = auth.uid() AND pm.role = 'admin'
    )
  );
