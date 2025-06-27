import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Shield, 
  HeartPulse, 
  AlertTriangle,
  ChevronRight,
  Crosshair
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      title: "Real-Time Location",
      description: "Find emergency services near your current location",
      icon: <Crosshair className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50"
    },
    {
      title: "Instant SOS",
      description: "One-tap emergency alert with your location",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      color: "bg-red-50"
    },
    {
      title: "Comprehensive Directory",
      description: "Hospitals, police stations, and more in one place",
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      color: "bg-purple-50"
    },
    {
      title: "Direct Contact",
      description: "Call emergency services directly from the app",
      icon: <Phone className="w-6 h-6 text-green-600" />,
      color: "bg-green-50"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Emergency Service Locator
          </h1>
          <motion.p
            className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your safety is our priority. Find emergency services instantly when every second counts.
          </motion.p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-8 py-4 bg-red-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-red-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Open Emergency Map
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border border-gray-300 text-gray-700 text-lg font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Shield className="w-5 h-5 mr-2" />
              Browse Services
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-gray-500 text-sm"
        >
          <span>Built for public safety &mdash; <Link to="/about" className="underline hover:text-blue-600">Learn more</Link></span>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How We Help in Emergencies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className={`${feature.color} p-6 rounded-xl shadow-sm`}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Emergency Callout */}
      <div className="bg-red-50 border-t border-b border-red-200 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            In an Emergency?
          </h3>
          <p className="text-lg text-gray-600 mb-6">
            If you're in immediate danger, don't wait - call your local emergency number now.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="tel:112"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-red-700 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency (112)
            </a>
            <Link
              to="/help"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 text-lg font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Help Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;