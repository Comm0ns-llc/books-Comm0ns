-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Users: read public info, update own
DROP POLICY IF EXISTS "Users: read all" ON public.users;
DROP POLICY IF EXISTS "Users: update own" ON public.users;
CREATE POLICY "Users: read all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users: update own" ON public.users FOR UPDATE USING (auth.uid() = id);

-- User Books: CRUD own, read non-private
DROP POLICY IF EXISTS "User books: read non-private" ON public.user_books;
DROP POLICY IF EXISTS "User books: insert own" ON public.user_books;
DROP POLICY IF EXISTS "User books: update own" ON public.user_books;
DROP POLICY IF EXISTS "User books: delete own" ON public.user_books;
CREATE POLICY "User books: read non-private" ON public.user_books
  FOR SELECT USING (status != 'private' OR user_id = auth.uid());
CREATE POLICY "User books: insert own" ON public.user_books
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "User books: update own" ON public.user_books
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "User books: delete own" ON public.user_books
  FOR DELETE USING (user_id = auth.uid());

-- Loans: read if participant, write in role scope
DROP POLICY IF EXISTS "Loans: read as participant" ON public.loans;
DROP POLICY IF EXISTS "Loans: create as borrower" ON public.loans;
DROP POLICY IF EXISTS "Loans: owner can update" ON public.loans;
CREATE POLICY "Loans: read as participant" ON public.loans
  FOR SELECT USING (
    borrower_id = auth.uid() OR
    user_book_id IN (SELECT id FROM public.user_books WHERE user_id = auth.uid())
  );
CREATE POLICY "Loans: create as borrower" ON public.loans
  FOR INSERT WITH CHECK (borrower_id = auth.uid());
CREATE POLICY "Loans: owner can update" ON public.loans
  FOR UPDATE USING (
    user_book_id IN (SELECT id FROM public.user_books WHERE user_id = auth.uid())
  );

-- Reviews: read public/community, CRUD own
DROP POLICY IF EXISTS "Reviews: read visible" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: insert own" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: update own" ON public.reviews;
DROP POLICY IF EXISTS "Reviews: delete own" ON public.reviews;
CREATE POLICY "Reviews: read visible" ON public.reviews
  FOR SELECT USING (visibility != 'private' OR user_id = auth.uid());
CREATE POLICY "Reviews: insert own" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Reviews: update own" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Reviews: delete own" ON public.reviews
  FOR DELETE USING (user_id = auth.uid());

-- Messages: read if sender or receiver
DROP POLICY IF EXISTS "Messages: read own" ON public.messages;
DROP POLICY IF EXISTS "Messages: send as self" ON public.messages;
CREATE POLICY "Messages: read own" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Messages: send as self" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications: read/update own
DROP POLICY IF EXISTS "Notifications: read own" ON public.notifications;
DROP POLICY IF EXISTS "Notifications: update own" ON public.notifications;
CREATE POLICY "Notifications: read own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications: update own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Invitations: inviter can CRUD, anyone can validate by code read
DROP POLICY IF EXISTS "Invitations: read own or open lookup" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: insert own" ON public.invitations;
DROP POLICY IF EXISTS "Invitations: update own" ON public.invitations;
CREATE POLICY "Invitations: read own or open lookup" ON public.invitations
  FOR SELECT USING (inviter_id = auth.uid() OR used_by IS NULL);
CREATE POLICY "Invitations: insert own" ON public.invitations
  FOR INSERT WITH CHECK (inviter_id = auth.uid());
CREATE POLICY "Invitations: update own" ON public.invitations
  FOR UPDATE USING (inviter_id = auth.uid() OR used_by = auth.uid());
