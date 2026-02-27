-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'barber', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Barbers table
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT,
  bio TEXT,
  cover_photo_url TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  address TEXT,
  city TEXT,
  municipality TEXT,
  whatsapp TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  is_vip BOOLEAN DEFAULT false,
  offers_home_visit BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT,
  name_fr TEXT,
  description_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Work gallery table
CREATE TABLE public.work_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.work_gallery ENABLE ROW LEVEL SECURITY;

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, barber_id, booking_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, barber_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for barbers
CREATE POLICY "Barbers are viewable by everyone"
  ON public.barbers FOR SELECT
  USING (true);

CREATE POLICY "Barbers can update their own profile"
  ON public.barbers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Barbers can insert their own profile"
  ON public.barbers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any barber"
  ON public.barbers FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services
CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage their own services"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.barbers
      WHERE barbers.id = services.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

-- RLS Policies for work_gallery
CREATE POLICY "Gallery is viewable by everyone"
  ON public.work_gallery FOR SELECT
  USING (true);

CREATE POLICY "Barbers can manage their own gallery"
  ON public.work_gallery FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.barbers
      WHERE barbers.id = work_gallery.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (
      SELECT 1 FROM public.barbers
      WHERE barbers.id = bookings.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Barbers can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.barbers
      WHERE barbers.id = bookings.barber_id
      AND barbers.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can cancel their bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = customer_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = customer_id);

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = customer_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update barber rating
CREATE OR REPLACE FUNCTION public.update_barber_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.barbers
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE barber_id = NEW.barber_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE barber_id = NEW.barber_id
    )
  WHERE id = NEW.barber_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_barber_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();