import React from 'react';
import { Phone, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';

const Sidebar = ({
  open = true,
  onClose,
  serviceTypes = [],
  selectedType,
  setSelectedType,
  services = [],
  onServiceClick,
  isLoading,
  isError,
  isMobile
}) => {
  return (
    <aside
      className={`bg-white shadow-lg border-r border-gray-200 h-full flex flex-col transition-all duration-300 z-30 ${
        isMobile ? 'w-full fixed top-0 left-0' : 'w-80'
      } ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Header with responsive close button */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800">Emergency Services</h2>
        {isMobile && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Responsive category filters */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
          Service Types
        </h3>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          {serviceTypes.map(type => (
            <button
              key={type.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-all ${
                selectedType === type.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              onClick={() => setSelectedType(type.key)}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedType === type.key ? 'bg-blue-700' : 'bg-gray-100'
              }`}>
                {type.icon}
              </span>
              <span className="flex-1 text-left">{type.label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Responsive service list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 sticky top-0 bg-white border-b border-gray-100 z-10">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Available Services
          </h3>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Loading services...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 px-4">
            <div className="bg-red-50 text-red-600 p-3 rounded-md inline-flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Failed to load services
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="bg-gray-50 text-gray-500 p-4 rounded-md">
              No services found in this area
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {services.map(service => (
              <li
                key={service._id}
                className={`p-4 transition-colors cursor-pointer ${
                  service.selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => onServiceClick(service)}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
                    service.selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {serviceTypes.find(t => t.key === service.type)?.icon || '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="text-base font-medium text-gray-900 truncate">
                        {service.name}
                      </h4>
                      {service.distance && (
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                          {service.distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 w-4 h-4 mr-1" />
                      <span className="truncate">
                        {service.location?.address?.fullAddress || 'Address not available'}
                      </span>
                    </div>
                    {service.contact?.phone && (
                      <div className="mt-3">
                        <a
                          href={`tel:${service.contact.phone}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                          onClick={e => e.stopPropagation()}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call Now
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;