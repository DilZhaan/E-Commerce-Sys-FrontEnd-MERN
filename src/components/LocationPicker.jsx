import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';

// You'll need to add react-leaflet and leaflet packages
// npm install react-leaflet leaflet

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ onSelect, onClose, initialLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialLocation || { lat: 7.8731, lng: 80.7718 }); // Default to Sri Lanka center
  const [position, setPosition] = useState(initialLocation);
  const searchTimeoutRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Get user's location if initial location not provided
    if (!initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setMapCenter(userLocation);
          // Don't set position yet, let user select
        },
        (error) => {
          console.error('Error getting location:', error);
          // Keep default Sri Lanka center
        }
      );
    }

    // Clean up search timeout on unmount
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [initialLocation]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.length < 3) return;
    
    setIsSearching(true);
    try {
      // Using Nominatim OpenStreetMap search API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchTerm}&countrycodes=lk&limit=5`,
        { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
      );
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching for location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.display_name;
        const district = data.address.county || data.address.city || '';
        const province = data.address.state || '';
        
        setSelectedLocation({
          address,
          district,
          province,
          latitude: lat,
          longitude: lng
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (result) => {
    const { lat, lon, display_name } = result;
    const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
    
    setPosition(newPosition);
    setMapCenter(newPosition);
    setSearchResults([]);
    setSearchTerm(display_name);
    
    if (mapRef.current) {
      mapRef.current.setView(newPosition, 15);
    }
    
    // Get detailed address information
    reverseGeocode(parseFloat(lat), parseFloat(lon));
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onSelect(selectedLocation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Select Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row h-[70vh]">
          <div className="w-full md:w-1/3 p-4 border-r overflow-y-auto">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Search for a location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  className="absolute right-2 top-2 text-gray-400"
                  onClick={handleSearch}
                  disabled={isSearching || searchTerm.length < 3}
                >
                  <FaSearch />
                </button>
              </div>
              
              {isSearching && (
                <div className="mt-2 text-sm text-gray-500">Searching...</div>
              )}
              
              {searchResults.length > 0 && (
                <div className="mt-2 border rounded-md divide-y max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.place_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      {result.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedLocation && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-700">Selected Location</h3>
                <p className="text-sm mt-1 text-gray-600">{selectedLocation.address}</p>
                {selectedLocation.district && (
                  <p className="text-sm mt-1 text-gray-600">
                    <span className="font-medium">District:</span> {selectedLocation.district}
                  </p>
                )}
                {selectedLocation.province && (
                  <p className="text-sm mt-1 text-gray-600">
                    <span className="font-medium">Province:</span> {selectedLocation.province}
                  </p>
                )}
                <div className="text-sm mt-1 text-gray-600">
                  <span className="font-medium">Coordinates:</span>{' '}
                  {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                Click on the map to select a location or search for an address above.
              </p>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                  selectedLocation
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Location
              </button>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 h-full">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler />
              {position && <Marker position={[position.lat, position.lng]} />}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

LocationPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  initialLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default LocationPicker; 