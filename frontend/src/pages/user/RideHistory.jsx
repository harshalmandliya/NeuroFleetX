import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserRides } from '../../api/userService';
import { explainRide } from '../../api/aiService';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState({}); // Track which rides are being explained
  const [explanations, setExplanations] = useState({}); // Store explanations
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      setLoading(true);
      console.log('Fetching ride history...');
      const response = await getUserRides();
      console.log('Ride history response:', response);
      const rides = response.data;
      console.log('Ride history data:', rides);
      
      setRides(rides);
      
      // Calculate stats
      const totalRides = rides.length;
      const totalSpent = rides.reduce((sum, ride) => {
        if (ride.earnings) {
          return sum + ride.earnings;
        } else if (ride.eta) {
          // Fallback to calculated fare: $2.50 + $1.25 per minute of ETA
          return sum + (2.50 + (ride.eta * 1.25));
        }
        return sum;
      }, 0);
      
      setStats({
        totalRides,
        totalSpent: parseFloat(totalSpent.toFixed(2))
      });
    } catch (error) {
      console.error('Error fetching ride history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainRide = async (rideId) => {
    // If we already have an explanation, toggle it off
    if (explanations[rideId]) {
      setExplanations(prev => {
        const newExplanations = { ...prev };
        delete newExplanations[rideId];
        return newExplanations;
      });
      return;
    }
    
    // Set loading state for this ride
    setExplaining(prev => ({ ...prev, [rideId]: true }));
    
    try {
      const response = await explainRide(rideId);
      setExplanations(prev => ({ ...prev, [rideId]: response.data }));
    } catch (error) {
      console.error('Error explaining ride:', error);
      setExplanations(prev => ({ ...prev, [rideId]: 'Sorry, I couldn\'t explain this ride right now.' }));
    } finally {
      setExplaining(prev => {
        const newExplaining = { ...prev };
        delete newExplaining[rideId];
        return newExplaining;
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'ASSIGNED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ride History</h1>
          <p className="mt-1 text-sm text-gray-500">View your past and current rides</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-6">
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
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">${stats.totalSpent.toFixed(2)}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rides List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {rides.length === 0 ? (
            <li className="px-6 py-4 text-center">
              <p className="text-gray-500">No rides found</p>
            </li>
          ) : (
            rides.map((ride) => (
              <li key={ride.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Ride #{ride.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(ride.timestamp).toLocaleDateString()} at {new Date(ride.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {getStatusBadge(ride.status)}
                      </div>
                      {(ride.status === 'ASSIGNED' || ride.status === 'IN_PROGRESS') ? (
                        <Link 
                          to={`/user/ride-tracking/${ride.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Track Ride
                        </Link>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="text-sm text-gray-500">
                            ${ride.earnings ? ride.earnings.toFixed(2) : (ride.eta ? (2.50 + (ride.eta * 1.25)).toFixed(2) : 'N/A')}
                          </div>
                          <button
                            onClick={() => handleExplainRide(ride.id)}
                            disabled={explaining[ride.id]}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                          >
                            {explaining[ride.id] ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Thinking...
                              </>
                            ) : (
                              <>
                                <Bot className="h-3 w-3 mr-1" />
                                Ask AI
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mr-6 flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        From: {ride.originLat.toFixed(4)}, {ride.originLng.toFixed(4)}
                      </div>
                      <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                        <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        To: {ride.destLat.toFixed(4)}, {ride.destLng.toFixed(4)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      ETA: {ride.eta ? `${ride.eta} min` : 'N/A'}
                    </div>
                  </div>
                </div>
                {/* AI Explanation */}
                {explanations[ride.id] && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-md border border-purple-200">
                    <div className="flex items-start">
                      <Bot className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-purple-800">
                        {explanations[ride.id]}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default RideHistory;