import React, { useState, useEffect, useRef } from 'react';

const RideTrackingMap = ({ 
  rideId,
  rideStatus,
  userLocation,
  driverLocation,
  destination,
  onStartRide,
  onCompleteRide
}) => {
  // State for taxi position (animated)
  const [taxiPosition, setTaxiPosition] = useState({ x: driverLocation.x, y: driverLocation.y });
  const [eta, setEta] = useState(null);
  const intervalRef = useRef(null);
  
  // Animation control based on ride status
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start animation when ride is ASSIGNED or IN_PROGRESS
    if (rideStatus === 'ASSIGNED' || rideStatus === 'IN_PROGRESS') {
      intervalRef.current = setInterval(() => {
        setTaxiPosition(prevPos => {
          // Determine target position based on ride stage
          let targetX, targetY;
          if (rideStatus === 'ASSIGNED') {
            // Moving toward pickup
            targetX = userLocation.x;
            targetY = userLocation.y;
          } else if (rideStatus === 'IN_PROGRESS') {
            // Moving toward destination
            targetX = destination.x;
            targetY = destination.y;
          }
          
          // Calculate direction vector
          const dx = targetX - prevPos.x;
          const dy = targetY - prevPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // If we're close enough to target, stop moving
          if (distance < 0.1) {
            // Update ETA when reaching targets
            if (rideStatus === 'ASSIGNED') {
              setEta(Math.max(1, Math.floor(Math.random() * 5))); // Simulate ETA to destination
            } else if (rideStatus === 'IN_PROGRESS') {
              setEta(0);
            }
            return prevPos;
          }
          
          // Move toward target (normalize and scale by speed)
          const speed = 0.05; // Adjust for desired speed
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;
          
          // Update ETA
          const newDistance = Math.sqrt(
            Math.pow(targetX - (prevPos.x + moveX), 2) + 
            Math.pow(targetY - (prevPos.y + moveY), 2)
          );
          setEta(Math.max(0, Math.floor(newDistance * 10))); // Simple ETA calculation
          
          return {
            x: prevPos.x + moveX,
            y: prevPos.y + moveY
          };
        });
      }, 1000); // Update every 1 second
    }
    
    // Cleanup interval on unmount or status change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [rideStatus, userLocation, destination]);
  
  // Render nothing if ride is PENDING or COMPLETED
  if (rideStatus === 'PENDING' || rideStatus === 'COMPLETED') {
    return null;
  }
  
  // Render map with positions
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">
        {rideStatus === 'ASSIGNED' ? 'Driver is on the way to pick you up' : 'Ride in progress'}
      </h3>
      
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
        {/* Grid background */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10">
          {Array.from({ length: 100 }).map((_, index) => (
            <div key={index} className="border border-gray-200"></div>
          ))}
        </div>
        
        {/* User pickup location marker */}
        <div 
          className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ 
            left: `${userLocation.x * 100}%`, 
            top: `${userLocation.y * 100}%` 
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Pickup
          </div>
        </div>
        
        {/* Destination marker */}
        <div 
          className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${destination.x * 100}%`, 
            top: `${destination.y * 100}%` 
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Destination
          </div>
        </div>
        
        {/* Taxi marker with animation */}
        <div 
          className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ 
            left: `${taxiPosition.x * 100}%`, 
            top: `${taxiPosition.y * 100}%`,
            transition: 'left 1s linear, top 1s linear'
          }}
        >
          <span className="text-xs font-bold">🚕</span>
          {/* ETA label */}
          {eta !== null && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              ETA: {eta} min
            </div>
          )}
        </div>
        
        {/* Route line (simple visualization) */}
        {rideStatus === 'ASSIGNED' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${driverLocation.x * 100}%`}
              y1={`${driverLocation.y * 100}%`}
              x2={`${userLocation.x * 100}%`}
              y2={`${userLocation.y * 100}%`}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
        
        {rideStatus === 'IN_PROGRESS' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={`${userLocation.x * 100}%`}
              y1={`${userLocation.y * 100}%`}
              x2={`${destination.x * 100}%`}
              y2={`${destination.y * 100}%`}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          </svg>
        )}
      </div>
      
      {/* Action buttons based on status */}
      <div className="mt-4 flex justify-center space-x-4">
        {rideStatus === 'ASSIGNED' && (
          <button
            onClick={onStartRide}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Ride
          </button>
        )}
        
        {rideStatus === 'IN_PROGRESS' && (
          <button
            onClick={onCompleteRide}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Complete Ride
          </button>
        )}
      </div>
    </div>
  );
};

export default RideTrackingMap;