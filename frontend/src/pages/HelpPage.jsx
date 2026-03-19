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
    <div className="container mx-auto px-6 py-24 sm:py-32">
      <div className="flex flex-col space-y-6 mb-24 max-w-4xl">
        <span className="text-[var(--secondary-color)] text-xs font-bold uppercase tracking-[0.3em] block">Support Hub</span>
        <h1 className="text-5xl sm:text-7xl font-black text-[var(--primary-color)] tracking-tighter italic leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
          Emergency <span className="not-italic text-[var(--text-color)]">Help Center</span>
        </h1>
        <p className="text-xl text-[var(--text-muted)] font-medium leading-relaxed">
          Access immediate assistance, learn platform protocols, or find essential resources for crisis management and community safety.
        </p>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
        <div className="bg-white p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl hover-lift transition-all group">
          <div className="w-16 h-16 bg-red-500/5 rounded-2xl flex items-center justify-center mb-8 border border-red-500/10 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>Immediate Aid</h2>
          <p className="text-[var(--text-muted)] mb-10 font-medium leading-relaxed">Critical response tools for high-risk situations requiring instant dispatch.</p>
          <div className="flex flex-col gap-4">
            <Link to="/map" className="btn btn-primary w-full text-sm">
              <MapPin className="w-4 h-4 mr-2" /> Open Radar
            </Link>
            <a href="tel:112" className="btn btn-outline w-full text-sm border-red-500/20 text-red-600 hover:bg-red-50">
              <Phone className="w-4 h-4 mr-2" /> Direct Call (112)
            </a>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl hover-lift transition-all group">
          <div className="w-16 h-16 bg-blue-500/5 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/10 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>Direct Support</h2>
          <p className="text-[var(--text-muted)] mb-10 font-medium leading-relaxed">Connect with our dedicated support team for operational assistance.</p>
          <div className="flex flex-col gap-4">
            <button className="btn btn-primary w-full text-sm bg-blue-600 hover:bg-blue-700">Live Concierge</button>
            <a href="mailto:support@emergencyconnect.com" className="btn btn-outline w-full text-sm">Email Inquiry</a>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl hover-lift transition-all group">
          <div className="w-16 h-16 bg-green-500/5 rounded-2xl flex items-center justify-center mb-8 border border-green-500/10 group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4 tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>Safety Guide</h2>
          <p className="text-[var(--text-muted)] mb-10 font-medium leading-relaxed">Comprehensive educational resources for emergency preparedness.</p>
          <div className="flex flex-col gap-4">
            <button className="btn btn-primary w-full text-sm bg-green-600 hover:bg-green-700">Safety Protocol</button>
            <button className="btn btn-outline w-full text-sm">Action Planner</button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-32">
        <h2 className="text-4xl font-black text-[var(--primary-color)] mb-12 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Frequently Asked <span className="not-italic text-[var(--text-color)]">Questions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-10 rounded-[2.5rem] border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-[var(--primary-color)]/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-[var(--primary-color)]/10 group-hover:rotate-6 transition-transform">
                  {faq.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--primary-color)] mb-3 leading-tight">{faq.question}</h3>
                  <p className="text-[var(--text-muted)] font-medium leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-[2.5rem] p-12 sm:p-16 border border-[var(--border-color)] shadow-2xl mb-32">
        <h2 className="text-4xl font-black text-[var(--primary-color)] mb-12 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Vital Response <span className="not-italic text-[var(--text-color)]">Hotlines</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="bg-[var(--background-color)] p-6 rounded-2xl border border-[var(--border-color)] flex items-center gap-5 hover:border-[var(--secondary-color)]/30 transition-all group">
              <div className="bg-white p-4 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                {contact.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-[var(--text-color)] text-sm uppercase tracking-wider">{contact.name}</h3>
                <a 
                  href={`tel:${contact.number}`}
                  className="text-2xl font-black text-[var(--primary-color)] hover:text-[var(--secondary-color)] transition-colors italic"
                  style={{ fontFamily: 'var(--font-serif)' }}
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