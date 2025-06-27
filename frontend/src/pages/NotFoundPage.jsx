import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <AlertTriangle className="w-16 h-16 text-error-600 mb-4 animate-pulse-glow" />
    <h1 className="text-3xl font-bold mb-2">404 - Page Not Found</h1>
    <p className="text-gray-600 mb-6">Sorry, the page you are looking for does not exist.</p>
    <Link to="/" className="btn btn-primary">Go Home</Link>
  </div>
);

export default NotFoundPage; 