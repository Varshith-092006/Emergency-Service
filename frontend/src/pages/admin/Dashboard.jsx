import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const AdminDashboard = () => {
  const { data, isLoading, isError, error } = useQuery('admin-dashboard', async () => {
    const res = await api.get('/api/admin/dashboard');
    return res.data.data;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-6">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700">Failed to load dashboard data</h3>
        <p className="text-sm text-red-600 mt-2">{error?.message || 'Please try again later'}</p>
      </div>
    );
  }

  const { overview, serviceTypes = [], recentAlerts = [] } = data || {};

  // Fallback data in case API returns empty
  const fallbackServiceTypes = [
    { _id: 'hospital', count: 12 },
    { _id: 'police', count: 8 },
    { _id: 'fire', count: 5 },
    { _id: 'ambulance', count: 7 }
  ];

  // Pie Chart Data
  const serviceTypeData = {
    labels: (serviceTypes.length ? serviceTypes : fallbackServiceTypes).map((t) => t._id.toUpperCase()),
    datasets: [{
      label: 'Service Types',
      data: (serviceTypes.length ? serviceTypes : fallbackServiceTypes).map((t) => t.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',  // blue
        'rgba(239, 68, 68, 0.7)',   // red
        'rgba(34, 197, 94, 0.7)',   // green
        'rgba(245, 158, 11, 0.7)',  // yellow
        'rgba(139, 92, 246, 0.7)',  // purple
        'rgba(100, 116, 139, 0.7)', // slate
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(100, 116, 139, 1)',
      ],
      borderWidth: 1,
    }]
  };

  // Bar Chart Data
  const alertTimelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'SOS Alerts',
      data: [12, 19, 3, 5, 2, 3, 15],
      backgroundColor: 'rgba(239, 68, 68, 0.7)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 1,
    }]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Services</h3>
          <p className="text-3xl font-bold text-gray-800">{overview?.totalServices || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-800">{overview?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium">Total SOS Alerts</h3>
          <p className="text-3xl font-bold text-gray-800">{overview?.totalSos || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-medium">Active SOS</h3>
          <p className="text-3xl font-bold text-gray-800">{overview?.activeSos || 0}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Types Distribution</h3>
          <div className="h-80">
            <Pie
              data={serviceTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">SOS Alerts Timeline</h3>
          <div className="h-80">
            <Bar
              data={alertTimelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  title: {
                    display: true,
                    text: 'Last 7 Months',
                    font: {
                      size: 14
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      {recentAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent SOS Alerts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.user?.name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {alert.emergencyType?.toLowerCase() || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.location?.address || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.status === 'active' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;