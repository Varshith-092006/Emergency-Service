import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Loader2, MapPin, Phone, Navigation, ArrowLeft, Clock, Info } from 'lucide-react';
import MapComponent from '../components/map/MapComponent';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useQuery(['service', id], async () => {
    const res = await api.get(`/services/${id}`);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Link to="/services" className="btn btn-outline btn-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <MapPin className="w-5 h-5 text-primary-600" />
          <span className="font-semibold text-lg">{data.name}</span>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center gap-2">
            <span className="badge badge-primary capitalize">{data.type}</span>
            {data.isActive !== undefined && (
              <span className={`badge ${data.isActive ? 'badge-success' : 'badge-error'}`}>
                {data.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">Address</div>
                <div className="text-sm text-gray-600">
                  {data.location?.address?.fullAddress || 'No address available'}
                </div>
              </div>
            </div>
            
            {data.contact?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">Phone</div>
                  <div className="text-sm text-gray-600">{data.contact.phone}</div>
                </div>
              </div>
            )}
            
            {data.description && (
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Description</div>
                  <div className="text-sm text-gray-600">{data.description}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            {data.contact?.phone && (
              <a
                href={`tel:${data.contact.phone}`}
                className="btn btn-success flex items-center gap-1"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${serviceLocation[0]},${serviceLocation[1]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary flex items-center gap-1"
            >
              <Navigation className="w-4 h-4" /> Get Directions
            </a>
          </div>
        </div>
        <div className="card-footer flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-4 h-4" />
          <span>
            Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Map Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-lg">Location on Map</h3>
        </div>
        <div className="card-body p-0">
          <MapComponent
            services={[data]}
            center={serviceLocation}
            zoom={15}
            height="400px"
            onServiceClick={(service) => {
              // Handle service click if needed
              console.log('Service clicked:', service);
            }}
          />
        </div>
      </div>

      {/* Additional Information */}
      {data.operatingHours && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-lg">Operating Hours</h3>
          </div>
          <div className="card-body">
            <div className="text-sm text-gray-600">
              {data.operatingHours}
            </div>
          </div>
        </div>
      )}

      {data.specializations && data.specializations.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-lg">Specializations</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {data.specializations.map((spec, index) => (
                <span key={index} className="badge badge-secondary">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage; 