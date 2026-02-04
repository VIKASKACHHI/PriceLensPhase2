export const SHOP_CATEGORIES = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'sports', label: 'Sports' },
  { value: 'books', label: 'Books' },
  { value: 'home_appliances', label: 'Home Appliances' },
  { value: 'other', label: 'Other' },
] as const;

export const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.2090,
  name: 'New Delhi, India'
};

export const MAX_DISTANCE_KM = 10;
export const DEFAULT_DISTANCE_KM = 5;
