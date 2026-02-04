import { Gift, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OfferBadgeProps {
  type: 'special' | 'discount';
  description: string;
}

export function OfferBadge({ type, description }: OfferBadgeProps) {
  const Icon = type === 'special' ? Gift : Percent;
  const label = type === 'special' ? 'Special Offer' : 'Discount';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1 cursor-help animate-pulse ${
              type === 'special' 
                ? 'border-accent text-accent bg-accent/10' 
                : 'border-primary text-primary bg-primary/10'
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
