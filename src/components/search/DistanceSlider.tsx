import { Slider } from '@/components/ui/slider';
import { MAX_DISTANCE_KM } from '@/lib/constants';

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Search Radius
        </label>
        <span className="text-sm font-semibold text-primary">
          {value} km
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={MAX_DISTANCE_KM}
        min={1}
        step={0.5}
        className="distance-slider"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1 km</span>
        <span>{MAX_DISTANCE_KM} km</span>
      </div>
    </div>
  );
}
