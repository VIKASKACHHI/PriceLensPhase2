-- Create enum for stock status
CREATE TYPE public.stock_status AS ENUM ('in_stock', 'limited', 'out_of_stock');

-- Add stock tracking columns to products
ALTER TABLE public.products
ADD COLUMN stock_status public.stock_status NOT NULL DEFAULT 'in_stock',
ADD COLUMN stock_quantity integer DEFAULT NULL,
ADD COLUMN restock_date date DEFAULT NULL;