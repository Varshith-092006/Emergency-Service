import React from 'react';
import { 
  Heart, 
  Shield, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Users, 
  Database, 
  Zap 
} from 'lucide-react';

import { Link } from 'react-router-dom';
const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16 animate-fade-in">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">Emergency Response Network</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connecting communities with life-saving services when every second counts
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-16 animate-slide-up">
        <div className="bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
            <Heart className="text-red-500" />
            Our Life-Saving Mission
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg mb-3">Rapid Emergency Response</h3>
              <p className="text-gray-600">
                We've reduced average response times by 40% through real-time coordination between citizens and emergency services.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-lg mb-3">Community Protection</h3>
              <p className="text-gray-600">
                Over 500,000 users trust our platform to connect them with police, medical, and fire services during crises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-16 animate-slide-up">
        <h2 className="text-2xl font-semibold text-blue-700 mb-8 text-center">
          How We Save Precious Minutes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 hover:shadow-md transition-all">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="font-medium mb-2">Instant Location Detection</h3>
            <p className="text-gray-600 text-sm">
              Automatically pinpoints your position and nearest responders when you need help.
            </p>
          </div>
          <div className="text-center p-6 hover:shadow-md transition-all">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600 w-8 h-8" />
            </div>
            <h3 className="font-medium mb-2">One-Tap Emergency Alerts</h3>
            <p className="text-gray-600 text-sm">
              Single button press simultaneously notifies all nearby emergency services.
            </p>
          </div>
          <div className="text-center p-6 hover:shadow-md transition-all">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="font-medium mb-2">Live Service Tracking</h3>
            <p className="text-gray-600 text-sm">
              See responding units approaching in real-time on your map.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-blue-800 text-white rounded-xl p-8 mb-16 animate-fade-in">
        <h2 className="text-2xl font-semibold mb-8 text-center">Our Life-Saving Impact</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">30%</div>
            <p>Faster response times</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">500+</div>
            <p>Lives saved annually</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <p>Emergency coverage</p>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">98%</div>
            <p>User satisfaction rate</p>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="mb-16 animate-slide-up">
        <h2 className="text-2xl font-semibold text-blue-700 mb-8 text-center">
          Who Benefits From Our Service
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
              <Users className="text-blue-500" />
              For Community Members
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <Zap className="text-yellow-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Instant access to emergency services with one tap
              </li>
              <li className="flex items-start gap-2">
                <Clock className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Reduced wait times during medical emergencies
              </li>
              <li className="flex items-start gap-2">
                <Database className="text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Automatic sharing of medical information with responders
              </li>
            </ul>
          </div>
          <div className="border rounded-lg p-6">
            <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
              <Shield className="text-red-500" />
              For First Responders
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <MapPin className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Precise location data for faster dispatch
              </li>
              <li className="flex items-start gap-2">
                <Database className="text-purple-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Real-time incident details before arrival
              </li>
              <li className="flex items-start gap-2">
                <Users className="text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                Better coordination between different response teams
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center animate-fade-in">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">Ready to Make Your Community Safer?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of protected users and help us build faster emergency response networks.
        </p>
        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg transition-all">
          <Link to="/register">Get Started Now</Link>
        </button>
      </section>
    </div>
  );
};

export default About;