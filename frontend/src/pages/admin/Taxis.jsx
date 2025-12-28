import React, { useState, useEffect } from 'react';
import { Car, Search, Plus, Edit, Trash2, Battery, MapPin, User } from 'lucide-react';
import { getAllTaxis, createTaxi, updateTaxi, deleteTaxi } from '../../api/adminService';

const TaxisManagement = () => {
  const [taxis, setTaxis] = useState([]);
  const [filteredTaxis, setFilteredTaxis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaxis = async () => {
      try {
        setLoading(true);
        const response = await getAllTaxis();
        setTaxis(response.data);
        setFilteredTaxis(response.data);
      } catch (err) {
        console.error('Error fetching taxis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxis();
  }, []);

  useEffect(() => {
    const filtered = taxis.filter(taxi =>
      taxi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taxi.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (taxi.driver && 
        (taxi.driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         taxi.driver.lastName.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredTaxis(filtered);
  }, [searchTerm, taxis]);

  const handleDeleteTaxi = async (taxiId) => {
    if (window.confirm('Are you sure you want to delete this taxi?')) {
      try {
        await deleteTaxi(taxiId);
        // Remove the deleted taxi from the state
        setTaxis(taxis.filter(taxi => taxi.id !== taxiId));
        setFilteredTaxis(filteredTaxis.filter(taxi => taxi.id !== taxiId));
      } catch (err) {
        console.error('Error deleting taxi:', err);
        alert('Failed to delete taxi');
      }
    }
  };

  const getStats = () => {
    const totalTaxis = taxis.length;
    const availableTaxis = taxis.filter(taxi => taxi.status === 'AVAILABLE').length;
    const busyTaxis = taxis.filter(taxi => taxi.status === 'BUSY').length;
    const chargingTaxis = taxis.filter(taxi => taxi.status === 'CHARGING').length;
    const maintenanceTaxis = totalTaxis - availableTaxis - busyTaxis - chargingTaxis;
    
    return { totalTaxis, availableTaxis, busyTaxis, chargingTaxis, maintenanceTaxis };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="text-xl">Loading taxis...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Taxis Management</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search taxis or drivers..."
          />
        </div>
      </div>

      {/* Taxis Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Fleet Overview</h3>
          <p className="mt-1 text-sm text-gray-500">Manage taxi fleet and assignments</p>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Battery
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTaxis.map((taxi) => (
                  <tr key={taxi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                            <Car className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{taxi.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {taxi.driver ? `${taxi.driver.firstName} ${taxi.driver.lastName}` : 'Unassigned'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {taxi.driver ? taxi.driver.email : '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        taxi.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        taxi.status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                        taxi.status === 'CHARGING' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {taxi.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Battery className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${
                          taxi.batteryLevel > 50 ? 'text-green-600' :
                          taxi.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {taxi.batteryLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        Lat: {taxi.latitude.toFixed(4)}, Lng: {taxi.longitude.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTaxi(taxi.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTaxis.length === 0 && (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No taxis found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxisManagement;