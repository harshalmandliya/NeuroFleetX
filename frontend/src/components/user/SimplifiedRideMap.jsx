import React, { useState, useEffect, useMemo } from 'react';

const SimplifiedRideMap = ({ 
  rideId,
  rideStatus,
  userLocation,
  driverLocation,
  destination
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
      <div className="mt-6 p-6 bg-white rounded-lg shadow-md text-center">
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
    <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-center">
        {rideStatus === 'ASSIGNED' ? 'Driver En Route to Pickup' : 'Ride in Progress'}
      </h3>
      
      <div className="relative w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg overflow-hidden border border-gray-300 shadow-inner" 
           style={{ height: '400px' }}>
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
          className="absolute w-10 h-10 bg-yellow-400 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${normalizedPositions.driver.x * 100}%`, 
            top: `${normalizedPositions.driver.y * 100}%`
          }}
        >
          <span className="text-xl">🚕</span>
        </div>
        
        {/* User pickup location marker */}
        <div 
          className="absolute w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center animate-pulse"
          style={{ 
            left: `${normalizedPositions.user.x * 100}%`, 
            top: `${normalizedPositions.user.y * 100}%` 
          }}
        >
          <span className="text-white font-bold text-lg">👤</span>
        </div>
        
        {/* Destination marker */}
        <div 
          className="absolute w-10 h-10 bg-red-600 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${normalizedPositions.destination.x * 100}%`, 
            top: `${normalizedPositions.destination.y * 100}%` 
          }}
        >
          <span className="text-white font-bold text-lg">🏁</span>
        </div>
        
        {/* Labels */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded flex items-center space-x-1">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
            <span>D</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-1"></div>
            <span>P</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
            <span>Dest</span>
          </div>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="mt-4 text-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          rideStatus === 'ASSIGNED' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {rideStatus === 'ASSIGNED' ? 'Driver is coming to pick you up' : 'Ride in progress'}
        </span>
      </div>
    </div>
  );
};

export default SimplifiedRideMap;