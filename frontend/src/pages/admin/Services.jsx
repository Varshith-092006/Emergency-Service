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
  // Update service mutation
const updateMutation = useMutation(
  (updatedService) => {
    // Log the data being sent for debugging
    console.log('Sending update:', updatedService);
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
        // ... other days
      },
      isActive: service.isActive !== false
    });
  };

  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    // Prepare the data in the exact format expected by the backend
    const updateData = {
  name: serviceForm.name,
  type: serviceForm.type,
  category: serviceForm.category,
  description: serviceForm.description,
  contact: serviceForm.contact,
  location: {
    type: 'Point', // Explicitly set the required type
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
    setServiceForm(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          isOpen: !prev.operatingHours[day].isOpen
        }
      }
    }));
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Emergency Services</h1>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="btn btn-primary"
        >
          {showUpload ? (
            <>
              <X className="w-5 h-5" />
              Cancel Upload
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Bulk Upload
            </>
          )}
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search services..."
            className="input input-bordered pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
                <button 
                  type="button" 
                  onClick={() => setShowCsvFormat(!showCsvFormat)}
                  className="ml-2 text-blue-600 text-xs"
                >
                  {showCsvFormat ? 'Hide format' : 'Show required format'}
                </button>
              </label>
              
              {showCsvFormat && (
                <div className="bg-gray-50 p-3 rounded mb-3 text-sm">
                  <p className="font-medium mb-1">CSV should include these columns:</p>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Column</th>
                          <th>Required</th>
                          <th>Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>name</td>
                          <td>Yes</td>
                          <td>City General Hospital</td>
                        </tr>
                        <tr>
                          <td>type</td>
                          <td>Yes</td>
                          <td>hospital</td>
                        </tr>
                        <tr>
                          <td>phone</td>
                          <td>Yes</td>
                          <td>+911234567890</td>
                        </tr>
                        <tr>
                          <td>longitude</td>
                          <td>Yes</td>
                          <td>77.2090</td>
                        </tr>
                        <tr>
                          <td>latitude</td>
                          <td>Yes</td>
                          <td>28.6139</td>
                        </tr>
                        {/* Add more rows for other fields */}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="file-input file-input-bordered w-full"
                />
                <button
                  type="submit"
                  disabled={uploadMutation.isLoading}
                  className="btn btn-success"
                >
                  {uploadMutation.isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  Upload
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
        </div>
      ) : isError ? (
        <div className="alert alert-error">
          <AlertTriangle className="w-5 h-5" />
          <span>Failed to load services. Please try again.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {services?.length === 0 ? (
            <div className="alert alert-info">
              <span>No services found</span>
            </div>
          ) : (
            services?.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow overflow-hidden">
                {editingService === service._id ? (
                  <form onSubmit={handleUpdate} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Basic Info */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Name*</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={serviceForm.name}
                              onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Type*</label>
                            <select
                              className="select select-bordered w-full"
                              value={serviceForm.type}
                              onChange={(e) => setServiceForm({...serviceForm, type: e.target.value})}
                              required
                            >
                              <option value="hospital">Hospital</option>
                              <option value="police">Police Station</option>
                              <option value="ambulance">Ambulance</option>
                              <option value="fire">Fire Station</option>
                              <option value="pharmacy">Pharmacy</option>
                              <option value="veterinary">Veterinary</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Category*</label>
                            <select
                              className="select select-bordered w-full"
                              value={serviceForm.category}
                              onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})}
                              required
                            >
                              <option value="emergency">Emergency</option>
                              <option value="urgent">Urgent</option>
                              <option value="routine">Routine</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Status</label>
                            <select
                              className="select select-bordered w-full"
                              value={serviceForm.isActive}
                              onChange={(e) => setServiceForm({...serviceForm, isActive: e.target.value === 'true'})}
                            >
                              <option value={true}>Active</option>
                              <option value={false}>Inactive</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="form-label">Phone*</label>
                            <input
                              type="tel"
                              className="input input-bordered w-full"
                              value={serviceForm.contact.phone}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                contact: {...serviceForm.contact, phone: e.target.value}
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="input input-bordered w-full"
                              value={serviceForm.contact.email}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                contact: {...serviceForm.contact, email: e.target.value}
                              })}
                            />
                          </div>
                          <div>
                            <label className="form-label">Website</label>
                            <input
                              type="url"
                              className="input input-bordered w-full"
                              value={serviceForm.contact.website}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                contact: {...serviceForm.contact, website: e.target.value}
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Info */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Longitude*</label>
                            <input
                              type="number"
                              step="any"
                              className="input input-bordered w-full"
                              value={serviceForm.location.coordinates[0]}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  coordinates: [
                                    parseFloat(e.target.value || 0),
                                    serviceForm.location.coordinates[1]
                                  ]
                                }
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Latitude*</label>
                            <input
                              type="number"
                              step="any"
                              className="input input-bordered w-full"
                              value={serviceForm.location.coordinates[1]}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  coordinates: [
                                    serviceForm.location.coordinates[0],
                                    parseFloat(e.target.value || 0)
                                  ]
                                }
                              })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="form-label">Street</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={serviceForm.location.address.street}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  address: {
                                    ...serviceForm.location.address,
                                    street: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div>
                            <label className="form-label">City*</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={serviceForm.location.address.city}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  address: {
                                    ...serviceForm.location.address,
                                    city: e.target.value
                                  }
                                }
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">State*</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={serviceForm.location.address.state}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  address: {
                                    ...serviceForm.location.address,
                                    state: e.target.value
                                  }
                                }
                              })}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label">Pincode</label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              value={serviceForm.location.address.pincode}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  address: {
                                    ...serviceForm.location.address,
                                    pincode: e.target.value
                                  }
                                }
                              })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="form-label">Full Address*</label>
                            <textarea
                              className="textarea textarea-bordered w-full"
                              value={serviceForm.location.address.fullAddress}
                              onChange={(e) => setServiceForm({
                                ...serviceForm,
                                location: {
                                  ...serviceForm.location,
                                  address: {
                                    ...serviceForm.location.address,
                                    fullAddress: e.target.value
                                  }
                                }
                              })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Operating Hours</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <input
                            type="checkbox"
                            checked={serviceForm.operatingHours.is24Hours}
                            onChange={handle24HoursToggle}
                            className="checkbox checkbox-primary"
                          />
                          <span>Open 24 Hours</span>
                        </div>
                        
                        {!serviceForm.operatingHours.is24Hours && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                              <div key={day} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="capitalize font-medium">{day}</span>
                                  <input
                                    type="checkbox"
                                    checked={serviceForm.operatingHours[day]?.isOpen}
                                    onChange={() => handleDayToggle(day)}
                                    className="toggle toggle-primary"
                                  />
                                </div>
                                {serviceForm.operatingHours[day]?.isOpen && (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      className="input input-bordered w-full"
                                      value={serviceForm.operatingHours[day].open}
                                      onChange={(e) => setServiceForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                          ...prev.operatingHours,
                                          [day]: {
                                            ...prev.operatingHours[day],
                                            open: e.target.value
                                          }
                                        }
                                      }))}
                                    />
                                    <span>to</span>
                                    <input
                                      type="time"
                                      className="input input-bordered w-full"
                                      value={serviceForm.operatingHours[day].close}
                                      onChange={(e) => setServiceForm(prev => ({
                                        ...prev,
                                        operatingHours: {
                                          ...prev.operatingHours,
                                          [day]: {
                                            ...prev.operatingHours[day],
                                            close: e.target.value
                                          }
                                        }
                                      }))}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingService(null)}
                        className="btn btn-ghost"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={updateMutation.isLoading}
                      >
                        {updateMutation.isLoading ? (
                          <Loader2 className="animate-spin w-5 h-5" />
                        ) : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="badge badge-primary capitalize">{service.type}</span>
                          <span className="badge badge-secondary capitalize">{service.category}</span>
                          {service.isActive ? (
                            <span className="badge badge-success">Active</span>
                          ) : (
                            <span className="badge badge-error">Inactive</span>
                          )}
                          {service.isVerified && (
                            <span className="badge badge-info">Verified</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="btn btn-sm btn-square btn-ghost"
                          title="Edit service"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="btn btn-sm btn-square btn-ghost text-error"
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

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          Location
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{service.location.address.fullAddress}</p>
                          <p>
                            {service.location.address.city}, {service.location.address.state}
                          </p>
                          <p>Coordinates: {service.location.coordinates[1].toFixed(4)}, {service.location.coordinates[0].toFixed(4)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-gray-500" />
                          Operating Hours
                        </h4>
                        <div className="text-sm text-gray-600">
                          {service.operatingHours?.is24Hours ? (
                            <p>24 Hours Open</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                                .filter(day => service.operatingHours?.[day]?.isOpen)
                                .map(day => (
                                  <div key={day} className="flex justify-between">
                                    <span className="capitalize">{day}:</span>
                                    <span>
                                      {service.operatingHours[day].open} - {service.operatingHours[day].close}
                                    </span>
                                  </div>
                                ))
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Contact</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {service.contact?.phone && (
                          <p>
                            <span className="font-medium">Phone:</span> {service.contact.phone}
                          </p>
                        )}
                        {service.contact?.email && (
                          <p>
                            <span className="font-medium">Email:</span> {service.contact.email}
                          </p>
                        )}
                        {service.contact?.website && (
                          <p>
                            <span className="font-medium">Website:</span> {service.contact.website}
                          </p>
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

// import React, { useState } from 'react';
// import {
//   Loader2, Trash2, Edit, Upload, Search, X, AlertTriangle,
//   MapPin, Clock, ChevronDown, ChevronUp
// } from 'lucide-react';

// const AdminServices = () => {
//   // Mock data for UI demonstration
//   const mockServices = [
//     {
//       _id: '1',
//       name: 'City General Hospital',
//       type: 'hospital',
//       category: 'emergency',
//       isActive: true,
//       isVerified: true,
//       contact: {
//         phone: '+911234567890',
//         email: 'contact@cityhospital.com',
//         website: 'www.cityhospital.com'
//       },
//       location: {
//         coordinates: [77.2090, 28.6139],
//         address: {
//           street: '123 Medical Lane',
//           city: 'Delhi',
//           state: 'Delhi',
//           pincode: '110001',
//           country: 'India',
//           fullAddress: '123 Medical Lane, Delhi, 110001, India'
//         }
//       },
//       operatingHours: {
//         is24Hours: true
//       }
//     },
//     {
//       _id: '2',
//       name: 'Central Police Station',
//       type: 'police',
//       category: 'emergency',
//       isActive: true,
//       contact: {
//         phone: '+911009876543'
//       },
//       location: {
//         coordinates: [77.2165, 28.6243],
//         address: {
//           city: 'Delhi',
//           state: 'Delhi',
//           fullAddress: 'Central Police Station, Delhi, India'
//         }
//       },
//       operatingHours: {
//         is24Hours: false,
//         monday: { open: '08:00', close: '20:00', isOpen: true },
//         tuesday: { open: '08:00', close: '20:00', isOpen: true },
//         wednesday: { open: '08:00', close: '20:00', isOpen: true },
//         thursday: { open: '08:00', close: '20:00', isOpen: true },
//         friday: { open: '08:00', close: '20:00', isOpen: true },
//         saturday: { open: '10:00', close: '18:00', isOpen: true },
//         sunday: { open: '10:00', close: '18:00', isOpen: false }
//       }
//     }
//   ];

//   // State for UI controls
//   const [search, setSearch] = useState('');
//   const [showUpload, setShowUpload] = useState(false);
//   const [showCsvFormat, setShowCsvFormat] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [expandedCards, setExpandedCards] = useState([]);

//   // Toggle card expansion
//   const toggleCardExpand = (id) => {
//     setExpandedCards(prev => 
//       prev.includes(id) 
//         ? prev.filter(item => item !== id) 
//         : [...prev, id]
//     );
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Emergency Services</h1>
//           <p className="text-sm text-gray-600">Manage hospitals, police stations, and other emergency services</p>
//         </div>
//         <button 
//           onClick={() => setShowUpload(!showUpload)}
//           className="btn btn-primary flex items-center gap-2"
//         >
//           {showUpload ? (
//             <>
//               <X size={18} />
//               Cancel Upload
//             </>
//           ) : (
//             <>
//               <Upload size={18} />
//               Bulk Upload
//             </>
//           )}
//         </button>
//       </div>

//       {/* Search and Upload Section */}
//       <div className="mb-6 space-y-4">
//         <div className="relative max-w-md">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <Search className="h-5 w-5 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search services..."
//             className="input input-bordered pl-10 w-full"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         {showUpload && (
//           <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//             <h3 className="font-medium text-lg mb-3">Bulk Upload Services</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Upload CSV File
//                 <button 
//                   type="button" 
//                   onClick={() => setShowCsvFormat(!showCsvFormat)}
//                   className="ml-2 text-blue-600 text-xs hover:underline"
//                 >
//                   {showCsvFormat ? 'Hide format' : 'Show required format'}
//                 </button>
//               </label>
              
//               {showCsvFormat && (
//                 <div className="bg-gray-50 p-3 rounded mb-3 text-sm border border-gray-200">
//                   <p className="font-medium mb-2">CSV should include these columns:</p>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Example</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         <tr>
//                           <td className="px-4 py-2 whitespace-nowrap">name</td>
//                           <td className="px-4 py-2 whitespace-nowrap">Yes</td>
//                           <td className="px-4 py-2 whitespace-nowrap">City General Hospital</td>
//                         </tr>
//                         <tr>
//                           <td className="px-4 py-2 whitespace-nowrap">type</td>
//                           <td className="px-4 py-2 whitespace-nowrap">Yes</td>
//                           <td className="px-4 py-2 whitespace-nowrap">hospital</td>
//                         </tr>
//                         <tr>
//                           <td className="px-4 py-2 whitespace-nowrap">phone</td>
//                           <td className="px-4 py-2 whitespace-nowrap">Yes</td>
//                           <td className="px-4 py-2 whitespace-nowrap">+911234567890</td>
//                         </tr>
//                         <tr>
//                           <td className="px-4 py-2 whitespace-nowrap">longitude</td>
//                           <td className="px-4 py-2 whitespace-nowrap">Yes</td>
//                           <td className="px-4 py-2 whitespace-nowrap">77.2090</td>
//                         </tr>
//                         <tr>
//                           <td className="px-4 py-2 whitespace-nowrap">latitude</td>
//                           <td className="px-4 py-2 whitespace-nowrap">Yes</td>
//                           <td className="px-4 py-2 whitespace-nowrap">28.6139</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex-1">
//                   <input
//                     type="file"
//                     accept=".csv"
//                     className="file-input file-input-bordered w-full"
//                   />
//                 </div>
//                 <button
//                   className="btn btn-success flex items-center gap-2"
//                 >
//                   <Upload size={18} />
//                   Upload CSV
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Services List */}
//       <div className="space-y-4">
//         {mockServices.map((service) => (
//           <div key={service._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
//             {/* Service Header */}
//             <div className="p-4 border-b border-gray-200">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <h3 className="text-lg font-semibold">{service.name}</h3>
//                   <div className="flex flex-wrap items-center gap-2 mt-1">
//                     <span className="badge badge-primary capitalize">{service.type}</span>
//                     <span className="badge badge-secondary capitalize">{service.category}</span>
//                     {service.isActive ? (
//                       <span className="badge badge-success">Active</span>
//                     ) : (
//                       <span className="badge badge-error">Inactive</span>
//                     )}
//                     {service.isVerified && (
//                       <span className="badge badge-info">Verified</span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setEditingId(service._id)}
//                     className="btn btn-sm btn-square btn-ghost"
//                     title="Edit service"
//                   >
//                     <Edit className="w-5 h-5" />
//                   </button>
//                   <button
//                     className="btn btn-sm btn-square btn-ghost text-error"
//                     title="Delete service"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                   <button 
//                     onClick={() => toggleCardExpand(service._id)}
//                     className="btn btn-sm btn-square btn-ghost"
//                   >
//                     {expandedCards.includes(service._id) ? 
//                       <ChevronUp className="w-5 h-5" /> : 
//                       <ChevronDown className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Expanded Content */}
//             {expandedCards.includes(service._id) && (
//               <div className="p-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Contact Information */}
//                   <div>
//                     <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-700">
//                       <MapPin className="w-5 h-5" />
//                       Location & Contact
//                     </h4>
//                     <div className="space-y-2 text-sm text-gray-600">
//                       <p className="font-medium">{service.location.address.fullAddress}</p>
//                       <p>Coordinates: {service.location.coordinates[1].toFixed(4)}, {service.location.coordinates[0].toFixed(4)}</p>
//                       <div className="pt-2 mt-2 border-t border-gray-100">
//                         <p>
//                           <span className="font-medium">Phone:</span> {service.contact.phone}
//                         </p>
//                         {service.contact.email && (
//                           <p>
//                             <span className="font-medium">Email:</span> {service.contact.email}
//                           </p>
//                         )}
//                         {service.contact.website && (
//                           <p>
//                             <span className="font-medium">Website:</span> {service.contact.website}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Operating Hours */}
//                   <div>
//                     <h4 className="font-medium mb-3 flex items-center gap-2 text-gray-700">
//                       <Clock className="w-5 h-5" />
//                       Operating Hours
//                     </h4>
//                     <div className="text-sm text-gray-600">
//                       {service.operatingHours.is24Hours ? (
//                         <div className="flex items-center gap-2">
//                           <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                           <span>24 Hours Open</span>
//                         </div>
//                       ) : (
//                         <div className="space-y-2">
//                           {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
//                             .filter(day => service.operatingHours[day]?.isOpen)
//                             .map(day => (
//                               <div key={day} className="flex justify-between items-center">
//                                 <span className="capitalize">{day}:</span>
//                                 <span className="font-medium">
//                                   {service.operatingHours[day].open} - {service.operatingHours[day].close}
//                                 </span>
//                               </div>
//                             ))
//                           }
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Edit Modal (would be conditionally rendered in a real app) */}
//       {editingId && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">Edit Service</h3>
//                 <button onClick={() => setEditingId(null)} className="btn btn-sm btn-circle btn-ghost">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
              
//               <form className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="form-label">Name</label>
//                     <input type="text" className="input input-bordered w-full" value="City General Hospital" />
//                   </div>
//                   <div>
//                     <label className="form-label">Type</label>
//                     <select className="select select-bordered w-full">
//                       <option>hospital</option>
//                       <option>police</option>
//                       <option>ambulance</option>
//                       <option>fire</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="form-label">Phone</label>
//                     <input type="tel" className="input input-bordered w-full" value="+911234567890" />
//                   </div>
//                   <div>
//                     <label className="form-label">Status</label>
//                     <select className="select select-bordered w-full">
//                       <option>Active</option>
//                       <option>Inactive</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="form-label">Full Address</label>
//                   <textarea className="textarea textarea-bordered w-full" rows="3">
//                     123 Medical Lane, Delhi, 110001, India
//                   </textarea>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="form-label">Longitude</label>
//                     <input type="number" step="any" className="input input-bordered w-full" value="77.2090" />
//                   </div>
//                   <div>
//                     <label className="form-label">Latitude</label>
//                     <input type="number" step="any" className="input input-bordered w-full" value="28.6139" />
//                   </div>
//                 </div>

//                 <div className="pt-4 border-t border-gray-200">
//                   <h4 className="font-medium mb-3">Operating Hours</h4>
//                   <label className="flex items-center gap-2 mb-4 cursor-pointer">
//                     <input type="checkbox" className="checkbox checkbox-primary" />
//                     <span>Open 24 Hours</span>
//                   </label>
                  
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
//                       <div key={day} className="border rounded-lg p-3">
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="capitalize font-medium">{day}</span>
//                           <input type="checkbox" className="toggle toggle-primary" checked />
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <input type="time" className="input input-bordered w-full" value="09:00" />
//                           <span>to</span>
//                           <input type="time" className="input input-bordered w-full" value="17:00" />
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex justify-end gap-2 pt-4">
//                   <button type="button" onClick={() => setEditingId(null)} className="btn btn-ghost">
//                     Cancel
//                   </button>
//                   <button type="submit" className="btn btn-primary">
//                     Save Changes
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminServices;