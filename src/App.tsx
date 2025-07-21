import React, { useState, useCallback } from 'react';
import { MapComponent } from './components/MapComponent';
import { LocationInput } from './components/LocationInput';
import { TravelModeSelector } from './components/TravelModeSelector';
import { ElevationChart } from './components/ElevationChart';
import { RouteStats } from './components/RouteStats';
import { RouteData, TravelMode, LocationData } from './types';
import { Mountain, Navigation } from 'lucide-react';

function App() {
  const [startLocation, setStartLocation] = useState<LocationData | null>(null);
  const [endLocation, setEndLocation] = useState<LocationData | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('WALKING');
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const handleLocationSelect = useCallback((location: LocationData, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartLocation(location);
    } else {
      setEndLocation(location);
    }
  }, []);

  const handleRouteData = useCallback((data: RouteData | null) => {
    setRouteData(data);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Route Elevation</h1>
                <p className="text-sm text-gray-600">Visualize terrain along your route</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Navigation className="h-4 w-4" />
              <span>Select points on map or use search</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/60 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Navigation className="h-5 w-5 mr-2 text-blue-600" />
                Route Planning
              </h2>
              
              <div className="space-y-6">
                <LocationInput
                  label="Start Location"
                  placeholder="Enter starting point"
                  value={startLocation}
                  onChange={(location) => setStartLocation(location)}
                  map={map}
                />
                
                <LocationInput
                  label="End Location"
                  placeholder="Enter destination"
                  value={endLocation}
                  onChange={(location) => setEndLocation(location)}
                  map={map}
                />
                
                <TravelModeSelector
                  value={travelMode}
                  onChange={setTravelMode}
                />
              </div>

              {startLocation && endLocation && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Route calculated!</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Elevation profile and statistics are displayed below
                  </p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-white/40 backdrop-blur-md rounded-xl border border-white/20 p-4">
              <h3 className="font-medium text-gray-800 mb-3">Quick Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Click on the map to set start and end points
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Use the search boxes for precise locations
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Hover over the elevation chart to explore the route
                </li>
              </ul>
            </div>
          </div>

          {/* Map and Charts */}
          <div className="lg:col-span-3 space-y-8">
            {/* Map */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xl">
              <div className="h-96 md:h-[500px]">
                <MapComponent
                  startLocation={startLocation}
                  endLocation={endLocation}
                  travelMode={travelMode}
                  onRouteData={handleRouteData}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>

            {/* Route Statistics */}
            <RouteStats stats={routeData?.stats || null} />

            {/* Elevation Chart */}
            <ElevationChart routeData={routeData} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Plan your next adventure with detailed elevation profiles and route statistics.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Powered by Google Maps Platform APIs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;