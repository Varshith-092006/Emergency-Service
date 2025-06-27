import React from 'react';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  User, 
  Shield, 
  Clock,
  MessageCircle,
  Settings,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpPage = () => {
  const faqs = [
    {
      question: "How do I report an emergency?",
      answer: "Click the SOS button on the map page or call emergency services directly.",
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    {
      question: "How accurate is my location tracking?",
      answer: "We use GPS and network data to pinpoint your location within 10-50 meters.",
      icon: <MapPin className="w-5 h-5 text-blue-500" />
    },
    {
      question: "Can I use this without an account?",
      answer: "Basic emergency features are available to all users, but creating an account unlocks additional safety features.",
      icon: <User className="w-5 h-5 text-green-500" />
    },
    {
      question: "How quickly will responders arrive?",
      answer: "Response times vary by location but average 7-15 minutes in urban areas.",
      icon: <Clock className="w-5 h-5 text-yellow-500" />
    },
    {
      question: "Is my personal information secure?",
      answer: "We use end-to-end encryption and never share your data without consent.",
      icon: <Shield className="w-5 h-5 text-purple-500" />
    },
    {
      question: "How do I add emergency contacts?",
      answer: "Go to your Profile page and select 'Emergency Contacts' to add trusted people.",
      icon: <HeartPulse className="w-5 h-5 text-pink-500" />
    }
  ];

  const emergencyContacts = [
    { name: "Police Emergency", number: "100", icon: <Shield className="w-5 h-5" /> },
    { name: "Ambulance", number: "108", icon: <HeartPulse className="w-5 h-5" /> },
    { name: "Fire Department", number: "101", icon: <AlertTriangle className="w-5 h-5" /> },
    { name: "Women's Helpline", number: "1091", icon: <User className="w-5 h-5" /> },
    { name: "Disaster Management", number: "108", icon: <AlertTriangle className="w-5 h-5" /> },
    { name: "Child Helpline", number: "1098", icon: <User className="w-5 h-5" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Emergency Help Center</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Get immediate assistance or learn how to use our emergency services platform
        </p>
      </div>

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Immediate Emergency</h2>
          </div>
          <p className="text-gray-600 mb-4">
            If you're in immediate danger, use these options:
          </p>
          <div className="space-y-3">
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Open Emergency Map
            </Link>
            <a
              href="tel:112"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Emergency (112)
            </a>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Quick Support</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Get help with using the platform:
          </p>
          <div className="space-y-3">
            <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Live Chat Support
            </button>
            <a
              href="mailto:support@emergencyconnect.example.com"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors w-full"
            >
              Email Our Team
            </a>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-8 h-8 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Prepare for emergencies:
          </p>
          <div className="space-y-3">
            <Link
              to="/safety-tips"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors w-full"
            >
              Safety Tips Guide
            </Link>
            <Link
              to="/emergency-plan"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors w-full"
            >
              Create Emergency Plan
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {faq.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Emergency Contacts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full">
                {contact.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{contact.name}</h3>
                <a 
                  href={`tel:${contact.number}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {contact.number}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our support team is available 24/7 to assist with any questions or emergencies.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="tel:+18005551234"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call Support: +1 (800) 555-1234
          </a>
          <Link
            to="/contact"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
          >
            Contact Form
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;