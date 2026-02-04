import { Store, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Shop {
  id: string;
  name: string;
  owner_name: string;
  phone: string;
  address: string;
  category: string;
  distance: number;
}

interface ShopCardProps {
  shop: Shop;
}

const categoryLabels: Record<string, string> = {
  grocery: 'Grocery',
  electronics: 'Electronics',
  clothing: 'Clothing',
  pharmacy: 'Pharmacy',
  hardware: 'Hardware',
  sports: 'Sports',
  books: 'Books',
  home_appliances: 'Home Appliances',
  other: 'Other',
};

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-card-hover transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Store className="h-7 w-7 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate">{shop.name}</h3>
              <Badge variant="secondary" className="flex-shrink-0">
                {categoryLabels[shop.category] || shop.category}
              </Badge>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{shop.address}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{shop.distance.toFixed(1)} km away</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => window.open(`tel:${shop.phone}`, '_self')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Link to={`/shop/${shop.id}`} className="flex-1">
            <Button size="sm" className="w-full gap-2">
              View Shop
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
