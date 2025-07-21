export interface RoutePoint {
  lat: number;
  lng: number;
  elevation: number;
  distance: number;
}

export interface RouteStats {
  totalDistance: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  maxElevation: number;
  minElevation: number;
  maxGrade: number;
  minGrade: number;
}

export interface RouteData {
  points: RoutePoint[];
  stats: RouteStats;
  polyline: google.maps.Polyline | null;
}

export type TravelMode = 'WALKING' | 'BICYCLING' | 'DRIVING';

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
}