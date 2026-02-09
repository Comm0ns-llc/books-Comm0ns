-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
CREATE TYPE book_status AS ENUM ('available', 'lent_out', 'private', 'reading');
CREATE TYPE book_condition AS ENUM ('new', 'good', 'fair', 'poor');
CREATE TYPE loan_status AS ENUM ('requested', 'approved', 'active', 'returned', 'rejected');
CREATE TYPE review_visibility AS ENUM ('public', 'community', 'private');
CREATE TYPE notification_type AS ENUM (
  'loan_request', 'loan_approved', 'loan_returned',
  'new_review', 'recommendation'
);

-- Users (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  invited_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Books (master catalog)
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(13) UNIQUE,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(200),
  publisher VARCHAR(200),
  published_date DATE,
  cover_url TEXT,
  description TEXT,
  genre VARCHAR(50)[],
  page_count INTEGER
);

-- User Books (personal collection)
CREATE TABLE public.user_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  book_id UUID NOT NULL REFERENCES public.books(id),
  status book_status DEFAULT 'available',
  condition book_condition DEFAULT 'good',
  note TEXT,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Loans
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_book_id UUID NOT NULL REFERENCES public.user_books(id),
  borrower_id UUID NOT NULL REFERENCES public.users(id),
  status loan_status DEFAULT 'requested',
  requested_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  lent_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  message TEXT
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id),
  user_id UUID NOT NULL REFERENCES public.users(id),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  body TEXT,
  read_at DATE,
  visibility review_visibility DEFAULT 'community',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  receiver_id UUID NOT NULL REFERENCES public.users(id),
  loan_id UUID REFERENCES public.loans(id),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type notification_type NOT NULL,
  reference_id UUID,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Invitations
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.users(id),
  code VARCHAR(20) UNIQUE NOT NULL,
  used_by UUID REFERENCES public.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_books_user ON public.user_books(user_id);
CREATE INDEX idx_user_books_book ON public.user_books(book_id);
CREATE INDEX idx_user_books_status ON public.user_books(status);
CREATE INDEX idx_loans_borrower ON public.loans(borrower_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_reviews_book ON public.reviews(book_id);
CREATE INDEX idx_reviews_user ON public.reviews(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_books_title ON public.books USING gin(to_tsvector('japanese', title));
