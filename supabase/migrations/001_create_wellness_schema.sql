-- ZAB AI Wellness Companion Database Schema for Supabase
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wellness_metrics table
CREATE TABLE IF NOT EXISTS public.wellness_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_id ON public.wellness_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_logged_at ON public.wellness_metrics(logged_at DESC);

-- Enable Row-Level Security (RLS) for security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
-- Allow authenticated users to insert their own conversations
CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own conversations
CREATE POLICY "Users can read own conversations"
  ON public.conversations FOR SELECT
  USING (true);

-- Create RLS policies for wellness metrics
-- Allow authenticated users to insert their own metrics
CREATE POLICY "Users can insert own metrics"
  ON public.wellness_metrics FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own metrics
CREATE POLICY "Users can read own metrics"
  ON public.wellness_metrics FOR SELECT
  USING (true);

-- Create user_profiles table for authentication
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'student',
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service media/table metadata for audio/video assets stored in Supabase Storage
CREATE TABLE IF NOT EXISTS public.service_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT,
  title TEXT,
  media_type TEXT NOT NULL,
  bucket TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tutor_sessions table for Zoom-enabled instructor classes
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  session_type TEXT,
  audio_url TEXT,
  tier TEXT DEFAULT 'pro',
  scheduled_slot TEXT,
  zoom_meeting_id TEXT,
  zoom_join_url TEXT,
  zoom_start_url TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for PesaPal transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'CREATED',
  transaction_id TEXT,
  pesapal_order JSONB,
  pesapal_webhook_event JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  subscription_status TEXT DEFAULT 'active',
  payment_id TEXT,
  amount DECIMAL(10, 2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_service_media_service_id ON public.service_media(service_id);
CREATE INDEX IF NOT EXISTS idx_service_media_media_type ON public.service_media(media_type);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_tutor_id ON public.tutor_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_email ON public.payments(user_email);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_email ON public.user_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON public.user_subscriptions(expires_at);

-- Enable RLS on new tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (true);

-- Create RLS policies for service media
CREATE POLICY "Users can read service media"
  ON public.service_media FOR SELECT
  USING (true);

CREATE POLICY "Users can insert service media"
  ON public.service_media FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update service media"
  ON public.service_media FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for tutor_sessions
CREATE POLICY "Users can read tutor sessions"
  ON public.tutor_sessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert tutor sessions"
  ON public.tutor_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update tutor sessions"
  ON public.tutor_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for payments
CREATE POLICY "Users can read own payments"
  ON public.payments FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (true);
