import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { 
  Loader2, 
  Trash2, 
  Edit, 
  Upload, 
  Search, 
  X, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminServices = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [showCsvFormat, setShowCsvFormat] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'hospital',
    category: 'emergency',
    description: '',
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    location: {
      type: 'Point',
      coordinates: [0, 0],
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        fullAddress: ''
      }
    },
    operatingHours: {
      is24Hours: false,
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '09:00', close: '17:00', isOpen: true },
      sunday: { open: '09:00', close: '17:00', isOpen: true }
    },
    isActive: true
  });

  const DEFAULT_DAY_HOURS = { open: '09:00', close: '17:00', isOpen: false };

  // Fetch services
  const { data: services, isLoading, isError } = useQuery(
    ['admin-services', search],
    async () => {
      const res = await api.get('/api/services', { 
        params: { 
          search,
          limit: 100 
        } 
      });
      return res.data.data.services;
    }
  );

  // Bulk upload mutation
  const uploadMutation = useMutation(
    (formData) => api.post('/api/admin/services/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    {
      onSuccess: () => {
        toast.success('Services uploaded successfully!');
        queryClient.invalidateQueries('admin-services');
        setShowUpload(false);
        setCsvFile(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload services');
      }
    }
  );

  // Delete service mutation
  const deleteMutation = useMutation(
    (id) => api.delete(`/api/services/${id}`),
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

  // Update service mutation
  const updateMutation = useMutation(
    (updatedService) => {
      return api.put(`/api/services/${editingService}`, updatedService);
    },
    {
      onSuccess: () => {
        toast.success('Service updated successfully');
        setEditingService(null);
        queryClient.invalidateQueries('admin-services');
      },
      onError: (error) => {
        console.error('Update error details:', error.response?.data);
        toast.error(error.response?.data?.message || 'Failed to update service');
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
    await uploadMutation.mutateAsync(formData);
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setServiceForm({
      name: service.name,
      type: service.type,
      category: service.category || 'emergency',
      description: service.description,
      contact: {
        phone: service.contact?.phone || '',
        email: service.contact?.email || '',
        website: service.contact?.website || ''
      },
      location: {
        type: service.location.type || 'Point',
        coordinates: service.location.coordinates,
        address: {
          street: service.location.address?.street || '',
          city: service.location.address?.city || '',
          state: service.location.address?.state || '',
          pincode: service.location.address?.pincode || '',
          country: service.location.address?.country || 'India',
          fullAddress: service.location.address?.fullAddress || ''
        }
      },
      operatingHours: service.operatingHours || {
        is24Hours: false,
        monday: { open: '09:00', close: '17:00', isOpen: true },
        tuesday: { open: '09:00', close: '17:00', isOpen: true },
        wednesday: { open: '09:00', close: '17:00', isOpen: true },
        thursday: { open: '09:00', close: '17:00', isOpen: true },
        friday: { open: '09:00', close: '17:00', isOpen: true },
        saturday: { open: '09:00', close: '17:00', isOpen: true },
        sunday: { open: '09:00', close: '17:00', isOpen: true }
      },
      isActive: service.isActive !== false
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: serviceForm.name,
        type: serviceForm.type,
        category: serviceForm.category,
        description: serviceForm.description,
        contact: serviceForm.contact,
        location: {
          type: 'Point',
          coordinates: serviceForm.location.coordinates,
          address: serviceForm.location.address
        },
        operatingHours: serviceForm.operatingHours,
        isActive: serviceForm.isActive
      };

      await updateMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update service');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDayToggle = (day) => {
    setServiceForm(prev => {
      const currentDay = prev.operatingHours?.[day] || DEFAULT_DAY_HOURS;
      return {
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: {
            ...currentDay,
            isOpen: !currentDay.isOpen
          }
        }
      };
    });
  };

  const handle24HoursToggle = () => {
    setServiceForm(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        is24Hours: !prev.operatingHours.is24Hours
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value
      }
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: {
          ...prev.location.address,
          [name]: value
        }
      }
    }));
  };

  const handleCoordinatesChange = (index, value) => {
    const newCoordinates = [...serviceForm.location.coordinates];
    newCoordinates[index] = parseFloat(value) || 0;
    setServiceForm(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: newCoordinates
      }
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setServiceForm(prev => {
      const currentDay = prev.operatingHours?.[day] || DEFAULT_DAY_HOURS;
      return {
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [day]: {
            ...currentDay,
            [field]: value
          }
        }
      };
    });
  };

  return (
    <div className="p-8 sm:p-12 max-w-7xl mx-auto">
      {/* Header with improved styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="flex flex-col space-y-2">
          <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Management</span>
          <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
            Emergency <span className="not-italic text-[var(--text-color)]">Services</span>
          </h1>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary px-10 py-5 text-sm flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-[var(--primary-color)]/20"
        >
          {showUpload ? (
            <>
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Bulk Upload</span>
            </>
          )}
        </button>
      </div>

      {/* Search and Upload Section */}
      <div className="mb-12 space-y-6">
        <div className="relative max-w-2xl bg-white p-2 rounded-3xl border border-[var(--border-color)] shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search className="w-5 h-5 opacity-40" />
          </div>
          <input
            type="text"
            placeholder="Search network: hospitals, clinics, stations..."
            className="w-full pl-14 pr-6 py-4 bg-transparent focus:outline-none text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="bg-white rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-10 border-b border-[var(--border-color)]">
              <h3 className="text-2xl font-black text-[var(--primary-color)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                Bulk Service <span className="not-italic text-[var(--text-color)]">Inclusion</span>
              </h3>
            </div>
            
            <div className="card-body">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CSV File Upload
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowCsvFormat(!showCsvFormat)}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {showCsvFormat ? 'Hide format' : 'Show required format'}
                </button>
              </div>
              
              {showCsvFormat && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 text-sm border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium mb-3 text-gray-800 dark:text-white">Required CSV Format</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Column</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Required</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Example</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">name</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Yes</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">City General Hospital</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">type</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">Yes</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">hospital</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block">
                    <span className="sr-only">Choose CSV file</span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                        dark:file:bg-gray-700 dark:file:text-blue-300
                        dark:hover:file:bg-gray-600"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={uploadMutation.isLoading}
                  className="btn btn-success shadow-soft disabled:opacity-70"
                >
                  {uploadMutation.isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span>Upload CSV</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
      ) : isError ? (
        <div className="alert alert-error mb-4">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <div className="font-bold">Failed to load services</div>
            <div className="text-sm">Please try again.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {services?.length === 0 ? (
            <div className="alert mb-4">
              <span>No services found matching your search criteria</span>
            </div>
          ) : (
            services?.map((service) => (
              <div key={service._id} className="card shadow-card dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all">
                {editingService === service._id ? (
                  <form onSubmit={handleUpdate} className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Edit Service</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
                            <input
                              type="text"
                              name="name"
                              value={serviceForm.name}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <select
                              name="type"
                              value={serviceForm.type}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                            >
                              <option value="hospital">Hospital</option>
                              <option value="police">Police Station</option>
                              <option value="fire">Fire Station</option>
                              <option value="ambulance">Ambulance Service</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                              name="category"
                              value={serviceForm.category}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                              <option value="emergency">Emergency</option>
                              <option value="general">General</option>
                              <option value="specialized">Specialized</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                              name="description"
                              value={serviceForm.description}
                              onChange={handleInputChange}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-4 text-gray-700 dark:text-gray-300">Contact Information</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                            <input
                              type="text"
                              name="phone"
                              value={serviceForm.contact.phone}
                              onChange={handleContactChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                              type="email"
                              name="email"
                              value={serviceForm.contact.email}
                              onChange={handleContactChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                            <input
                              type="url"
                              name="website"
                              value={serviceForm.contact.website}
                              onChange={handleContactChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                        
                        <h4 className="font-medium mt-6 mb-4 text-gray-700 dark:text-gray-300">Location Details</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
                            <input
                              type="text"
                              name="fullAddress"
                              value={serviceForm.location.address.fullAddress}
                              onChange={handleAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label>
                              <input
                                type="text"
                                name="street"
                                value={serviceForm.location.address.street}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                              <input
                                type="text"
                                name="city"
                                value={serviceForm.location.address.city}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                              <input
                                type="text"
                                name="state"
                                value={serviceForm.location.address.state}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                              <input
                                type="text"
                                name="pincode"
                                value={serviceForm.location.address.pincode}
                                onChange={handleAddressChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                              <input
                                type="number"
                                step="any"
                                value={serviceForm.location.coordinates[1]}
                                onChange={(e) => handleCoordinatesChange(1, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                              <input
                                type="number"
                                step="any"
                                value={serviceForm.location.coordinates[0]}
                                onChange={(e) => handleCoordinatesChange(0, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mt-6 mb-4 text-gray-700 dark:text-gray-300">Operating Hours</h4>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is24Hours"
                          checked={serviceForm.operatingHours.is24Hours}
                          onChange={handle24HoursToggle}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="is24Hours" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          24/7 Open
                        </label>
                      </div>
                      
                      {!serviceForm.operatingHours?.is24Hours && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <div key={day} className="border p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{day}</span>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={(serviceForm.operatingHours?.[day]?.isOpen) || false}
                                    onChange={() => handleDayToggle(day)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                  />
                                </div>
                              </div>
                              
                              {serviceForm.operatingHours?.[day]?.isOpen && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Open</label>
                                    <input
                                      type="time"
                                      value={serviceForm.operatingHours?.[day]?.open || '09:00'}
                                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Close</label>
                                    <input
                                      type="time"
                                      value={serviceForm.operatingHours?.[day]?.close || '17:00'}
                                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-6">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={serviceForm.isActive}
                        onChange={() => setServiceForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Active Service
                      </label>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="btn btn-outline btn-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isLoading}
                        className="btn btn-primary btn-sm disabled:opacity-70"
                      >
                        {updateMutation.isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Updating...
                          </span>
                        ) : 'Update Service'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-black text-[var(--primary-color)] italic" style={{ fontFamily: 'var(--font-serif)' }}>{service.name}</h3>
                          {service.isVerified && (
                             <div className="bg-blue-500 text-white p-1 rounded-full"><CheckCircle className="w-3 h-3" /></div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <span className="px-4 py-1.5 bg-[var(--primary-color)]/5 text-[var(--primary-color)] text-[10px] font-black uppercase tracking-widest rounded-full border border-[var(--primary-color)]/10">
                            {service.type}
                          </span>
                          <span className="px-4 py-1.5 bg-[var(--secondary-color)]/10 text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-widest rounded-full border border-[var(--secondary-color)]/20">
                            {service.category}
                          </span>
                          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                             service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                          }`}>
                            {service.isActive ? 'Operational' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Edit service"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
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

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <MapPin className="w-5 h-5 text-blue-500" />
                          Location Details
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{service.location.address.fullAddress}</p>
                          <p>{service.location.address.city}, {service.location.address.state}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Coordinates: {service.location.coordinates[1].toFixed(4)}, {service.location.coordinates[0].toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Clock className="w-5 h-5 text-blue-500" />
                          Operating Hours
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {service.operatingHours?.is24Hours ? (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>24/7 Open</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                                .filter(day => service.operatingHours?.[day]?.isOpen)
                                .map(day => (
                                  <div key={day} className="flex justify-between">
                                    <span className="capitalize text-gray-700 dark:text-gray-300">{day}:</span>
                                    <span className="font-medium">
                                      {(service.operatingHours?.[day]?.open) || '09:00'} - {(service.operatingHours?.[day]?.close) || '17:00'}
                                    </span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium mb-3 text-gray-700 dark:text-gray-300">Contact Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        {service.contact?.phone && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Phone</p>
                            <p className="text-gray-800 dark:text-gray-200">{service.contact.phone}</p>
                          </div>
                        )}
                        {service.contact?.email && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Email</p>
                            <p className="text-gray-800 dark:text-gray-200">{service.contact.email}</p>
                          </div>
                        )}
                        {service.contact?.website && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Website</p>
                            <a 
                              href={service.contact.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                              {service.contact.website}
                            </a>
                          </div>
                        )}
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