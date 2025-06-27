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
    const res = await api.get('/analytics/overview');
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
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      tension: 0.3,
      fill: true
    }]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Emergency Services Analytics</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-red-500" />
            <h3 className="text-gray-500 text-sm font-medium">Active Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{activeAlerts || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-green-500" />
            <h3 className="text-gray-500 text-sm font-medium">Resolved Alerts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{resolvedAlerts || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            <h3 className="text-gray-500 text-sm font-medium">Avg Response Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {averageResponseTime ? `${averageResponseTime} mins` : 'N/A'}
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