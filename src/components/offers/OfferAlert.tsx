import { Gift, Percent, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface OfferAlertProps {
  type: 'special' | 'discount';
  description: string;
  className?: string;
}

export function OfferAlert({ type, description, className }: OfferAlertProps) {
  const Icon = type === 'special' ? Gift : Percent;
  const title = type === 'special' ? '🎁 Special Offer!' : '💰 Discount Available!';
  
  return (
    <Alert 
      className={`border-2 ${
        type === 'special' 
          ? 'border-accent bg-accent/5' 
          : 'border-primary bg-primary/5'
      } ${className}`}
    >
      <Icon className={`h-4 w-4 ${type === 'special' ? 'text-accent' : 'text-primary'}`} />
      <AlertTitle className="flex items-center gap-2">
        {title}
        <Sparkles className="h-4 w-4 animate-pulse" />
      </AlertTitle>
      <AlertDescription className="mt-1">
        {description}
      </AlertDescription>
    </Alert>
  );
}
