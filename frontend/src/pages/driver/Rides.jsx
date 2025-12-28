import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Navigation, CheckCircle, XCircle, RefreshCw, Check } from 'lucide-react';
import { getDriverRides, driverRideAction, completeRide, startRide } from '../../api/driverService';
import { getUnassignedRidesForDriver } from '../../api/rideService';
import SimplifiedRideMap from '../../components/driver/SimplifiedRideMap';

const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [pendingRides, setPendingRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    ridesCompleted: 0,
    totalEarnings: 0,
    averageRating: 0,
    hoursOnline: 0
  });
  
  // Refresh interval state
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Active ride state
  const [activeRide, setActiveRide] = useState(null);

  // Fetch rides on component mount
  useEffect(() => {
    fetchRides();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchRides, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      
      // Fetch driver's rides
      const ridesResponse = await getDriverRides();
      const allRides = ridesResponse.data;
      
      // Filter for active rides (ASSIGNED or IN_PROGRESS)
      const activeRide = allRides.find(ride => 
        ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS'
      );
      
      setActiveRide(activeRide || null);
      
      // Separate completed rides
      const completedRides = allRides.filter(ride => ride.status === 'COMPLETED');
      
      setRides(completedRides);
      
      // Fetch pending rides
      const pendingResponse = await getUnassignedRidesForDriver();
      setPendingRides(pendingResponse.data);
      
      // Calculate summary
      const ridesCompleted = completedRides.length;
      const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.earnings || 0), 0);
      
      setSummary(prev => ({
        ...prev,
        ridesCompleted,
        totalEarnings: parseFloat(totalEarnings.toFixed(2))
      }));
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      await driverRideAction({
        rideRequestId: rideId,
        action: 'ACCEPT'
      });
      
      // Refresh rides after accepting
      fetchRides();
      
      alert('Ride accepted successfully!');
    } catch (error) {
      console.error('Error accepting ride:', error);
      alert('Failed to accept ride. Please try again.');
    }
  };

  const handleDeclineRide = async (rideId) => {
    try {
      await driverRideAction({
        rideRequestId: rideId,
        action: 'DECLINE'
      });
      
      // Refresh rides after declining
      fetchRides();
      
      alert('Ride declined.');
    } catch (error) {
      console.error('Error declining ride:', error);
      alert('Failed to decline ride. Please try again.');
    }
  };

  const handleStartRide = async (rideId) => {
    try {
      await startRide(rideId);
      
      // Refresh rides after starting
      fetchRides();
      
      alert('Ride started successfully!');
    } catch (error) {
      console.error('Error starting ride:', error);
      alert('Failed to start ride. Please try again.');
    }
  };

  const handleCompleteRide = async (rideId) => {
    try {
      await completeRide(rideId);
      
      // Refresh rides after completing
      fetchRides();
      
      alert('Ride completed successfully!');
    } catch (error) {
      console.error('Error completing ride:', error);
      alert('Failed to complete ride. Please try again.');
    }
  };

  const handleManualRefresh = () => {
    fetchRides();
  };

  if (loading && rides.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Rides</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your ride requests and view ride history</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Ride Tracking */}
      {activeRide && (
        <div className="mb-6">
          <SimplifiedRideMap
            rideId={activeRide.id}
            rideStatus={activeRide.status}
            userLocation={{ x: activeRide.originLng, y: activeRide.originLat }}
            driverLocation={{ x: activeRide.taxi?.longitude || 0, y: activeRide.taxi?.latitude || 0 }}
            destination={{ x: activeRide.destLng, y: activeRide.destLat }}
            onStartRide={() => handleStartRide(activeRide.id)}
            onCompleteRide={() => handleCompleteRide(activeRide.id)}
          />
        </div>
      )}

      {/* Pending Ride Requests */}
      {pendingRides.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Pending Ride Requests</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {pendingRides.map((ride) => (
              <li key={ride.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
                          <Navigation className="h-6 w-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          New Ride Request
                        </div>
                        <div className="text-sm text-gray-500">
                          Pickup: {ride.originLat.toFixed(4)}, {ride.originLng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRide(ride.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRide(ride.id)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mr-6 flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        To: {ride.destLat.toFixed(4)}, {ride.destLng.toFixed(4)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      ETA: {ride.eta ? `${ride.eta} min` : 'N/A'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ride History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Ride History</h2>
        </div>
        {rides.length === 0 ? (
          <div className="px-6 py-4 text-center">
            <p className="text-gray-500">No completed rides yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rides.map((ride) => (
              <li key={ride.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Ride #{ride.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(ride.timestamp).toLocaleDateString()} at {new Date(ride.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      ${ride.earnings ? ride.earnings.toFixed(2) : 'N/A'}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mr-6 flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        From: {ride.originLat.toFixed(4)}, {ride.originLng.toFixed(4)}
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        To: {ride.destLat.toFixed(4)}, {ride.destLng.toFixed(4)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      {ride.eta ? `${ride.eta} min` : 'N/A'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Rides;