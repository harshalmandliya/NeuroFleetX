import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Car, Battery, MapPin, Clock, User, Navigation, DollarSign } from 'lucide-react';
import { getDriverTaxis, updateDriverTaxi } from '../../api/driverService';
import { getDriverRides } from '../../api/driverService';
import { getDriverStatistics } from '../../api/driverStatsService';
import RideNotification from '../../components/driver/RideNotification';
import RideTrackingMap from '../../components/driver/RideTrackingMap';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [driverData, setDriverData] = useState({
    taxi: null,
    todayRides: 0,
    batteryLevel: 0,
    totalEarnings: 0,
    completedRides: 0
  });
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch driver's taxi information
        const taxisResponse = await getDriverTaxis();
        const taxis = taxisResponse.data;
        
        console.log('Raw taxis response:', taxisResponse); // Debug log
        console.log('Taxis data:', taxis); // Debug log
        
        // Fetch driver's rides
        const ridesResponse = await getDriverRides();
        const rides = ridesResponse.data;
        
        // Calculate today's rides (in a real app, you'd filter by date)
        const todayRides = rides.length;
        
        // Get taxi info (assuming driver has one taxi)
        const taxi = taxis.length > 0 ? taxis[0] : null;
        
        // Fetch driver statistics
        let totalEarnings = 0;
        let completedRides = 0;
        try {
          const statsResponse = await getDriverStatistics();
          totalEarnings = statsResponse.data.totalEarnings || 0;
          completedRides = statsResponse.data.completedRides || 0;
        } catch (statsError) {
          console.error('Error fetching driver statistics:', statsError);
        }
        
        console.log('Selected taxi:', taxi); // Debug log
        
        setDriverData({
          taxi,
          todayRides,
          batteryLevel: taxi ? taxi.batteryLevel : 0,
          totalEarnings,
          completedRides
        });
        
        // Set initial location data if taxi exists
        if (taxi) {
          setLocationData({
            latitude: taxi.latitude !== undefined ? taxi.latitude : '',
            longitude: taxi.longitude !== undefined ? taxi.longitude : ''
          });
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleLocationUpdate = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value === '' ? '' : parseFloat(value) || 0
    }));
  };

  const handleBatteryUpdate = (value) => {
    setDriverData(prev => ({
      ...prev,
      batteryLevel: parseInt(value) || 0
    }));
  };

  const handleStatusUpdate = async () => {
    // Check if we have a valid taxi with an ID
    if (!driverData.taxi) {
      alert('No taxi found. Please refresh the page or contact support.');
      return;
    }
    
    // Check if taxi has a valid ID (could be 'id' or '_id' depending on API)
    const taxiId = driverData.taxi.id || driverData.taxi._id;
    if (!taxiId) {
      alert('Invalid taxi data (missing ID). Please refresh the page or contact support.');
      return;
    }
    
    console.log('Updating taxi with ID:', taxiId); // Debug log
    
    try {
      setUpdating(true);
      
      // Update taxi with new location and battery data
      const updatedTaxi = {
        ...driverData.taxi,
        latitude: locationData.latitude === '' ? 0 : parseFloat(locationData.latitude),
        longitude: locationData.longitude === '' ? 0 : parseFloat(locationData.longitude),
        batteryLevel: driverData.batteryLevel,
        status: driverData.taxi.status
      };
      
      console.log('Sending update request with data:', updatedTaxi); // Debug log
      
      const response = await updateDriverTaxi(taxiId, updatedTaxi);
      
      // Update local state with response
      setDriverData(prev => ({
        ...prev,
        taxi: response.data,
        batteryLevel: response.data.batteryLevel
      }));
      
      alert('Taxi status updated successfully!');
    } catch (error) {
      console.error('Error updating taxi status:', error);
      alert('Failed to update taxi status: ' + (error.response?.data?.message || error.message || 'Unknown error'));
    } finally {
      setUpdating(false);
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's Rides</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{driverData.todayRides}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Battery className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">Battery Level</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{driverData.batteryLevel}%</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Location</dt>
                  <dd className="text-sm text-gray-900">
                    {locationData.latitude === '' ? 'Not set' : parseFloat(locationData.latitude).toFixed(4)}, 
                    {locationData.longitude === '' ? 'Not set' : parseFloat(locationData.longitude).toFixed(4)}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                  <dd className="text-2xl font-semibold text-gray-900">${driverData.totalEarnings.toFixed(2)}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Taxi Status */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Current Taxi Status</h3>
              <p className="mt-1 text-sm text-gray-500">View your taxi information</p>
            </div>
            <div className="px-4 py-5 sm:px-6">
              {driverData.taxi ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Taxi Name</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{driverData.taxi.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-2 ${{
                        'AVAILABLE': 'bg-green-400',
                        'BUSY': 'bg-yellow-400',
                        'CHARGING': 'bg-blue-400',
                        'OFFLINE': 'bg-gray-400'
                      }[driverData.taxi.status] || 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium text-gray-500">Status</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{driverData.taxi.status?.toLowerCase() || 'Unknown'}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Battery className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Battery Level</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{driverData.batteryLevel}%</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm font-medium text-gray-500">Current Location</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      Lat: {locationData.latitude === '' ? 'Not set' : parseFloat(locationData.latitude).toFixed(4)}, 
                      Lng: {locationData.longitude === '' ? 'Not set' : parseFloat(locationData.longitude).toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Car className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No taxi registered</h3>
                  <p className="mt-1 text-sm text-gray-500">You need to register a taxi to start accepting rides.</p>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.href = '/driver/taxi'}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Register Taxi
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Ride Notification */}
      <RideNotification 
        driverLocation={locationData}
        onRideFound={(ride) => {
          // This function is called when a new ride is found
          console.log('New ride found:', ride);
        }}
        onClose={() => console.log('Notification closed')}
      />
    </div>
  );
};

export default DriverDashboard;