import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, MapPin } from 'lucide-react';
import { getUserRides } from '../../api/userService';
import { predictETA } from '../../api/predictionService';
import { Link } from 'react-router-dom';
import SimplifiedRideMap from '../../components/user/SimplifiedRideMap';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [showRideForm, setShowRideForm] = useState(false);
  const [rideData, setRideData] = useState({
    originLat: '0.0',
    originLng: '0.0',
    destLat: '0.0',
    destLng: '0.0'
    // Removed trafficIndex and weather fields
  });
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [userRides, setUserRides] = useState([]);
  const [totalRides, setTotalRides] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [avgSpend, setAvgSpend] = useState(0);
  const [error, setError] = useState(null);
  const [activeRide, setActiveRide] = useState(null);

  useEffect(() => {
    fetchUserRides();
  }, []);

  const fetchUserRides = async () => {
    try {
      setError(null);
      console.log('Fetching user rides...');
      const response = await getUserRides();
      console.log('User rides response:', response);
      const rides = response.data;
      console.log('User rides data:', rides);
      setUserRides(rides);
      setTotalRides(rides.length);
      
      // Find the most recent active ride (ASSIGNED or IN_PROGRESS)
      const activeRide = rides.find(ride => 
        ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS'
      );
      setActiveRide(activeRide || null);
      
      // Calculate total and average spend
      if (rides.length > 0) {
        // Use actual earnings if available, otherwise calculate based on ETA
        const totalSpent = rides.reduce((sum, ride) => {
          if (ride.earnings && ride.earnings > 0) {
            console.log(`Using actual earnings for ride ${ride.id}: $${ride.earnings}`);
            return sum + ride.earnings;
          } else if (ride.eta) {
            // Fallback to calculated fare: $2.50 + $1.25 per minute of ETA
            const calculatedFare = 2.50 + (ride.eta * 1.25);
            console.log(`Calculated fare for ride ${ride.id} with ETA ${ride.eta}: $${calculatedFare}`);
            return sum + calculatedFare;
          }
          console.log(`No earnings or ETA for ride ${ride.id}`);
          return sum;
        }, 0);
        
        console.log('Total spent:', totalSpent);
        setTotalSpend(parseFloat(totalSpent.toFixed(2)));
        const averageSpend = rides.length > 0 ? totalSpent / rides.length : 0;
        console.log('Average spend:', averageSpend);
        setAvgSpend(parseFloat(averageSpend.toFixed(2)));
      } else {
        setTotalSpend(0);
        setAvgSpend(0);
      }
    } catch (error) {
      console.error('Error fetching user rides:', error);
      setError('Failed to load ride history. Please try refreshing the page.');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleRideInputChange = (e) => {
    const { name, value } = e.target;
    setRideData(prev => ({
      ...prev,
      [name]: name.includes('Lat') || name.includes('Lng') 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handlePredictETA = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For ETA prediction, we'll use default values for traffic and weather
      const predictionData = {
        originLat: parseFloat(rideData.originLat),
        originLng: parseFloat(rideData.originLng),
        destLat: parseFloat(rideData.destLat),
        destLng: parseFloat(rideData.destLng),
        trafficIndex: 0.5, // Default value
        weather: 'sunny' // Default value
      };
      
      const response = await predictETA(predictionData);
      setEta(response.data.predictedETA);
    } catch (error) {
      console.error('ETA prediction error:', error);
      setError('Failed to predict ETA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's what's happening with your account today.</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleLogout}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Active Ride Tracking Map */}
      {activeRide && (
        <div className="mb-6">
          <SimplifiedRideMap
            rideId={activeRide.id}
            rideStatus={activeRide.status}
            userLocation={{ x: activeRide.originLng, y: activeRide.originLat }}
            driverLocation={{ x: activeRide.taxi?.longitude || 0, y: activeRide.taxi?.latitude || 0 }}
            destination={{ x: activeRide.destLng, y: activeRide.destLat }}
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Rides</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{totalRides}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spend</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">${totalSpend.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Spend</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">${avgSpend.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-4">
            <Link 
              to="/user/request-ride"
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <span>Request New Ride</span>
              <MapPin className="h-5 w-5 text-gray-500" />
            </Link>
            <Link 
              to="/user/ride-history"
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <span>View Ride History</span>
              <MapPin className="h-5 w-5 text-gray-500" />
            </Link>
            <Link 
              to="/user/profile"
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <span>Update Profile</span>
              <User className="h-5 w-5 text-gray-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;