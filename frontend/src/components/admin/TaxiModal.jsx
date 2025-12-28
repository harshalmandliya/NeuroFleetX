import React, { useState, useEffect } from 'react';
import { X, Car, MapPin, Battery } from 'lucide-react';

const TaxiModal = ({ isOpen, onClose, taxi, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    batteryLevel: '',
    status: 'AVAILABLE'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taxi) {
      setFormData({
        name: taxi.name || '',
        latitude: taxi.latitude || '',
        longitude: taxi.longitude || '',
        batteryLevel: taxi.batteryLevel || '',
        status: taxi.status || 'AVAILABLE'
      });
    } else {
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        batteryLevel: '',
        status: 'AVAILABLE'
      });
    }
    setErrors({});
  }, [taxi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Taxi name is required';
    }
    
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
      newErrors.latitude = 'Latitude must be a number between -90 and 90';
    }
    
    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
      newErrors.longitude = 'Longitude must be a number between -180 and 180';
    }
    
    if (!formData.batteryLevel) {
      newErrors.batteryLevel = 'Battery level is required';
    } else if (isNaN(formData.batteryLevel) || parseInt(formData.batteryLevel) < 0 || parseInt(formData.batteryLevel) > 100) {
      newErrors.batteryLevel = 'Battery level must be a number between 0 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const taxiData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        batteryLevel: parseInt(formData.batteryLevel)
      };
      
      onSave(taxiData, taxi?.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {taxi ? 'Edit Taxi' : 'Add New Taxi'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Taxi Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Car className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md`}
                  placeholder="e.g., Taxi 123"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="0.0001"
                    min="-90"
                    max="90"
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border ${
                      errors.latitude ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                    placeholder="40.7128"
                  />
                </div>
                {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude}</p>}
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="0.0001"
                    min="-180"
                    max="180"
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border ${
                      errors.longitude ? 'border-red-300' : 'border-gray-300'
                    } rounded-md`}
                    placeholder="-74.0060"
                  />
                </div>
                {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="batteryLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Battery Level (%)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Battery className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="batteryLevel"
                  name="batteryLevel"
                  value={formData.batteryLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border ${
                    errors.batteryLevel ? 'border-red-300' : 'border-gray-300'
                  } rounded-md`}
                  placeholder="85"
                />
              </div>
              {errors.batteryLevel && <p className="mt-1 text-sm text-red-600">{errors.batteryLevel}</p>}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BUSY">Busy</option>
                <option value="CHARGING">Charging</option>
              </select>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {taxi ? 'Update Taxi' : 'Add Taxi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaxiModal;