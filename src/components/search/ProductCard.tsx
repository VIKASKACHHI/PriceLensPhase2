import { Store, MapPin, Navigation, Tag, Phone, Gift, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/reviews/StarRating';
import { StockBadge } from '@/components/inventory/StockBadge';
import { OfferBadge } from '@/components/offers/OfferBadge';
import { OfferAlert } from '@/components/offers/OfferAlert';
import { Database } from '@/integrations/supabase/types';

type StockStatus = Database['public']['Enums']['stock_status'];

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number;
  show_sale_alert: boolean;
  image_url: string | null;
  stock_status: StockStatus;
  stock_quantity: number | null;
  special_offer_description?: string | null;
  has_special_offer?: boolean;
  use_shop_discount?: boolean;
  shop: {
    id: string;
    name: string;
    phone: string;
    address: string;
    latitude: number;
    longitude: number;
    general_discount_description?: string | null;
    has_general_discount?: boolean;
    apply_discount_to_all?: boolean;
  };
  distance: number;
  avg_rating?: number;
  review_count?: number;
}

interface ProductCardProps {
  product: Product;
  onNavigate: () => void;
}

export function ProductCard({ product, onNavigate }: ProductCardProps) {
  const isOutOfStock = product.stock_status === 'out_of_stock';

  // Determine if shop discount applies to this product
  const hasShopDiscount = product.shop.has_general_discount && 
    (product.shop.apply_discount_to_all || product.use_shop_discount);

  return (
    <Card className={`overflow-hidden hover:shadow-card-hover transition-shadow duration-300 animate-fade-in ${isOutOfStock ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        {/* Special Offer Alert */}
        {product.has_special_offer && product.special_offer_description && !isOutOfStock && (
          <OfferAlert 
            type="special" 
            description={product.special_offer_description} 
            className="mb-4"
          />
        )}

        {/* Shop Discount Alert */}
        {hasShopDiscount && product.shop.general_discount_description && !isOutOfStock && (
          <OfferAlert 
            type="discount" 
            description={product.shop.general_discount_description} 
            className="mb-4"
          />
        )}

        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden relative">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`}
              />
            ) : (
              <Tag className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
              <div className="flex items-center gap-2">
                {product.show_sale_alert && product.is_on_sale && !isOutOfStock && (
                  <span className="sale-badge flex-shrink-0">
                    -{product.sale_percentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Offer Badges */}
            {!isOutOfStock && (product.has_special_offer || hasShopDiscount) && (
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {product.has_special_offer && product.special_offer_description && (
                  <OfferBadge type="special" description={product.special_offer_description} />
                )}
                {hasShopDiscount && product.shop.general_discount_description && (
                  <OfferBadge type="discount" description={product.shop.general_discount_description} />
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="mt-1">
              <StockBadge 
                status={product.stock_status} 
                quantity={product.stock_quantity}
              />
            </div>

            {/* Rating */}
            {product.avg_rating !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={product.avg_rating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  ({product.review_count || 0})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="price-tag">₹{product.price.toFixed(2)}</span>
              {product.is_on_sale && product.original_price && (
                <span className="original-price">₹{product.original_price.toFixed(2)}</span>
              )}
            </div>

            {/* Shop Info */}
            <div className="mt-2 space-y-1">
              <Link 
                to={`/shop/${product.shop.id}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Store className="h-3 w-3" />
                <span className="truncate">{product.shop.name}</span>
              </Link>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{product.distance.toFixed(1)} km away</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={() => window.open(`tel:${product.shop.phone}`, '_self')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button 
            size="sm" 
            className="flex-1 gap-2"
            onClick={onNavigate}
            disabled={isOutOfStock}
          >
            <Navigation className="h-4 w-4" />
            {isOutOfStock ? 'Out of Stock' : 'Directions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
