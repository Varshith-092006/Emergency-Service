import React from 'react';
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
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AdminServices = () => {
  // ... (keep all existing state and functions exactly as they are)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with improved styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Emergency Services Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage hospitals, police stations, and emergency services
          </p>
        </div>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {showUpload ? (
            <>
              <X className="w-5 h-5" />
              <span>Cancel Upload</span>
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
      <div className="mb-8 space-y-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search services by name, type, or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Bulk Upload Services</h3>
            
            <div className="mb-4">
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
                        {/* Add more rows as needed */}
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
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-70"
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
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Failed to load services. Please try again.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {services?.length === 0 ? (
            <div className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800 flex items-center gap-2">
              <span>No services found matching your search criteria</span>
            </div>
          ) : (
            services?.map((service) => (
              <div key={service._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md">
                {editingService === service._id ? (
                  <form onSubmit={handleUpdate} className="p-6">
                    {/* Edit form remains functionally the same but with updated styling */}
                    {/* ... */}
                  </form>
                ) : (
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{service.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                            {service.type}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900 dark:text-purple-200">
                            {service.category}
                          </span>
                          {service.isActive ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-900 dark:text-red-200">
                              Inactive
                            </span>
                          )}
                          {service.isVerified && (
                            <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full dark:bg-cyan-900 dark:text-cyan-200">
                              Verified
                            </span>
                          )}
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