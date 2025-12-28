import React, { useState, useEffect, useMemo } from 'react';

const SimplifiedRideMap = ({ 
  rideId,
  rideStatus,
  driverLocation,
  userLocation,
  destination,
  onStartRide,
  onCompleteRide
}) => {
  // Normalize coordinates to fit within the grid (0-1 range)
  const normalizeCoordinate = useMemo(() => {
    return (value, min, max) => {
      if (max === min) return 0.5;
      return Math.max(0, Math.min(1, (value - min) / (max - min)));
    };
  }, []);
  
  // Calculate bounds for normalization
  const bounds = useMemo(() => {
    if (!driverLocation || !userLocation || !destination) return null;
    
    // For IN_PROGRESS rides, driver and user positions should be the same
    const effectiveDriverLocation = rideStatus === 'IN_PROGRESS' ? userLocation : driverLocation;
    
    const allPoints = [
      effectiveDriverLocation,
      userLocation,
      destination
    ];
    
    const minX = Math.min(...allPoints.map(p => p.x));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const minY = Math.min(...allPoints.map(p => p.y));
    const maxY = Math.max(...allPoints.map(p => p.y));
    
    // Add some padding
    const paddingX = (maxX - minX) * 0.1 || 0.1;
    const paddingY = (maxY - minY) * 0.1 || 0.1;
    
    return {
      minX: minX - paddingX,
      maxX: maxX + paddingX,
      minY: minY - paddingY,
      maxY: maxY + paddingY
    };
  }, [driverLocation, userLocation, destination, rideStatus]);
  
  // Normalize positions
  const normalizedPositions = useMemo(() => {
    if (!bounds) return null;
    
    // For IN_PROGRESS rides, driver and user positions should be the same
    const effectiveDriverLocation = rideStatus === 'IN_PROGRESS' ? userLocation : driverLocation;
    
    return {
      driver: {
        x: normalizeCoordinate(effectiveDriverLocation.x, bounds.minX, bounds.maxX),
        y: normalizeCoordinate(effectiveDriverLocation.y, bounds.minY, bounds.maxY)
      },
      user: {
        x: normalizeCoordinate(userLocation.x, bounds.minX, bounds.maxX),
        y: normalizeCoordinate(userLocation.y, bounds.minY, bounds.maxY)
      },
      destination: {
        x: normalizeCoordinate(destination.x, bounds.minX, bounds.maxX),
        y: normalizeCoordinate(destination.y, bounds.minY, bounds.maxY)
      }
    };
  }, [bounds, driverLocation, userLocation, destination, rideStatus, normalizeCoordinate]);
  
  // Don't render if locations aren't available
  if (!driverLocation || !userLocation || !destination) {
    return (
      <div className="mt-6 p-6 bg-white rounded-xl shadow-xl border border-gray-200 text-center">
        <p className="text-gray-500">Loading map data...</p>
      </div>
    );
  }
  
  // Render nothing if ride is PENDING or COMPLETED
  if (rideStatus === 'PENDING' || rideStatus === 'COMPLETED' || !normalizedPositions) {
    return null;
  }
  
  // Render simplified grid map with clear path
  return (
    <div className="mt-6 p-6 bg-white rounded-xl shadow-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
        {rideStatus === 'ASSIGNED' ? 'Driver En Route to Pickup' : 'Ride in Progress'}
      </h3>
      
      <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg" 
           style={{ height: '500px' }}>
        {/* Simple grid background */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 100 }).map((_, index) => (
            <div key={index} className="border border-gray-200 bg-white"></div>
          ))}
        </div>
        
        {/* Clear path line */}
        {rideStatus === 'ASSIGNED' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${normalizedPositions.driver.x * 100}%`}
              y1={`${normalizedPositions.driver.y * 100}%`}
              x2={`${normalizedPositions.user.x * 100}%`}
              y2={`${normalizedPositions.user.y * 100}%`}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          </svg>
        )}
        
        {rideStatus === 'IN_PROGRESS' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${normalizedPositions.user.x * 100}%`}
              y1={`${normalizedPositions.user.y * 100}%`}
              x2={`${normalizedPositions.destination.x * 100}%`}
              y2={`${normalizedPositions.destination.y * 100}%`}
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          </svg>
        )}
        
        {/* Driver location marker */}
        <div 
          className="absolute w-12 h-12 bg-yellow-400 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${normalizedPositions.driver.x * 100}%`, 
            top: `${normalizedPositions.driver.y * 100}%`
          }}
        >
          <span className="text-2xl">🚕</span>
        </div>
        
        {/* User pickup location marker */}
        <div 
          className="absolute w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
          style={{ 
            left: `${normalizedPositions.user.x * 100}%`, 
            top: `${normalizedPositions.user.y * 100}%` 
          }}
        >
          <span className="text-white font-bold text-xl">👤</span>
        </div>
        
        {/* Destination marker */}
        <div 
          className="absolute w-12 h-12 bg-red-600 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${normalizedPositions.destination.x * 100}%`, 
            top: `${normalizedPositions.destination.y * 100}%` 
          }}
        >
          <span className="text-white font-bold text-xl">🏁</span>
        </div>
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white text-sm font-bold px-3 py-2 rounded-lg flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
            <span>Driver</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
            <span>Passenger</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
            <span>Destination</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons based on status */}
      <div className="mt-6 flex justify-center space-x-6">
        {rideStatus === 'ASSIGNED' && (
          <button
            onClick={onStartRide}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg font-bold text-lg flex items-center"
          >
            <span>Start Ride</span>
          </button>
        )}
        
        {rideStatus === 'IN_PROGRESS' && (
          <button
            onClick={onCompleteRide}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg font-bold text-lg flex items-center"
          >
            <span>Complete Ride</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SimplifiedRideMap;