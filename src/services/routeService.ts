import { RouteData, RoutePoint, RouteStats, TravelMode, LocationData } from '../types';
import { ELEVATION_SAMPLE_POINTS } from '../config/maps';

export class RouteService {
  private directionsService: google.maps.DirectionsService;
  private elevationService: google.maps.ElevationService;

  constructor() {
    this.directionsService = new google.maps.DirectionsService();
    this.elevationService = new google.maps.ElevationService();
  }

  async calculateRoute(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode
  ): Promise<RouteData> {
    try {
      // Get directions
      const directionsResult = await this.getDirections(start, end, travelMode);
      const route = directionsResult.routes[0];
      
      // Sample points along the route for elevation
      const pathPoints = this.sampleRoutePoints(route.overview_path, ELEVATION_SAMPLE_POINTS);
      
      // Get elevation data
      const elevationData = await this.getElevationData(pathPoints);
      
      // Calculate distances and create route points
      const routePoints = this.createRoutePoints(elevationData, route.overview_path);
      
      // Calculate statistics
      const stats = this.calculateRouteStats(routePoints);

      return {
        points: routePoints,
        stats,
        polyline: null, // Will be set by the map component
      };
    } catch (error) {
      console.error('Route calculation error:', error);
      throw new Error('Failed to calculate route. Please try again.');
    }
  }

  private getDirections(
    start: LocationData,
    end: LocationData,
    travelMode: TravelMode
  ): Promise<google.maps.DirectionsResult> {
    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin: { lat: start.lat, lng: start.lng },
          destination: { lat: end.lat, lng: end.lng },
          travelMode: google.maps.TravelMode[travelMode],
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  private sampleRoutePoints(
    path: google.maps.LatLng[],
    sampleCount: number
  ): google.maps.LatLng[] {
    if (path.length <= sampleCount) {
      return path;
    }

    const samples: google.maps.LatLng[] = [];
    const interval = (path.length - 1) / (sampleCount - 1);

    for (let i = 0; i < sampleCount; i++) {
      const index = Math.round(i * interval);
      samples.push(path[index]);
    }

    return samples;
  }

  private getElevationData(locations: google.maps.LatLng[]): Promise<google.maps.ElevationResult[]> {
    return new Promise((resolve, reject) => {
      this.elevationService.getElevationForLocations(
        { locations },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Elevation request failed: ${status}`));
          }
        }
      );
    });
  }

  private createRoutePoints(
    elevationData: google.maps.ElevationResult[],
    fullPath: google.maps.LatLng[]
  ): RoutePoint[] {
    const points: RoutePoint[] = [];
    let totalDistance = 0;

    elevationData.forEach((result, index) => {
      if (index > 0) {
        const prevPoint = elevationData[index - 1];
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          prevPoint.location,
          result.location
        );
        totalDistance += distance;
      }

      points.push({
        lat: result.location.lat(),
        lng: result.location.lng(),
        elevation: result.elevation,
        distance: totalDistance,
      });
    });

    return points;
  }

  private calculateRouteStats(points: RoutePoint[]): RouteStats {
    if (points.length === 0) {
      return {
        totalDistance: 0,
        totalElevationGain: 0,
        totalElevationLoss: 0,
        maxElevation: 0,
        minElevation: 0,
        maxGrade: 0,
        minGrade: 0,
      };
    }

    let elevationGain = 0;
    let elevationLoss = 0;
    let maxElevation = points[0].elevation;
    let minElevation = points[0].elevation;
    let maxGrade = 0;
    let minGrade = 0;

    for (let i = 1; i < points.length; i++) {
      const current = points[i];
      const previous = points[i - 1];

      // Track elevation extremes
      maxElevation = Math.max(maxElevation, current.elevation);
      minElevation = Math.min(minElevation, current.elevation);

      // Calculate elevation changes
      const elevationChange = current.elevation - previous.elevation;
      if (elevationChange > 0) {
        elevationGain += elevationChange;
      } else {
        elevationLoss += Math.abs(elevationChange);
      }

      // Calculate grade
      const distanceChange = current.distance - previous.distance;
      if (distanceChange > 0) {
        const grade = (elevationChange / distanceChange) * 100;
        maxGrade = Math.max(maxGrade, grade);
        minGrade = Math.min(minGrade, grade);
      }
    }

    return {
      totalDistance: points[points.length - 1].distance,
      totalElevationGain: elevationGain,
      totalElevationLoss: elevationLoss,
      maxElevation,
      minElevation,
      maxGrade,
      minGrade,
    };
  }
}