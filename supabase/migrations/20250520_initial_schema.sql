-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  average_rating DECIMAL(3,2),
  is_verified_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create skill_categories table
CREATE TABLE IF NOT EXISTS public.skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_category_id UUID REFERENCES public.skill_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_locations table with PostGIS
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  address_text TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  geom GEOGRAPHY(POINT) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create skill_offers table
CREATE TABLE IF NOT EXISTS public.skill_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.skill_categories(id),
  exchange_type TEXT NOT NULL CHECK (exchange_type IN ('paid', 'barter', 'free')),
  price DECIMAL(10,2),
  currency TEXT,
  availability_details TEXT,
  service_area_type TEXT CHECK (service_area_type IN ('local', 'radius')),
  service_radius_km DECIMAL(5,2),
  media_urls JSONB,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create skill_requests table
CREATE TABLE IF NOT EXISTS public.skill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.skill_categories(id),
  exchange_type TEXT NOT NULL CHECK (exchange_type IN ('paid', 'barter', 'free')),
  preferred_timeframe TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create exchanges table
CREATE TABLE IF NOT EXISTS public.exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.skill_offers(id),
  request_id UUID REFERENCES public.skill_requests(id),
  provider_id UUID REFERENCES public.profiles(id) NOT NULL,
  seeker_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  agreed_terms TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id UUID REFERENCES public.exchanges(id) NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id),
  reported_offer_id UUID REFERENCES public.skill_offers(id),
  reported_request_id UUID REFERENCES public.skill_requests(id),
  reported_message_id UUID REFERENCES public.messages(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'reviewed', 'action_taken')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies

-- Profiles: Users can read any profile but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Skill Categories: Anyone can view categories, only admins can modify (to be implemented)
CREATE POLICY "Skill categories are viewable by everyone" ON public.skill_categories
  FOR SELECT USING (true);

-- User Locations: Users can view and manage their own locations
CREATE POLICY "Users can view their own locations" ON public.user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" ON public.user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" ON public.user_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" ON public.user_locations
  FOR DELETE USING (auth.uid() = user_id);

-- Skill Offers: Anyone can view active offers, users can manage their own
CREATE POLICY "Active skill offers are viewable by everyone" ON public.skill_offers
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill offers" ON public.skill_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill offers" ON public.skill_offers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill offers" ON public.skill_offers
  FOR DELETE USING (auth.uid() = user_id);

-- Skill Requests: Similar to offers
CREATE POLICY "Active skill requests are viewable by everyone" ON public.skill_requests
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill requests" ON public.skill_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill requests" ON public.skill_requests
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill requests" ON public.skill_requests
  FOR DELETE USING (auth.uid() = user_id);

-- Exchanges: Participants can view their exchanges
CREATE POLICY "Users can view exchanges they're part of" ON public.exchanges
  FOR SELECT USING (auth.uid() = provider_id OR auth.uid() = seeker_id);

CREATE POLICY "Users can insert exchanges they're part of" ON public.exchanges
  FOR INSERT WITH CHECK (auth.uid() = provider_id OR auth.uid() = seeker_id);

CREATE POLICY "Users can update exchanges they're part of" ON public.exchanges
  FOR UPDATE USING (auth.uid() = provider_id OR auth.uid() = seeker_id);

-- Reviews: Anyone can view reviews, only exchange participants can create
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews for exchanges they're part of" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND 
    EXISTS (
      SELECT 1 FROM public.exchanges 
      WHERE id = exchange_id AND (provider_id = auth.uid() OR seeker_id = auth.uid())
    )
  );

-- Conversations & Messages: Only participants can view and interact
CREATE POLICY "Users can view conversations they're part of" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in conversations they're part of" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in conversations they're part of" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_categories_updated_at
  BEFORE UPDATE ON public.skill_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at
  BEFORE UPDATE ON public.user_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_offers_updated_at
  BEFORE UPDATE ON public.skill_offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_requests_updated_at
  BEFORE UPDATE ON public.skill_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchanges_updated_at
  BEFORE UPDATE ON public.exchanges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update average_rating in profiles
CREATE OR REPLACE FUNCTION update_profile_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET average_rating = (
    SELECT AVG(rating)
    FROM public.reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating average_rating
CREATE TRIGGER update_profile_rating_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_profile_average_rating();