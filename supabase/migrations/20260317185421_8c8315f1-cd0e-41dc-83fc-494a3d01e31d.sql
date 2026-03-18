
-- Create prices table for historical price tracking
CREATE TABLE public.prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create predictions table for ML forecasts
CREATE TABLE public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  forecast jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend text NOT NULL DEFAULT 'stable',
  recommendation text NOT NULL DEFAULT 'WAIT',
  confidence text NOT NULL DEFAULT 'LOW',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate price entries per product per day
ALTER TABLE public.prices ADD CONSTRAINT prices_product_date_unique UNIQUE (product_id, date);

-- Add unique constraint for one prediction per product
ALTER TABLE public.predictions ADD CONSTRAINT predictions_product_unique UNIQUE (product_id);

-- Enable RLS
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Prices: anyone can read (public data)
CREATE POLICY "Anyone can view prices" ON public.prices FOR SELECT TO public USING (true);

-- Prices: shop owners can insert prices for their products
CREATE POLICY "Shop owners can insert prices" ON public.prices FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.products p
  JOIN public.shops s ON s.id = p.shop_id
  WHERE p.id = prices.product_id AND s.owner_id = auth.uid()
));

-- Predictions: anyone can read
CREATE POLICY "Anyone can view predictions" ON public.predictions FOR SELECT TO public USING (true);

-- Predictions: only service role will insert/update (for ML pipeline), but allow authenticated for now
CREATE POLICY "Authenticated can manage predictions" ON public.predictions FOR ALL TO authenticated USING (true) WITH CHECK (true);
