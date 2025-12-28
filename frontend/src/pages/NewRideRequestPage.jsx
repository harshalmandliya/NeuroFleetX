import React, { useState } from 'react';
import { createRide, assignTaxi } from '../api/rideService';
import { predictETA } from '../api/predictionService';

const NewRideRequestPage = () => {
  const [formData, setFormData] = useState({
    originLat: '',
    originLng: '',
    destLat: '',
    destLng: ''
    // Removed trafficIndex and weather fields
  });
  
  const [rideRequest, setRideRequest] = useState(null);
  const [predictedETA, setPredictedETA] = useState(null);
  const [assignedTaxi, setAssignedTaxi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setRideRequest(null);
    setPredictedETA(null);
    setAssignedTaxi(null);

    try {
      // Create ride request - backend will generate random values for traffic and weather
      const rideData = {
        originLat: parseFloat(formData.originLat),
        originLng: parseFloat(formData.originLng),
        destLat: parseFloat(formData.destLat),
        destLng: parseFloat(formData.destLng),
        status: 'PENDING'
      };

      const response = await createRide(rideData);
      setRideRequest(response.data);
      setMessage('Ride request created successfully!');
    } catch (error) {
      console.error('Error creating ride request:', error);
      setMessage('Error creating ride request: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePredictETA = async () => {
    if (!formData.originLat || !formData.originLng || !formData.destLat || !formData.destLng) {
      setMessage('Please fill in all location fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // For ETA prediction, we'll use default values for traffic and weather
      const predictionData = {
        originLat: parseFloat(formData.originLat),
        originLng: parseFloat(formData.originLng),
        destLat: parseFloat(formData.destLat),
        destLng: parseFloat(formData.destLng),
        trafficIndex: 0.5, // Default value
        weather: 'sunny' // Default value
      };

      const response = await predictETA(predictionData);
      setPredictedETA(response.data.predictedETA);
      setMessage('ETA predicted successfully!');
    } catch (error) {
      console.error('Error predicting ETA:', error);
      setMessage('Error predicting ETA: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTaxi = async () => {
    if (!rideRequest) {
      setMessage('Please create a ride request first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await assignTaxi(rideRequest.id);
      setAssignedTaxi(response.data);
      setMessage('Taxi assigned successfully!');
      
      // Update ride request status
      setRideRequest({
        ...rideRequest,
        status: 'ASSIGNED',
        assignedTaxiId: response.data.taxiId,
        eta: response.data.eta
      });
    } catch (error) {
      console.error('Error assigning taxi:', error);
      setMessage('Error assigning taxi: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">New Ride Request</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Ride Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originLat">
                Origin Latitude
              </label>
              <input
                type="number"
                id="originLat"
                name="originLat"
                value={formData.originLat}
                onChange={handleChange}
                step="any"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="originLng">
                Origin Longitude
              </label>
              <input
                type="number"
                id="originLng"
                name="originLng"
                value={formData.originLng}
                onChange={handleChange}
                step="any"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destLat">
                Destination Latitude
              </label>
              <input
                type="number"
                id="destLat"
                name="destLat"
                value={formData.destLat}
                onChange={handleChange}
                step="any"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destLng">
                Destination Longitude
              </label>
              <input
                type="number"
                id="destLng"
                name="destLng"
                value={formData.destLng}
                onChange={handleChange}
                step="any"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Creating...' : 'Create Ride Request'}
            </button>
            
            <button
              type="button"
              onClick={handlePredictETA}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Predicting...' : 'Predict ETA'}
            </button>
            
            <button
              type="button"
              onClick={handleAssignTaxi}
              disabled={loading || !rideRequest}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {loading ? 'Assigning...' : 'Assign Taxi'}
            </button>
          </div>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>

      {predictedETA !== null && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Predicted ETA</h2>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{predictedETA.toFixed(2)} minutes</p>
          </div>
        </div>
      )}

      {assignedTaxi && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Taxi Assignment</h2>
          <div className="text-center">
            <p className="text-lg mb-2">Taxi ID: <span className="font-bold">{assignedTaxi.taxiId}</span></p>
            <p className="text-lg">Estimated Arrival Time: <span className="font-bold">{assignedTaxi.eta.toFixed(2)} minutes</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRideRequestPage;