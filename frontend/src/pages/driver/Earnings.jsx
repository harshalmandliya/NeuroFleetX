import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDriverRides } from '../../api/driverService';

const Earnings = () => {
  const [dailyEarnings, setDailyEarnings] = useState([]);
  const [hourlyEarnings, setHourlyEarnings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
    monthEarnings: 0,
    avgPerRide: 0
  });
  const [dateRange, setDateRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        setLoading(true);
        const response = await getDriverRides();
        const rides = response.data;
        
        // Process data for charts and stats
        processData(rides);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [dateRange]);

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

  const processData = (rides) => {
    // Filter completed rides
    const completedRides = rides.filter(ride => ride.status === 'COMPLETED');
    
    // Calculate date ranges based on selected filter
    const today = new Date();
    let startDate;
    
    switch (dateRange) {
      case 'day':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
    }
    
    // Filter rides based on selected date range
    const filteredRides = completedRides.filter(ride => {
      if (ride.timestamp) {
        const rideDate = new Date(ride.timestamp);
        return rideDate >= startDate;
      }
      return false;
    });
    
    // Use actual earnings from the database
    const getActualEarnings = (ride) => {
      if (ride.earnings) return ride.earnings;
      // Fallback to calculated fare if earnings not available
      const eta = ride.eta;
      if (!eta) return 0;
      return 2.50 + (eta * 1.25);
    };
    
    // Calculate total earnings for the selected period
    const totalEarnings = filteredRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
    const avgPerRide = filteredRides.length > 0 ? totalEarnings / filteredRides.length : 0;
    
    // For stats display, we still show today, week, and month stats
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayRides = completedRides.filter(ride => {
      if (ride.timestamp) {
        const rideDate = new Date(ride.timestamp);
        return rideDate.toDateString() === today.toDateString();
      }
      return false;
    });
    
    const weekRides = completedRides.filter(ride => {
      if (ride.timestamp) {
        const rideDate = new Date(ride.timestamp);
        return rideDate >= startOfWeek;
      }
      return false;
    });
    
    const monthRides = completedRides.filter(ride => {
      if (ride.timestamp) {
        const rideDate = new Date(ride.timestamp);
        return rideDate >= startOfMonth;
      }
      return false;
    });
    
    const todayEarnings = todayRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
    const weekEarnings = weekRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
    const monthEarnings = monthRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
    
    setStats({
      todayEarnings,
      weekEarnings,
      monthEarnings,
      avgPerRide
    });
    
    // Generate chart data based on selected date range
    if (dateRange === 'day') {
      // Generate hourly earnings data (today)
      const hourlyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourRides = filteredRides.filter(ride => {
          if (ride.timestamp) {
            const rideDate = new Date(ride.timestamp);
            return rideDate.getHours() === hour;
          }
          return false;
        });
        
        const earnings = hourRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
        
        // Convert to 12-hour format for display
        const hourLabel = hour === 0 ? '12AM' : 
                         hour < 12 ? `${hour}AM` : 
                         hour === 12 ? '12PM' : 
                         `${hour - 12}PM`;
        
        hourlyData.push({
          hour: hourLabel,
          earnings: parseFloat(earnings.toFixed(2))
        });
      }
      
      setDailyEarnings([]); // Clear daily data
      setHourlyEarnings(hourlyData);
    } else if (dateRange === 'week') {
      // Generate daily earnings data (last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dayName = days[date.getDay()];
        
        const dayRides = filteredRides.filter(ride => {
          if (ride.timestamp) {
            const rideDate = new Date(ride.timestamp);
            return rideDate.toDateString() === date.toDateString();
          }
          return false;
        });
        
        const earnings = dayRides.reduce((sum, ride) => sum + getActualEarnings(ride), 0);
        
        dailyData.push({
          name: dayName,
          earnings: parseFloat(earnings.toFixed(2))
        });
      }
      
      setDailyEarnings(dailyData);
      setHourlyEarnings([]); // Clear hourly data
    } else {
      // For month/year, show daily earnings for the period
      const dailyData = [];
      
      // Create a map of dates to earnings
      const dateEarningsMap = {};
      
      filteredRides.forEach(ride => {
        if (ride.timestamp) {
          const rideDate = new Date(ride.timestamp);
          const dateKey = rideDate.toDateString();
          const earnings = getActualEarnings(ride);
          
          if (!dateEarningsMap[dateKey]) {
            dateEarningsMap[dateKey] = 0;
          }
          dateEarningsMap[dateKey] += earnings;
        }
      });
      
      // Convert to array and sort by date
      Object.keys(dateEarningsMap).forEach(dateKey => {
        const dateObj = new Date(dateKey);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        dailyData.push({
          name: formattedDate,
          earnings: parseFloat(dateEarningsMap[dateKey].toFixed(2))
        });
      });
      
      // Sort by date
      dailyData.sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA - dateB;
      });
      
      setDailyEarnings(dailyData);
      setHourlyEarnings([]); // Clear hourly data
    }
    
    // Set payment history (last 5 completed rides from filtered data)
    const recentRides = filteredRides.slice(0, 5).map(ride => {
      // Calculate actual distance if coordinates are available
      let distance = 'N/A';
      if (ride.originLat && ride.originLng && ride.destLat && ride.destLng) {
        const dist = calculateDistance(ride.originLat, ride.originLng, ride.destLat, ride.destLng);
        distance = `${dist.toFixed(1)} km`;
      } else if (ride.eta) {
        // Fallback to ETA-based estimation if coordinates not available
        distance = `${(ride.eta * 0.8).toFixed(1)} km`; // Estimate distance based on ETA in kilometers
      }
      
      return {
        date: ride.timestamp ? new Date(ride.timestamp).toLocaleDateString() : 'N/A',
        rideId: `RIDE-${ride.id}`,
        passenger: ride.user ? `${ride.user.firstName} ${ride.user.lastName}` : 'Passenger',
        distance: distance,
        earnings: `$${getActualEarnings(ride).toFixed(2)}`,
        status: 'Paid'
      };
    });
    
    setPaymentHistory(recentRides);
  };

  // Export payment history to CSV
  const exportToCSV = () => {
    if (paymentHistory.length === 0) {
      alert('No payment history to export');
      return;
    }

    // Create CSV content
    let csvContent = 'Date,Ride ID,Passenger,Distance,Earnings,Status\n';
    
    paymentHistory.forEach(payment => {
      csvContent += `"${payment.date}","${payment.rideId}","${payment.passenger}","${payment.distance}","${payment.earnings}","${payment.status}"\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `earnings_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Earnings</h2>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.todayEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.weekEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.monthEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Per Ride</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.avgPerRide.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Earnings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {dateRange === 'day' ? 'Hourly Earnings (Today)' : 
             dateRange === 'week' ? 'Daily Earnings (Last Week)' : 
             dateRange === 'month' ? 'Daily Earnings (This Month)' : 
             'Daily Earnings (This Year)'}
          </h3>
          <div className="h-80">
            {dateRange === 'day' && hourlyEarnings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Earnings ($)" />
                </LineChart>
              </ResponsiveContainer>
            ) : dailyEarnings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyEarnings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="earnings" fill="#10b981" name="Earnings ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No earnings data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Payment History */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Payments</h3>
          <div className="h-80 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ride ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentHistory.length > 0 ? (
                  paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.rideId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.passenger}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.distance}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.earnings}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No payment history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;