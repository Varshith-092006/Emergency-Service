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
    <>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>
      )}
      <aside
        className={`bg-[var(--surface-color)] shadow-2xl border-r border-[var(--border-color)] h-full flex flex-col transition-all duration-300 z-50 ${
          isMobile ? 'fixed top-0 left-0 w-full max-w-xs' : 'w-80'
        } ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with responsive close button */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] bg-[var(--surface-color)] sticky top-0 z-10">
          <h2 className="text-2xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>Search Results</h2>
          {isMobile && (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--surface-hover)] focus:outline-none transition-colors"
              aria-label="Close sidebar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* Responsive category filters */}
        <div className="px-5 py-4 border-b border-[var(--border-color)] bg-[var(--background-color)]">
          <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 px-1">
            Service Spectrum
          </h3>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
            {serviceTypes.map(type => (
              <button
                key={type.key}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 group ${
                  selectedType === type.key
                    ? 'bg-[var(--primary-color)] text-white shadow-xl scale-[1.02]'
                    : 'bg-white text-[var(--text-color)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)]'
                }`}
                onClick={() => setSelectedType(type.key)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  selectedType === type.key ? 'bg-white/20' : 'bg-[var(--background-color)] group-hover:bg-[var(--primary-color)]/10'
                }`}>
                  {type.icon}
                </div>
                <span className="flex-1 text-left">{type.label}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedType === type.key ? 'translate-x-1' : ''}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Responsive service list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 py-4 sticky top-0 bg-[var(--surface-color)]/80 backdrop-blur-md border-b border-[var(--border-color)] z-10 glass-panel">
            <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
              Response Units
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
            <ul className="divide-y divide-[var(--border-color)]">
              {services.map(service => (
                <li
                  key={service._id}
                  className={`p-6 transition-all duration-300 cursor-pointer group active:scale-[0.98] ${
                    service.selected ? 'bg-[var(--primary-color)]/5 border-l-4 border-l-[var(--primary-color)]' : 'hover:bg-[var(--surface-hover)] border-l-4 border-l-transparent'
                  }`}
                  onClick={() => onServiceClick(service)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl transition-all shadow-sm ${
                      service.selected ? 'bg-[var(--secondary-color)] text-[var(--primary-color)] scale-110 rotate-3' : 'bg-white text-[var(--text-muted)] border border-[var(--border-color)]'
                    }`}>
                      {serviceTypes.find(t => t.key === service.type)?.icon || '📍'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <h4 className="text-lg font-bold text-[var(--text-color)] truncate group-hover:text-[var(--primary-color)] transition-colors">
                          {service.name}
                        </h4>
                        {service.distance && (
                          <span className="text-xs font-extrabold text-[var(--primary-color)] whitespace-nowrap bg-[var(--primary-color)]/10 px-2 py-0.5 rounded-md">
                            {service.distance.toFixed(1)}km
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-[var(--text-muted)] font-medium">
                        <MapPin className="flex-shrink-0 w-3.5 h-3.5 mr-2" />
                        <a 
                          href={service.location?.coordinates ? `https://www.google.com/maps/search/?api=1&query=${service.location.coordinates[1]},${service.location.coordinates[0]}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location?.address?.fullAddress || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:text-[var(--primary-color)] hover:underline transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {service.location?.address?.fullAddress || 'Uncharted Location'}
                        </a>
                      </div>
                      {service.contact?.phone && (
                        <div className="mt-4 flex gap-2">
                          <a
                            href={`tel:${service.contact.phone}`}
                            className="btn btn-primary w-full text-[10px]"
                            onClick={e => e.stopPropagation()}
                          >
                            <Phone className="w-3 h-3 mr-2" />
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
    </>
  );
};

export default Sidebar;