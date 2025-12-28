import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, DollarSign, MapPin, Navigation } from 'lucide-react';
import { getUserRides } from '../../api/userService';

const Analytics = () => {
  const [rideData, setRideData] = useState([]);
  const [spendingData, setSpendingData] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [stats, setStats] = useState({
    totalRides: 0,
    avgDuration: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchRideData();
  }, []);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const fetchRideData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserRides();
      const rides = response.data;
      
      // Calculate stats
      const totalRides = rides.length;
      const totalDuration = rides.reduce((sum, ride) => sum + (ride.eta || 0), 0);
      const avgDuration = totalRides > 0 ? (totalDuration / totalRides).toFixed(1) : 0;
      
      // Calculate total spend using actual earnings when available, fallback to ETA calculation
      const totalSpent = rides.reduce((sum, ride) => {
        if (ride.earnings && ride.earnings > 0) {
          // Use actual earnings for completed rides
          return sum + ride.earnings;
        } else if (ride.eta) {
          // Fallback to calculated fare: $2.50 + $1.25 per minute of ETA
          const fare = 2.50 + (ride.eta * 1.25);
          return sum + fare;
        }
        return sum;
      }, 0);
      
      setStats({
        totalRides,
        avgDuration,
        totalSpent: totalSpent.toFixed(2)
      });
      
      setRideData(rides);
      
      // Process spending data - one entry per ride
      const spendingDataArray = rides.map((ride, index) => {
        let fare = 0;
        if (ride.earnings && ride.earnings > 0) {
          // Use actual earnings for completed rides
          fare = ride.earnings;
        } else if (ride.eta) {
          // Fallback to calculated fare: $2.50 + $1.25 per minute of ETA
          fare = 2.50 + (ride.eta * 1.25);
        }
        return {
          name: `Ride ${index + 1}`,
          amount: parseFloat(fare.toFixed(2)),
          eta: ride.eta || 0
        };
      });
      
      setSpendingData(spendingDataArray);

      // Process popular routes based on real data
      const routeCounts = {};
      rides.forEach(ride => {
        if (ride.originLat && ride.originLng && ride.destLat && ride.destLng) {
          // Create a simple route identifier based on coordinates
          const routeKey = `${ride.originLat.toFixed(2)},${ride.originLng.toFixed(2)} to ${ride.destLat.toFixed(2)},${ride.destLng.toFixed(2)}`;
          routeCounts[routeKey] = (routeCounts[routeKey] || 0) + 1;
        }
      });
      
      // Convert to array and sort by count
      const routeArray = Object.entries(routeCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4); // Top 4 routes
      
      setPopularRoutes(routeArray);
    } catch (error) {
      console.error('Error fetching ride data:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Insights about your ride history and spending patterns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Rides</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalRides}</div>
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
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg. Duration</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.avgDuration} min</div>
                  </dd>
                </dl>
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">${stats.totalSpent}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spending Per Ride */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Per Ride</h3>
          <div className="h-80">
            {spendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" name="Amount ($)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No spending data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Popular Routes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Routes</h3>
          <div className="h-80">
            {popularRoutes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={popularRoutes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {popularRoutes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No route data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;