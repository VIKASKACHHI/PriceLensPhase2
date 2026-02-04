-- Add special offers to products table
ALTER TABLE public.products 
ADD COLUMN special_offer_description text,
ADD COLUMN has_special_offer boolean NOT NULL DEFAULT false,
ADD COLUMN use_shop_discount boolean NOT NULL DEFAULT true;

-- Add general discount to shops table
ALTER TABLE public.shops
ADD COLUMN general_discount_description text,
ADD COLUMN has_general_discount boolean NOT NULL DEFAULT false,
ADD COLUMN apply_discount_to_all boolean NOT NULL DEFAULT true;