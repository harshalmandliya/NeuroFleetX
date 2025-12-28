import React, { useState, useEffect } from 'react';
import { Bell, Navigation, X, Check, X as XCircleIcon } from 'lucide-react';
import { driverRideAction, completeRide } from '../../api/driverService';
import { getUnassignedRidesForDriver } from '../../api/rideService';

const RideNotification = ({ driverLocation, onRideFound, onClose }) => {
  const [newRidesCount, setNewRidesCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  // Check for new rides periodically
  useEffect(() => {
    const checkForNewRides = async () => {
      if (!driverLocation.latitude || !driverLocation.longitude) return;
      
      try {
        const response = await getUnassignedRidesForDriver();
        const unassignedRides = response.data;
        
        // Filter rides within 5km radius
        const nearbyRides = unassignedRides.filter(ride => {
          const distance = calculateDistance(
            driverLocation.latitude, 
            driverLocation.longitude, 
            ride.originLat, 
            ride.originLng
          );
          return distance <= 5.0;
        });
        
        const newRides = nearbyRides;
        
        setNewRidesCount(newRides.length);
        setRides(newRides);
        
        // Show notification for the first ride if there are any
        if (newRides.length > 0 && !activeRide) {
          setActiveRide(newRides[0]);
          if (onRideFound) {
            onRideFound(newRides[0]);
          }
        }
      } catch (error) {
        console.error('Error checking for new rides:', error);
      }
    };

    // Check for new rides every 30 seconds
    const interval = setInterval(checkForNewRides, 30000);
    
    // Initial check
    checkForNewRides();
    
    return () => {
      clearInterval(interval);
    };
  }, [driverLocation, onRideFound, activeRide]);

  // Helper function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const response = await getUnassignedRidesForDriver();
      const unassignedRides = response.data;
      
      // Filter rides within 5km radius
      const nearbyRides = unassignedRides.filter(ride => {
        const distance = calculateDistance(
          driverLocation.latitude, 
          driverLocation.longitude, 
          ride.originLat, 
          ride.originLng
        );
        return distance <= 5.0;
      });
      
      const newRides = nearbyRides;
      
      setNewRidesCount(newRides.length);
      setRides(newRides);
      
      // Show notification for the first ride if there are any
      if (newRides.length > 0 && !activeRide) {
        setActiveRide(newRides[0]);
      }
      
      alert(`Found ${newRides.length} nearby ride request(s)!`);
    } catch (error) {
      console.error('Error checking for new rides:', error);
      alert('Error checking for new rides. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleAcceptRide = async () => {
    if (!activeRide) return;
    
    try {
      await driverRideAction({
        rideRequestId: activeRide.id,
        action: 'ACCEPT'
      });
      
      alert('Ride accepted successfully! The passenger has been notified.');
      // Remove the accepted ride from the list
      setRides(prev => prev.filter(ride => ride.id !== activeRide.id));
      setNewRidesCount(prev => prev - 1);
      setActiveRide(null);
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Failed to accept ride. Please try again.');
    }
  };

  const handleDeclineRide = async () => {
    if (!activeRide) return;
    
    try {
      await driverRideAction({
        rideRequestId: activeRide.id,
        action: 'DECLINE'
      });
      
      alert('Ride declined.');
      // Remove the declined ride from the list
      setRides(prev => prev.filter(ride => ride.id !== activeRide.id));
      setNewRidesCount(prev => prev - 1);
      setActiveRide(null);
    } catch (error) {
      console.error('Error declining ride:', error);
      alert('Failed to decline ride. Please try again.');
    }
  };
  
  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      alert('Ride completed successfully!');
    } catch (error) {
      console.error('Error completing ride:', error);
      alert('Failed to complete ride. Please try again.');
    }
  };

  if (!activeRide) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Bell className="h-5 w-5 mr-2" />
          {checking ? 'Checking...' : `Check Rides (${newRidesCount})`}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                <Navigation className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">New Ride Request</h3>
              <p className="text-sm text-gray-500">Nearby passenger needs a ride</p>
            </div>
          </div>
          <button
            onClick={() => setActiveRide(null)}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="text-sm">
            <p className="font-medium text-gray-900">Pickup Location</p>
            <p className="text-gray-600">Lat: {activeRide.originLat?.toFixed(4)}, Lng: {activeRide.originLng?.toFixed(4)}</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-gray-900">Destination</p>
            <p className="text-gray-600">Lat: {activeRide.destLat?.toFixed(4)}, Lng: {activeRide.destLng?.toFixed(4)}</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium text-gray-900">Distance</p>
            <p className="text-gray-600">
              {calculateDistance(
                driverLocation.latitude, 
                driverLocation.longitude, 
                activeRide.originLat, 
                activeRide.originLng
              ).toFixed(2)} km away
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleAcceptRide}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </button>
          <button
            onClick={handleDeclineRide}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <XCircleIcon className="h-4 w-4 mr-1" />
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideNotification;