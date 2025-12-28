import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DummyGridMap = () => {
  const [taxis, setTaxis] = useState([]);
  const [error, setError] = useState(null);

  // Normalize function to convert lat/lng to 0-1 range
  const normalize = (value, min, max) => {
    if (max === min) return 0.5; // Handle edge case where all values are the same
    return (value - min) / (max - min);
  };

  // Fetch taxis from backend API
  const fetchTaxis = async () => {
    try {
      console.log('Fetching taxis from /api/taxis');
      const response = await axios.get('/api/taxis');
      console.log('Received taxis data:', response.data);
      setTaxis(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching taxis:', error);
      if (error.response) {
        setError(`API Error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        setError('Network Error: Unable to connect to backend API');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  // Fetch taxis on component mount and every 3 seconds
  useEffect(() => {
    fetchTaxis();
    const interval = setInterval(fetchTaxis, 3000);
    return () => clearInterval(interval);
  }, []);

  // Calculate min/max values for normalization
  const getMinMax = (array, key) => {
    if (array.length === 0) return { min: 0, max: 1 };
    const values = array.map(item => item[key]);
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  // Get min/max for latitudes and longitudes
  const { min: minLat, max: maxLat } = getMinMax(taxis, 'latitude');
  const { min: minLng, max: maxLng } = getMinMax(taxis, 'longitude');

  // Convert taxi coordinates to grid positions
  const getGridPosition = (taxi) => {
    // Ensure we have valid min/max values
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;
    
    // Normalize and convert to grid positions (0-9)
    const row = Math.floor(((taxi.latitude - minLat) / latRange) * 9);
    const col = Math.floor(((taxi.longitude - minLng) / lngRange) * 9);
    
    // Ensure positions are within grid bounds
    return {
      row: Math.max(0, Math.min(9, row)),
      col: Math.max(0, Math.min(9, col))
    };
  };

  // Get color based on taxi status
  const getStatusColor = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'BUSY':
        return 'bg-red-500';
      case 'CHARGING':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Taxi Grid Map</h2>
      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200 w-full">
          <div className="font-semibold">Map Loading Error:</div>
          <div>{error}</div>
          <div className="text-sm mt-1">Please check that the backend server is running on port 8080</div>
        </div>
      )}
      <div className="text-sm text-gray-600 mb-4 w-full flex justify-between items-center">
        <span>Taxis loaded: {taxis.length}</span>
        <button 
          onClick={fetchTaxis}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="relative grid grid-cols-10 gap-0 border-4 border-gray-400 rounded-lg shadow-inner bg-gray-50" style={{ width: '100%', maxWidth: '700px', height: '700px' }}>
        {/* Render grid cells with better styling */}
        {Array.from({ length: 100 }).map((_, index) => {
          const row = Math.floor(index / 10);
          const col = index % 10;
          return (
            <div
              key={index}
              className="border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            />
          );
        })}
        
        {/* Render taxis with enhanced visibility */}
        {taxis.map((taxi) => {
          const { row, col } = getGridPosition(taxi);
          const colorClass = getStatusColor(taxi.status);
          
          // Calculate position (center of the grid cell)
          const top = row * 70 + 35; // 70px cell height + offset to center
          const left = col * 70 + 35; // 70px cell width + offset to center
          
          return (
            <div
              key={taxi.id}
              className={`absolute w-12 h-12 rounded-full ${colorClass} border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer`}
              style={{
                top: `${top}px`,
                left: `${left}px`,
              }}
              title={`Taxi ${taxi.id} - ${taxi.status}`}
            >
              <span className="text-white font-bold text-lg">🚕</span>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-green-500 rounded-full mr-2 border-2 border-white shadow"></div>
          <span className="text-sm font-medium text-gray-700">Available</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-500 rounded-full mr-2 border-2 border-white shadow"></div>
          <span className="text-sm font-medium text-gray-700">Busy</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-orange-500 rounded-full mr-2 border-2 border-white shadow"></div>
          <span className="text-sm font-medium text-gray-700">Charging</span>
        </div>
      </div>
    </div>
  );
};

export default DummyGridMap;