import { useState, useEffect, useRef } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, ArrowDown, Store, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface CompetitorProduct {
  id: string;
  name: string;
  price: number;
  shop_name: string;
  shop_id: string;
}

export interface CompetitorAlert {
  productId: string;
  cheapestPrice: number;
  cheapestShop: string;
  priceDiff: number;
}

interface CompetitorAnalysisProps {
  shopId: string;
  shopLocation: { lat: number; lng: number };
  products: Product[];
  onAlertsLoaded: (alerts: Map<string, CompetitorAlert>) => void;
  highlightProductId?: string | null;
  radiusKm?: number;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function CompetitorAnalysis({ shopId, shopLocation, products, onAlertsLoaded, highlightProductId, radiusKm = 10 }: CompetitorAnalysisProps) {
  const [comparisons, setComparisons] = useState<Map<string, CompetitorProduct[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    if (highlightProductId && !loading) {
      const row = rowRefs.current.get(highlightProductId);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [highlightProductId, loading]);

  useEffect(() => {
    const fetchCompetitors = async () => {
      if (products.length === 0) {
        setLoading(false);
        return;
      }

      const productNames = products.map(p => p.name.toLowerCase().trim());

      // Fetch all products from other active shops with location
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, price, shop_id, shops!inner(name, is_active, latitude, longitude)')
        .neq('shop_id', shopId);

      if (!allProducts) {
        setLoading(false);
        return;
      }

      const newComparisons = new Map<string, CompetitorProduct[]>();
      const newAlerts = new Map<string, CompetitorAlert>();

      for (const myProduct of products) {
        const myNameLower = myProduct.name.toLowerCase().trim();
        const competitors = allProducts
          .filter((p: any) => {
            if (p.name.toLowerCase().trim() !== myNameLower || p.shop_id === shopId) return false;
            const shopData = (p as any).shops;
            if (!shopData?.latitude || !shopData?.longitude) return false;
            const dist = getDistanceKm(shopLocation.lat, shopLocation.lng, Number(shopData.latitude), Number(shopData.longitude));
            return dist <= radiusKm;
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            shop_name: (p as any).shops?.name || 'Unknown Shop',
            shop_id: p.shop_id,
          }))
          .sort((a: CompetitorProduct, b: CompetitorProduct) => a.price - b.price);

        if (competitors.length > 0) {
          newComparisons.set(myProduct.id, competitors);

          const cheapest = competitors[0];
          if (cheapest.price < myProduct.price) {
            newAlerts.set(myProduct.id, {
              productId: myProduct.id,
              cheapestPrice: cheapest.price,
              cheapestShop: cheapest.shop_name,
              priceDiff: myProduct.price - cheapest.price,
            });
          }
        }
      }

      setComparisons(newComparisons);
      onAlertsLoaded(newAlerts);
      setLoading(false);
    };

    fetchCompetitors();
  }, [shopId, shopLocation, products, onAlertsLoaded, radiusKm]);

  const productsWithCompetitors = products.filter(p => comparisons.has(p.id));

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Analyzing competitor prices...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={sectionRef}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Competitor Price Analysis
              {productsWithCompetitors.length > 0 && (
                <Badge variant="secondary">{productsWithCompetitors.length} compared</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Compare prices with shops within {radiusKm}km of your location
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {productsWithCompetitors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No competitor data found</p>
            <p className="text-sm mt-1">None of your products are sold by other registered shops yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {productsWithCompetitors.map(product => {
              const competitors = comparisons.get(product.id) || [];
              const cheapest = competitors[0];
              const isOverpriced = cheapest && cheapest.price < product.price;
              const isHighlighted = highlightProductId === product.id;

              return (
                <div
                  key={product.id}
                  ref={(el) => { rowRefs.current.set(product.id, el); }}
                  className={`rounded-xl border p-4 transition-all ${
                    isHighlighted
                      ? 'border-destructive bg-destructive/5 ring-2 ring-destructive/20'
                      : isOverpriced
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      {isOverpriced ? (
                        <Badge variant="destructive" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Overpriced
                        </Badge>
                      ) : (
                        <Badge className="gap-1 bg-emerald-500/90 hover:bg-emerald-500">
                          <TrendingDown className="h-3 w-3" />
                          Competitive
                        </Badge>
                      )}
                    </div>
                    <span className="font-bold text-lg">Your price: ₹{product.price}</span>
                  </div>

                  {isOverpriced && cheapest && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        <strong>{cheapest.shop_name}</strong> sells this ₹{cheapest.price - product.price < 0 ? (product.price - cheapest.price).toFixed(0) : '0'} cheaper at <strong>₹{cheapest.price}</strong>
                      </span>
                    </div>
                  )}

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Competitor Shop</TableHead>
                        <TableHead className="text-right">Their Price</TableHead>
                        <TableHead className="text-right">Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitors.map(comp => {
                        const diff = product.price - comp.price;
                        return (
                          <TableRow key={comp.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                                {comp.shop_name}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">₹{comp.price}</TableCell>
                            <TableCell className="text-right">
                              {diff > 0 ? (
                                <span className="text-destructive flex items-center justify-end gap-1">
                                  <ArrowDown className="h-3 w-3" />
                                  ₹{diff.toFixed(0)} cheaper
                                </span>
                              ) : diff < 0 ? (
                                <span className="text-emerald-600 flex items-center justify-end gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  ₹{Math.abs(diff).toFixed(0)} more
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Same price</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
