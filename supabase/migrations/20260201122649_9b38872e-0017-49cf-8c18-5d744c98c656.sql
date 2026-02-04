-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('customer', 'shopkeeper');

-- Create enum for shop categories
CREATE TYPE public.shop_category AS ENUM ('grocery', 'electronics', 'clothing', 'pharmacy', 'hardware', 'sports', 'books', 'home_appliances', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type user_type NOT NULL DEFAULT 'customer',
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  category shop_category NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  is_on_sale BOOLEAN NOT NULL DEFAULT false,
  sale_percentage INTEGER DEFAULT 0,
  show_sale_alert BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Shops policies (public read, owner write)
CREATE POLICY "Anyone can view active shops" 
ON public.shops FOR SELECT 
USING (is_active = true);

CREATE POLICY "Shopkeepers can insert their own shop" 
ON public.shops FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shopkeepers can update their own shop" 
ON public.shops FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Shopkeepers can delete their own shop" 
ON public.shops FOR DELETE 
USING (auth.uid() = owner_id);

-- Products policies (public read, shop owner write)
CREATE POLICY "Anyone can view products from active shops" 
ON public.products FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = products.shop_id 
    AND shops.is_active = true
  )
);

CREATE POLICY "Shop owners can insert products" 
ON public.products FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.owner_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can update their products" 
ON public.products FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.owner_id = auth.uid()
  )
);

CREATE POLICY "Shop owners can delete their products" 
ON public.products FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.shops 
    WHERE shops.id = shop_id 
    AND shops.owner_id = auth.uid()
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for products (for sale alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;