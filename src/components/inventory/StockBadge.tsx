import { Package, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StockStatus = 'in_stock' | 'limited' | 'out_of_stock';

interface StockBadgeProps {
  status: StockStatus;
  quantity?: number | null;
  showQuantity?: boolean;
  className?: string;
}

export function StockBadge({ status, quantity, showQuantity = true, className }: StockBadgeProps) {
  const config = {
    in_stock: {
      label: 'In Stock',
      icon: Package,
      variant: 'default' as const,
      className: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20',
    },
    limited: {
      label: quantity && showQuantity ? `Only ${quantity} left` : 'Limited Stock',
      icon: AlertTriangle,
      variant: 'outline' as const,
      className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20',
    },
    out_of_stock: {
      label: 'Out of Stock',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
    },
  };

  const { label, icon: Icon, className: statusClassName } = config[status];

  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1 font-medium', statusClassName, className)}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
