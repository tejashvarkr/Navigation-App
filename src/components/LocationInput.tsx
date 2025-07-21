import React, { useRef, useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { LocationData } from '../types';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  map: google.maps.Map | null;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  map,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!map || !inputRef.current || !window.google?.maps?.places) return;

    const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (place.geometry?.location) {
        const location: LocationData = {
          address: place.formatted_address || place.name || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onChange(location);
      }
    });

    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [map, onChange]);

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Update input value when location changes externally
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value?.address || '';
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};