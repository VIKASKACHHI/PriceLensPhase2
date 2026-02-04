import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, MapPin, Phone, ArrowLeft, Tag, Star, Calendar, Gift, Percent } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductReviewDialog } from '@/components/reviews/ProductReviewDialog';
import { StarRating } from '@/components/reviews/StarRating';
import { StockBadge } from '@/components/inventory/StockBadge';
import { OfferBadge } from '@/components/offers/OfferBadge';
import { OfferAlert } from '@/components/offers/OfferAlert';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type StockStatus = Database['public']['Enums']['stock_status'];

interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  general_discount_description: string | null;
  has_general_discount: boolean;
  apply_discount_to_all: boolean;
}

interface ProductWithReview {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number;
  show_sale_alert: boolean;
  image_url: string | null;
  category: string | null;
  stock_status: StockStatus;
  stock_quantity: number | null;
  restock_date: string | null;
  special_offer_description: string | null;
  has_special_offer: boolean;
  use_shop_discount: boolean;
  avg_rating: number;
  review_count: number;
}

export default function ShopDetail() {
  const { shopId } = useParams<{ shopId: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<ProductWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithReview | null>(null);

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    setLoading(true);

    // Fetch shop
    const { data: shopData } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .eq('is_active', true)
      .maybeSingle();

    if (shopData) {
      setShop(shopData as Shop);

      // Fetch all products (show all stock statuses)
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId);

      if (productsData) {
        // Fetch average ratings for each product
        const productsWithRatings = await Promise.all(
          productsData.map(async (product) => {
            const { data: reviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('product_id', product.id);

            const reviewCount = reviews?.length || 0;
            const avgRating = reviewCount > 0
              ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;

            return {
              ...product,
              avg_rating: avgRating,
              review_count: reviewCount,
            } as ProductWithReview;
          })
        );

        setProducts(productsWithRatings);
      }
    }

    setLoading(false);
  };

  const openGoogleMaps = () => {
    if (shop) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
            <p className="text-muted-foreground mb-4">This shop doesn't exist or is no longer active.</p>
            <Link to="/search">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/search" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>

          {/* Shop Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{shop.name}</h1>
                  <p className="text-muted-foreground mb-4">Owned by {shop.owner_name}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => window.open(`tel:${shop.phone}`, '_self')}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button onClick={openGoogleMaps}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </div>

              {/* Shop-wide Discount Alert */}
              {shop.has_general_discount && shop.general_discount_description && (
                <OfferAlert 
                  type="discount" 
                  description={shop.general_discount_description} 
                  className="mt-6"
                />
              )}
            </CardContent>
          </Card>

          {/* Products */}
          <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
          
          {products.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {products
                .sort((a, b) => {
                  // Out of stock items go to the bottom
                  if (a.stock_status === 'out_of_stock' && b.stock_status !== 'out_of_stock') return 1;
                  if (a.stock_status !== 'out_of_stock' && b.stock_status === 'out_of_stock') return -1;
                  return 0;
                })
                .map((product) => {
                  const isOutOfStock = product.stock_status === 'out_of_stock';
                  const hasShopDiscount = shop.has_general_discount && 
                    (shop.apply_discount_to_all || product.use_shop_discount);

                  return (
                    <Card 
                      key={product.id} 
                      className={`overflow-hidden hover:shadow-card-hover transition-shadow ${isOutOfStock ? 'opacity-75' : ''}`}
                    >
                      <CardContent className="p-4">
                        {/* Special Offer Alert */}
                        {product.has_special_offer && product.special_offer_description && !isOutOfStock && (
                          <OfferAlert 
                            type="special" 
                            description={product.special_offer_description} 
                            className="mb-4"
                          />
                        )}

                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
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

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <h3 className="font-semibold truncate">{product.name}</h3>
                              {product.show_sale_alert && product.is_on_sale && !isOutOfStock && (
                                <span className="sale-badge flex-shrink-0">
                                  -{product.sale_percentage}%
                                </span>
                              )}
                            </div>

                            {/* Offer Badges */}
                            {!isOutOfStock && (product.has_special_offer || hasShopDiscount) && (
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {product.has_special_offer && product.special_offer_description && (
                                  <OfferBadge type="special" description={product.special_offer_description} />
                                )}
                                {hasShopDiscount && shop.general_discount_description && (
                                  <OfferBadge type="discount" description={shop.general_discount_description} />
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

                            {/* Restock Date for out of stock items */}
                            {isOutOfStock && product.restock_date && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expected: {new Date(product.restock_date).toLocaleDateString()}
                              </p>
                            )}

                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {product.description}
                              </p>
                            )}

                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="price-tag">₹{product.price.toFixed(2)}</span>
                              {product.is_on_sale && product.original_price && (
                                <span className="original-price">₹{product.original_price.toFixed(2)}</span>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-2">
                              <StarRating rating={product.avg_rating} size="sm" />
                              <span className="text-sm text-muted-foreground">
                                ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-primary"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Reviews & Rate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products available at this shop.</p>
            </div>
          )}

          {/* Review Dialog */}
          {selectedProduct && (
            <ProductReviewDialog
              product={selectedProduct}
              open={!!selectedProduct}
              onClose={() => {
                setSelectedProduct(null);
                fetchShopDetails(); // Refresh to get updated ratings
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
