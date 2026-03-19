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
  // const fallbackServiceTypes = [
  //   { _id: 'hospital', count: 12 },
  //   { _id: 'police', count: 8 },
  //   { _id: 'fire', count: 5 },
  //   { _id: 'ambulance', count: 7 }
  // ];

  // Pie Chart Data - ensure we have valid data
  const pieChartData = serviceTypes && serviceTypes.length > 0 ? serviceTypes : fallbackServiceTypes;
  
  const serviceTypeData = {
    labels: pieChartData.map((t) => t._id.toUpperCase()),
    datasets: [{
      label: 'Service Types',
      data: pieChartData.map((t) => t.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(239, 68, 68, 0.7)',
        'rgba(34, 197, 94, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(100, 116, 139, 0.7)',
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
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2 mb-12">
        <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Executive Overview</span>
        <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
          System <span className="not-italic text-[var(--text-color)]">Dashboard</span>
        </h1>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm hover:shadow-xl transition-all group">
          <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-4 opacity-60">Total Services</h3>
          <p className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{overview?.totalServices || 0}</p>
          <div className="mt-6 w-full h-1 bg-[var(--background-color)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--primary-color)] w-3/4"></div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm hover:shadow-xl transition-all group">
          <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-4 opacity-60">Total Users</h3>
          <p className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{overview?.totalUsers || 0}</p>
          <div className="mt-6 w-full h-1 bg-[var(--background-color)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--secondary-color)] w-1/2"></div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm hover:shadow-xl transition-all group">
          <h3 className="text-[var(--text-muted)] text-xs font-black uppercase tracking-widest mb-4 opacity-60">Total SOS</h3>
          <p className="text-5xl font-black text-red-600 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{overview?.totalSos || 0}</p>
          <div className="mt-6 w-full h-1 bg-red-50 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-1/4 animate-pulse"></div>
          </div>
        </div>
        <div className="bg-[var(--primary-color)] rounded-[2rem] p-8 shadow-xl group">
          <h3 className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">Active Alerts</h3>
          <p className="text-5xl font-black text-[var(--secondary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{overview?.activeSos || 0}</p>
          <div className="mt-6 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--secondary-color)] w-full shadow-[0_0_10px_rgba(255,138,80,0.5)]"></div>
          </div>
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
        <div className="bg-white rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-[var(--border-color)]">
            <h3 className="text-2xl font-black text-[var(--primary-color)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
              Recent SOS <span className="not-italic text-[var(--text-color)]">Alerts</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[var(--background-color)]">
                <tr>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Contact</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Emergency</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Origin</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Timestamp</th>
                  <th className="px-10 py-5 text-left text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {recentAlerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/5 flex items-center justify-center text-[var(--primary-color)] font-bold mr-4 border border-[var(--primary-color)]/10">
                          {alert.user?.name?.charAt(0) || 'A'}
                        </div>
                        <span className="text-sm font-bold text-[var(--text-color)]">{alert.user?.name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <span className="text-sm font-medium text-[var(--text-muted)] capitalize">{alert.emergencyType?.toLowerCase() || 'General'}</span>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[var(--text-muted)] font-medium max-w-xs truncate">
                        <MapPin className="w-4 h-4 mr-2 text-[var(--secondary-color)] opacity-50" />
                        {alert.location?.address || 'Geolocation Link'}
                      </div>
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap text-sm text-[var(--text-muted)] font-medium">
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-10 py-8 whitespace-nowrap">
                      <span className={`px-4 py-1.5 inline-flex text-[10px] font-black tracking-widest uppercase rounded-full ${
                        alert.status === 'active' 
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
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