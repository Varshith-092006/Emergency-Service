import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Loader2, MapPin, Phone, Navigation, ArrowLeft, Clock, Info } from 'lucide-react';
import MapComponent from '../components/map/MapComponent';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery(['service', id], async () => {
    const res = await api.get(`/api/services/${id}`);
    return res.data.data.service;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="animate-spin w-8 h-8 text-primary-600" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-500">Service not found.</div>;
  }

  const serviceLocation = data.location?.coordinates 
    ? [data.location.coordinates[1], data.location.coordinates[0]]
    : [28.6139, 77.209];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="p-10 md:p-14">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="space-y-4">
              <Link to="/services" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--secondary-color)] hover:translate-x-[-4px] transition-transform">
                <ArrowLeft className="w-3 h-3" /> Back to Network
              </Link>
              <h1 className="text-5xl md:text-6xl font-black text-[var(--primary-color)] italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                {data.name}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="badge badge-primary">{data.type}</span>
                {data.isActive !== undefined && (
                  <span className={`badge ${data.isActive ? 'badge-success' : 'badge-error'}`}>
                    {data.isActive ? 'Active Status' : 'Inactive'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {data.contact?.phone && (
                <a
                  href={`tel:${data.contact.phone}`}
                  className="btn btn-primary flex-1 md:flex-none px-8 py-5 shadow-xl shadow-[var(--primary-color)]/20 active:scale-95"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${serviceLocation[0]},${serviceLocation[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex-1 md:flex-none px-8 py-5 active:scale-95"
              >
                <Navigation className="w-4 h-4" /> Route
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[var(--border-color)] pt-12">
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-[var(--background-color)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[var(--secondary-color)]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Physical Location</h3>
                  <p className="text-lg font-bold text-[var(--text-color)] leading-tight">
                    {data.location?.address?.fullAddress || 'Address on Request'}
                  </p>
                </div>
              </div>

              {data.description && (
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--background-color)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-[var(--secondary-color)]" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Service Profile</h3>
                    <p className="text-lg font-medium text-[var(--text-color)] leading-relaxed italic opacity-80" style={{ fontFamily: 'var(--font-serif)' }}>
                      "{data.description}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[var(--background-color)] rounded-[2rem] p-8 border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-4 h-4 text-[var(--secondary-color)]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Operations</h3>
              </div>
              <p className="text-xl font-black text-[var(--primary-color)] mb-4">
                {data.operatingHours || '24/7 Response Available'}
              </p>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight opacity-50">
                Data Verified: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : 'Active Feed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Specializations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-xl h-[500px]">
          <MapComponent
            services={[data]}
            center={serviceLocation}
            zoom={15}
            height="100%"
          />
        </div>

        <div className="space-y-8">
          {data.specializations && data.specializations.length > 0 && (
            <div className="bg-white rounded-[2rem] p-8 border border-[var(--border-color)] shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--secondary-color)] mb-6">Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {data.specializations.map((spec, index) => (
                  <span key={index} className="inline-block px-4 py-2 bg-[var(--background-color)] rounded-xl text-xs font-bold text-[var(--primary-color)] border border-[var(--border-color)]">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--primary-color)] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--secondary-color)] opacity-20 blur-3xl -mr-16 -mt-16"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--secondary-color)] mb-4">Emergency Protocol</h3>
            <p className="text-sm font-medium opacity-80 leading-relaxed mb-6">
              In case of immediate threat to life, please use our global SOS trigger or call 112 directly.
            </p>
            <Link to="/map" className="btn btn-primary w-full bg-white text-[var(--primary-color)] border-white hover:bg-[var(--secondary-color)] hover:text-white hover:border-[var(--secondary-color)] py-4">
              Open Live Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage; 