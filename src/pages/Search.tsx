import { useState, useEffect } from 'react';
import { Loader2, MapPin, AlertCircle, Store, Tag } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { ShopMap } from '@/components/map/ShopMap';
import { DistanceSlider } from '@/components/search/DistanceSlider';
import { SearchInput } from '@/components/search/SearchInput';
import { ProductCard } from '@/components/search/ProductCard';
import { ShopCard } from '@/components/search/ShopCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_DISTANCE_KM } from '@/lib/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface ShopWithDistance extends Shop {
  distance: number;
}

interface ProductWithShop {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  is_on_sale: boolean;
  sale_percentage: number;
  show_sale_alert: boolean;
  image_url: string | null;
  stock_status: 'in_stock' | 'limited' | 'out_of_stock';
  stock_quantity: number | null;
  special_offer_description: string | null;
  has_special_offer: boolean;
  use_shop_discount: boolean;
  shop: Shop & {
    general_discount_description?: string | null;
    has_general_discount?: boolean;
    apply_discount_to_all?: boolean;
  };
  distance: number;
  avg_rating: number;
  review_count: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SearchPage() {
  const { location, loading: locationLoading, error: locationError, refresh: refreshLocation } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [distance, setDistance] = useState(DEFAULT_DISTANCE_KM);
  const [shops, setShops] = useState<ShopWithDistance[]>([]);
  const [products, setProducts] = useState<ProductWithShop[]>([]);
  const [matchingShops, setMatchingShops] = useState<ShopWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('products');

  // Fetch shops within radius
  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        const nearbyShops = data
          .map(shop => ({
            ...shop,
            distance: calculateDistance(
              location.lat,
              location.lng,
              Number(shop.latitude),
              Number(shop.longitude)
            ),
          }))
          .filter(shop => shop.distance <= distance) as ShopWithDistance[];
        
        setShops(nearbyShops);
      }
    };

    fetchShops();
  }, [location, distance]);

  // Subscribe to real-time product updates
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          if (hasSearched) {
            handleSearch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hasSearched, searchQuery, location, distance]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    // Search products - include all stock statuses so users can see availability
    const { data: productsData } = await supabase
      .from('products')
      .select(`
        *,
        shop:shops(*)
      `)
      .ilike('name', `%${searchQuery}%`);

    // Search shops by name
    const { data: shopsData } = await supabase
      .from('shops')
      .select('*')
      .ilike('name', `%${searchQuery}%`)
      .eq('is_active', true);

    if (productsData) {
      const productsWithDistance = await Promise.all(
        productsData
          .filter(product => product.shop)
          .map(async (product) => {
            const dist = calculateDistance(
              location.lat,
              location.lng,
              Number(product.shop.latitude),
              Number(product.shop.longitude)
            );

            // Fetch reviews for this product
            const { data: reviews } = await supabase
              .from('reviews')
              .select('rating')
              .eq('product_id', product.id);

            const reviewCount = reviews?.length || 0;
            const avgRating = reviewCount > 0
              ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
              : 0;

            return {
              id: product.id,
              name: product.name,
              price: Number(product.price),
              original_price: product.original_price ? Number(product.original_price) : null,
              is_on_sale: product.is_on_sale,
              sale_percentage: product.sale_percentage || 0,
              show_sale_alert: product.show_sale_alert,
              image_url: product.image_url,
              stock_status: product.stock_status,
              stock_quantity: product.stock_quantity,
              special_offer_description: product.special_offer_description,
              has_special_offer: product.has_special_offer,
              use_shop_discount: product.use_shop_discount,
              shop: product.shop,
              distance: dist,
              avg_rating: avgRating,
              review_count: reviewCount,
            };
          })
      );

      // Sort: in-stock items first, then by price
      const filteredProducts = productsWithDistance
        .filter(product => product.distance <= distance)
        .sort((a, b) => {
          // Out of stock items go to the bottom
          if (a.stock_status === 'out_of_stock' && b.stock_status !== 'out_of_stock') return 1;
          if (a.stock_status !== 'out_of_stock' && b.stock_status === 'out_of_stock') return -1;
          // Then sort by price
          return a.price - b.price;
        });

      setProducts(filteredProducts);
    }

    if (shopsData) {
      const shopsWithDistance = shopsData
        .map(shop => ({
          ...shop,
          distance: calculateDistance(
            location.lat,
            location.lng,
            Number(shop.latitude),
            Number(shop.longitude)
          ),
        }))
        .filter(shop => shop.distance <= distance)
        .sort((a, b) => a.distance - b.distance) as ShopWithDistance[];

      setMatchingShops(shopsWithDistance);
    }

    setLoading(false);
  };

  const openGoogleMaps = (shop: Shop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Best Prices</h1>
            <p className="text-muted-foreground">
              Search for products or shops and compare prices from stores near you
            </p>
          </div>

          {/* Location Error */}
          {locationError && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Unable to get your location. Using default location.</span>
                <Button variant="outline" size="sm" onClick={refreshLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Search Controls */}
          <div className="glass-card rounded-2xl p-6 mb-8 space-y-6">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Search for products or shops..."
            />

            <DistanceSlider value={distance} onChange={setDistance} />

            <Button
              onClick={handleSearch}
              className="w-full"
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Map */}
          {!locationLoading && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Nearby Stores ({shops.length})
              </h2>
              <ShopMap
                userLocation={location}
                shops={shops}
                radiusKm={distance}
              />
            </div>
          )}

          {/* Search Results */}
          {hasSearched && (
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="products" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Products ({products.length})
                  </TabsTrigger>
                  <TabsTrigger value="shops" className="gap-2">
                    <Store className="h-4 w-4" />
                    Shops ({matchingShops.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products">
                  {products.length > 0 ? (
                    <div className="grid gap-4">
                      {products.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onNavigate={() => openGoogleMaps(product.shop)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No products found for "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try adjusting your search or increasing the distance.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="shops">
                  {matchingShops.length > 0 ? (
                    <div className="grid gap-4">
                      {matchingShops.map(shop => (
                        <ShopCard key={shop.id} shop={shop} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No shops found for "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try a different shop name or increase the distance.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
