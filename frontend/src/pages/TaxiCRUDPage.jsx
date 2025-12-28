import React, { useState, useEffect } from 'react';
import { getAllTaxis, createTaxi, updateTaxi, deleteTaxi } from '../api/taxiService';

const TaxiCRUDPage = () => {
  const [taxis, setTaxis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaxi, setEditingTaxi] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    batteryLevel: '',
    status: 'AVAILABLE'
  });

  useEffect(() => {
    fetchTaxis();
  }, []);

  const fetchTaxis = async () => {
    try {
      const response = await getAllTaxis();
      setTaxis(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching taxis:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const taxiData = {
        name: formData.name,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        batteryLevel: parseInt(formData.batteryLevel),
        status: formData.status
      };

      if (editingTaxi) {
        // Update existing taxi
        await updateTaxi(editingTaxi.id, taxiData);
      } else {
        // Create new taxi
        await createTaxi(taxiData);
      }
      
      // Reset form and refresh data
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        batteryLevel: '',
        status: 'AVAILABLE'
      });
      setEditingTaxi(null);
      setShowForm(false);
      fetchTaxis();
    } catch (error) {
      console.error('Error saving taxi:', error);
    }
  };

  const handleEdit = (taxi) => {
    setFormData({
      name: taxi.name,
      latitude: taxi.latitude,
      longitude: taxi.longitude,
      batteryLevel: taxi.batteryLevel,
      status: taxi.status
    });
    setEditingTaxi(taxi);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this taxi?')) {
      try {
        await deleteTaxi(id);
        fetchTaxis();
      } catch (error) {
        console.error('Error deleting taxi:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      batteryLevel: '',
      status: 'AVAILABLE'
    });
    setEditingTaxi(null);
    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Taxi Management</h1>
      
      <div className="mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {showForm ? 'Cancel' : 'Add New Taxi'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">{editingTaxi ? 'Edit Taxi' : 'Add New Taxi'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="batteryLevel">
                  Battery Level (%)
                </label>
                <input
                  type="number"
                  id="batteryLevel"
                  name="batteryLevel"
                  value={formData.batteryLevel}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="latitude">
                  Latitude
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="longitude">
                  Longitude
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="BUSY">Busy</option>
                  <option value="CHARGING">Charging</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {editingTaxi ? 'Update Taxi' : 'Add Taxi'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Taxi List</h2>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taxis.map((taxi) => (
                  <tr key={taxi.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{taxi.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ({taxi.latitude.toFixed(4)}, {taxi.longitude.toFixed(4)})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${taxi.batteryLevel}%` }}
                          ></div>
                        </div>
                        {taxi.batteryLevel}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        taxi.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        taxi.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {taxi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(taxi)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(taxi.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxiCRUDPage;