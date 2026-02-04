import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Phone, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

interface ShopMapProps {
  userLocation: { lat: number; lng: number };
  shops: Shop[];
  radiusKm: number;
  selectedShopId?: string;
  onShopSelect?: (shop: Shop) => void;
}

const userIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background: linear-gradient(135deg, hsl(166, 76%, 38%), hsl(152, 68%, 42%)); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const shopIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background: hsl(38, 92%, 55%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
      <path d="M2 7h20"/>
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapBoundsUpdater({ userLocation, radiusKm }: { userLocation: { lat: number; lng: number }; radiusKm: number }) {
  const map = useMap();
  
  useEffect(() => {
    const bounds = L.latLng(userLocation.lat, userLocation.lng).toBounds(radiusKm * 1000 * 2);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, userLocation, radiusKm]);

  return null;
}

export function ShopMap({ userLocation, shops, radiusKm, selectedShopId, onShopSelect }: ShopMapProps) {
  const mapRef = useRef<L.Map>(null);

  const openGoogleMaps = (shop: Shop) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="map-container h-[400px] md:h-[500px] w-full">
      <MapContainer
        ref={mapRef}
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater userLocation={userLocation} radiusKm={radiusKm} />
        
        {/* User location marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center p-2">
              <p className="font-semibold">Your Location</p>
            </div>
          </Popup>
        </Marker>

        {/* Radius circle */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: 'hsl(166, 76%, 38%)',
            fillColor: 'hsl(166, 76%, 38%)',
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={shopIcon}
            eventHandlers={{
              click: () => onShopSelect?.(shop),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{shop.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{shop.owner_name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <Phone className="h-3 w-3" />
                  {shop.phone}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  {shop.address}
                </div>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => openGoogleMaps(shop)}
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
