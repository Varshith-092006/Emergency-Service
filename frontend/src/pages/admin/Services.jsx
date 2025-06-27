import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { Loader2, Plus, Trash2, Edit, Upload, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'hospital',
    phone: '',
    address: ''
  });

  // Fetch services
  const { data: services, isLoading, isError } = useQuery(
    ['admin-services', search],
    async () => {
      const res = await api.get('/services', { params: { search } });
      return res.data.data.services;
    }
  );

  // Bulk upload mutation
  const uploadMutation = useMutation(
    (formData) => api.post('/admin/services/bulk-upload', formData),
    {
      onSuccess: () => {
        toast.success('Services uploaded successfully!');
        queryClient.invalidateQueries('admin-services');
        setShowUpload(false);
        setCsvFile(null);
      },
      onError: () => {
        toast.error('Failed to upload services');
      }
    }
  );

  // Delete service mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/services/${id}`),
    {
      onSuccess: () => {
        toast.success('Service deleted successfully');
        queryClient.invalidateQueries('admin-services');
      },
      onError: () => {
        toast.error('Failed to delete service');
      }
    }
  );

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }
    const formData = new FormData();
    formData.append('csv', csvFile);
    uploadMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setServiceForm({
      name: service.name,
      type: service.type,
      phone: service.contact?.phone || '',
      address: service.location?.address?.fullAddress || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/services/${editingService}`, serviceForm);
      toast.success('Service updated successfully');
      setEditingService(null);
      queryClient.invalidateQueries('admin-services');
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Emergency Services</h1>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
        >
          {showUpload ? <X className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          {showUpload ? 'Cancel' : 'Bulk Upload'}
        </button>
      </div>

      {/* Search and Upload Section */}
      <div className="mb-6">
        <div className="relative max-w-md mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search services..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  type="submit"
                  disabled={uploadMutation.isLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadMutation.isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  Upload
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                CSV should include columns: name, type, phone, address
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      ) : isError ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load services. Please try again.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {services?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500">No services found</p>
            </div>
          ) : (
            services?.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow overflow-hidden">
                {editingService === service._id ? (
                  <form onSubmit={handleUpdate} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={serviceForm.type}
                          onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                        >
                          <option value="hospital">Hospital</option>
                          <option value="police">Police</option>
                          <option value="ambulance">Ambulance</option>
                          <option value="fire">Fire Station</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={serviceForm.phone}
                          onChange={(e) => setServiceForm({...serviceForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={serviceForm.address}
                          onChange={(e) => setServiceForm({...serviceForm, address: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="px-4 py-2 border border-gray-300 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            service.type === 'hospital' ? 'bg-red-100 text-red-800' :
                            service.type === 'police' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {service.type}
                          </span>
                          {service.contact?.phone && (
                            <a 
                              href={`tel:${service.contact.phone}`} 
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {service.contact.phone}
                            </a>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {service.location?.address?.fullAddress || 'Address not available'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Edit service"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Delete service"
                          disabled={deleteMutation.isLoading}
                        >
                          {deleteMutation.isLoading && deleteMutation.variables === service._id ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminServices;