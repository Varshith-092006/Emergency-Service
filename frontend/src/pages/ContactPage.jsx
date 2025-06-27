import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  MessageCircle,
  AlertTriangle,
  ChevronRight,
  Send,
  CheckCircle,Shield,HeartPulse,Flame
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'general',
      message: ''
    });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const emergencyContacts = [
    { name: "Emergency Services", number: "112", icon: <AlertTriangle className="w-5 h-5 text-red-500" /> },
    { name: "Police", number: "100", icon: <Shield className="w-5 h-5 text-blue-500" /> },
    { name: "Ambulance", number: "108", icon: <HeartPulse className="w-5 h-5 text-green-500" /> },
    { name: "Fire Department", number: "101", icon: <Flame className="w-5 h-5 text-orange-500" /> }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Emergency Support</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Reach out to our team for assistance, feedback, or emergency support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Contact Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  General Inquiries
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">support@emergencyconnect.org</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">+1 (800) 555-EMER (3637)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <address className="text-gray-600 not-italic">
                      123 Safety Plaza<br />
                      Emergency City, EC 12345
                    </address>
                  </li>
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Emergency Contacts
                </h3>
                <ul className="space-y-3">
                  {emergencyContacts.map((contact, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {contact.icon}
                      <div>
                        <p className="text-gray-900 font-medium">{contact.name}</p>
                        <a 
                          href={`tel:${contact.number}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                          {contact.number}
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Support Hours
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between">
                    <span>Emergency Support:</span>
                    <span className="font-medium">24/7</span>
                  </li>
                  <li className="flex justify-between">
                    <span>General Inquiries:</span>
                    <span className="font-medium">Mon-Fri, 8AM-8PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Technical Support:</span>
                    <span className="font-medium">Mon-Sun, 7AM-10PM</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Send us a message
              </h2>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {submitSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Message sent successfully!</p>
                    <p className="text-sm mt-1">Our team will respond to your inquiry within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="emergency">Emergency Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="feedback">Feedback/Suggestion</option>
                      <option value="partnership">Partnership Opportunity</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="reset"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="-ml-0.5 mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Emergency Notice</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    If you are experiencing a life-threatening emergency, please call your local emergency number immediately. 
                    Do not wait for a response to this form.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <a
                      href="/map"
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      Open Emergency Map
                    </a>
                    <a
                      href="tel:112"
                      className="ml-3 bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      Call Emergency Services
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;