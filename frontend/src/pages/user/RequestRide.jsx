import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';
import { createRide } from '../../api/rideService';
import { predictETA } from '../../api/predictionService';
import { useNavigate } from 'react-router-dom';

const RequestRide = () => {
  const navigate = useNavigate();
  const [rideData, setRideData] = useState({
    originLat: '',
    originLng: '',
    destLat: '',
    destLng: ''
    // Removed trafficIndex and weather fields
  });
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRideData(prev => ({
      ...prev,
      [name]: name.includes('Lat') || name.includes('Lng') 
        ? parseFloat(value) || (value === '' ? '' : 0) 
        : value
    }));
  };

  const handlePredictETA = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!rideData.originLat || !rideData.originLng || !rideData.destLat || !rideData.destLng) {
      setError('Please fill in all location fields');
      setLoading(false);
      return;
    }
    
    try {
      // For ETA prediction, we'll use default values for traffic and weather
      const predictionData = {
        originLat: parseFloat(rideData.originLat),
        originLng: parseFloat(rideData.originLng),
        destLat: parseFloat(rideData.destLat),
        destLng: parseFloat(rideData.destLng),
        trafficIndex: 0.5, // Default value
        weather: 'sunny', // Default value
        timeOfDay: 'afternoon' // Default time of day
      };
      
      const response = await predictETA(predictionData);
      setEta(response.data.predictedETA);
    } catch (err) {
      setError('Failed to predict ETA. Please try again.');
      console.error('ETA prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!rideData.originLat || !rideData.originLng || !rideData.destLat || !rideData.destLng) {
      setError('Please fill in all location fields');
      setLoading(false);
      return;
    }
    
    try {
      // For ride request, backend will generate random values for traffic and weather
      const rideRequest = {
        originLat: parseFloat(rideData.originLat),
        originLng: parseFloat(rideData.originLng),
        destLat: parseFloat(rideData.destLat),
        destLng: parseFloat(rideData.destLng),
        eta: eta || 15 // Use predicted ETA or default to 15 minutes
      };
      
      const response = await createRide(rideRequest);
      
      if (response.data) {
        setRequestSuccess(true);
        // Reset form after successful request
        setRideData({
          originLat: '',
          originLng: '',
          destLat: '',
          destLng: ''
          // Removed trafficIndex and weather fields
        });
        setEta(null);
        
        // Redirect to ride history page after a short delay
        setTimeout(() => {
          navigate('/user/ride-history');
        }, 2000);
      }
    } catch (err) {
      setError('Failed to request ride. Please try again.');
      console.error('Ride request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Request a Ride</h2>
          <p className="mt-1 text-sm text-gray-500">Enter your pickup and destination locations</p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          {requestSuccess && (
            <div className="mb-6 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Ride requested successfully!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your ride has been requested. Redirecting to ride history...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleRequestRide} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="originLat" className="block text-sm font-medium text-gray-700">
                  Pickup Latitude
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="originLat"
                    name="originLat"
                    step="any"
                    value={rideData.originLat}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 sm:text-sm border-gray-300 rounded-lg border"
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="originLng" className="block text-sm font-medium text-gray-700">
                  Pickup Longitude
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="originLng"
                    name="originLng"
                    step="any"
                    value={rideData.originLng}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 sm:text-sm border-gray-300 rounded-lg border"
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="destLat" className="block text-sm font-medium text-gray-700">
                  Destination Latitude
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="destLat"
                    name="destLat"
                    step="any"
                    value={rideData.destLat}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 sm:text-sm border-gray-300 rounded-lg border"
                    placeholder="0.0"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="destLng" className="block text-sm font-medium text-gray-700">
                  Destination Longitude
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="destLng"
                    name="destLng"
                    step="any"
                    value={rideData.destLng}
                    onChange={handleInputChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full py-3 sm:text-sm border-gray-300 rounded-lg border"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <button
                type="button"
                onClick={handlePredictETA}
                disabled={loading}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Predicting...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Predict ETA
                  </>
                )}
              </button>
              
              {eta && (
                <div className="flex items-center px-4 py-2 bg-blue-50 rounded-md">
                  <Clock className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Estimated Arrival: {Math.round(eta)} minutes</span>
                </div>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting Ride...
                  </>
                ) : (
                  'Request Ride'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;