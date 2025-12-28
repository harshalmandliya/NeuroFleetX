import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, Battery, MapPin } from 'lucide-react';
import { getDriverTaxis, createDriverTaxi, updateDriverTaxi } from '../../api/driverService';

const TaxiManagement = () => {
  const { user } = useAuth();
  const [taxi, setTaxi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    batteryLevel: 100,
    status: 'AVAILABLE'
  });

  useEffect(() => {
    const fetchTaxi = async () => {
      try {
        setLoading(true);
        const response = await getDriverTaxis();
        const taxis = response.data;
        
        if (taxis.length > 0) {
          const driverTaxi = taxis[0];
          setTaxi(driverTaxi);
          setFormData({
            name: driverTaxi.name || '',
            latitude: driverTaxi.latitude || '',
            longitude: driverTaxi.longitude || '',
            batteryLevel: driverTaxi.batteryLevel || 100,
            status: driverTaxi.status || 'AVAILABLE'
          });
        }
      } catch (error) {
        console.error('Error fetching taxi:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batteryLevel' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const taxiData = {
        ...formData,
        latitude: formData.latitude === '' ? 0 : parseFloat(formData.latitude),
        longitude: formData.longitude === '' ? 0 : parseFloat(formData.longitude),
        batteryLevel: formData.batteryLevel || 0
      };
      
      if (taxi && taxi.id) {
        // Update existing taxi
        const response = await updateDriverTaxi(taxi.id, taxiData);
        setTaxi(response.data);
        alert('Taxi updated successfully!');
      } else {
        // Create new taxi
        const response = await createDriverTaxi(taxiData);
        setTaxi(response.data);
        alert('Taxi created successfully!');
      }
    } catch (error) {
      console.error('Error saving taxi:', error);
      alert('Failed to save taxi: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">My Taxi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your taxi information
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {taxi ? 'Update Taxi Information' : 'Register Your Taxi'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {taxi 
                ? 'Update your taxi details below' 
                : 'Register your taxi to start accepting rides'}
            </p>
          </div>
          
          <div className="px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Taxi Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="CHARGING">Charging</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    id="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    id="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="batteryLevel" className="block text-sm font-medium text-gray-700">
                    Battery Level: {formData.batteryLevel}%
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="range"
                      id="batteryLevel"
                      name="batteryLevel"
                      min="0"
                      max="100"
                      value={formData.batteryLevel}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm text-gray-500">{formData.batteryLevel}%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : taxi ? 'Update Taxi' : 'Register Taxi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxiManagement;