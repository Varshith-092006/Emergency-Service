import React from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Loader2, AlertTriangle, Activity, MapPin, Clock } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  LineElement,
  PointElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  LineElement,
  PointElement
);

const AdminAnalytics = () => {
  const { data, isLoading, isError, error } = useQuery('admin-analytics', async () => {
    const res = await api.get('/api/analytics/overview');
    return res.data.data;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        <span className="ml-3 text-gray-600">Loading analytics data...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-lg p-6">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-700">Failed to load analytics</h3>
        <p className="text-sm text-red-600 mt-2">
          {error?.message || 'Please try again later'}
        </p>
      </div>
    );
  }

  const { 
    serviceDistribution = [], 
    sosDistribution = [], 
    responseTimes = [],
    activeAlerts,
    resolvedAlerts,
    averageResponseTime
  } = data;

  // Chart data configurations
  const serviceTypeData = {
    labels: serviceDistribution.map((s) => s._id.toUpperCase()),
    datasets: [{
      data: serviceDistribution.map((s) => s.count),
      backgroundColor: [
        '#3b82f6', // blue (police)
        '#ef4444', // red (hospital)
        '#22c55e', // green (ambulance)
        '#f59e0b', // yellow (fire)
        '#8b5cf6', // purple
        '#64748b', // slate
        '#eab308', // amber
      ],
      borderWidth: 1,
    }]
  };

  const sosTypeData = {
    labels: sosDistribution.map((s) => s._id.toUpperCase()),
    datasets: [{
      label: 'SOS Alerts',
      data: sosDistribution.map((s) => s.count),
      backgroundColor: '#ef4444',
    }]
  };

  const responseTimeData = {
    labels: responseTimes.map((r) => r.month),
    datasets: [{
      label: 'Average Response Time (minutes)',
      data: responseTimes.map((r) => r.time),
      borderColor: '#FF8A50',
      backgroundColor: 'rgba(255, 138, 80, 0.1)',
      borderWidth: 4,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#3D2C4D',
      pointBorderColor: '#FF8A50',
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2 mb-12">
        <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Data Insights</span>
        <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
          System <span className="not-italic text-[var(--text-color)]">Analytics</span>
        </h1>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-600">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">Active Alerts</h3>
          </div>
          <p className="text-5xl font-black text-red-600 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{activeAlerts || 0}</p>
        </div>
        
        <div className="bg-white rounded-[2rem] border border-[var(--border-color)] p-8 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">Resolved Alerts</h3>
          </div>
          <p className="text-5xl font-black text-green-600 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>{resolvedAlerts || 0}</p>
        </div>
        
        <div className="bg-[var(--primary-color)] rounded-[2rem] p-8 shadow-xl group">
          <div className="flex items-center gap-4 mb-6 text-white/60">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-[var(--secondary-color)]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Avg Response</h3>
          </div>
          <p className="text-5xl font-black text-[var(--secondary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
            {averageResponseTime ? `${averageResponseTime}m` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Emergency Service Distribution
          </h3>
          <div className="h-80">
            <Pie
              data={serviceTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
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

        {/* SOS Alert Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            SOS Alert Types
          </h3>
          <div className="h-80">
            <Bar
              data={sosTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Response Times Line Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Response Times
        </h3>
        <div className="h-96">
          <Line
            data={responseTimeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Minutes'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;