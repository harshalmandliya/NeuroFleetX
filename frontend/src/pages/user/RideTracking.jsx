import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { getUserRides } from '../../api/userService';
import { explainRide } from '../../api/aiService';
import SimplifiedRideMap from '../../components/user/SimplifiedRideMap';

const RideTracking = () => {
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const handleExplainRide = async () => {
    // If we already have an explanation, toggle it off
    if (explanation) {
      setExplanation(null);
      return;
    }
    
    setExplaining(true);
    
    try {
      const response = await explainRide(rideId);
      setExplanation(response.data);
    } catch (error) {
      console.error('Error explaining ride:', error);
      setExplanation('Sorry, I couldn\'t explain this ride right now.');
    } finally {
      setExplaining(false);
    }
  };

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        setLoading(true);
        const response = await getUserRides();
        const rides = response.data;
        
        // Find the specific ride by ID
        const foundRide = rides.find(r => r.id === parseInt(rideId));
        
        if (foundRide) {
          setRide(foundRide);
        } else {
          setError('Ride not found');
        }
      } catch (err) {
        console.error('Error fetching ride details:', err);
        setError('Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetails();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchRideDetails, 5000);
    
    return () => clearInterval(interval);
  }, [rideId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show ride summary if ride is completed
  if (ride.status === 'COMPLETED') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ride Completed</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ride Details</h3>
              <p className="text-gray-600">ID: #{ride.id}</p>
              <p className="text-gray-600">Status: <span className="font-medium">Completed</span></p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Fare Summary</h3>
              <p className="text-gray-600">Base Fare: $2.50</p>
              <p className="text-gray-600">Distance/Time: ${(ride.earnings - 2.50).toFixed(2)}</p>
              <p className="text-lg font-bold text-gray-900 mt-2">Total: ${ride.earnings.toFixed(2)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Trip Info</h3>
              <p className="text-gray-600">Duration: ~{ride.eta} minutes</p>
              <p className="text-gray-600">Date: {new Date(ride.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show tracking map for active rides
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {ride.status === 'ASSIGNED' ? 'Driver is on the way' : 'Ride in progress'}
        </h2>
        
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleExplainRide}
            disabled={explaining}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {explaining ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Thinking...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-1" />
                Why is my ride like this?
              </>
            )}
          </button>
        </div>
        
        <SimplifiedRideMap
          rideId={ride.id}
          rideStatus={ride.status}
          userLocation={{ x: ride.originLng, y: ride.originLat }}
          driverLocation={{ x: ride.taxi?.longitude || 0, y: ride.taxi?.latitude || 0 }}
          destination={{ x: ride.destLng, y: ride.destLat }}
        />
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Pickup Location</h3>
            <p className="text-gray-600">
              Lat: {ride.originLat.toFixed(4)}, Lng: {ride.originLng.toFixed(4)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Destination</h3>
            <p className="text-gray-600">
              Lat: {ride.destLat.toFixed(4)}, Lng: {ride.destLng.toFixed(4)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Ride Status</h3>
            <p className="text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ride.status === 'ASSIGNED' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {ride.status.replace('_', ' ')}
              </span>
            </p>
          </div>
        </div>
        
        {/* AI Explanation */}
        {explanation && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-start">
              <Bot className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-800">
                {explanation}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;