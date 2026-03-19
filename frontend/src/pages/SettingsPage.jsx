import React, { useState } from 'react';
import { 
  User, Mail, Lock, Bell, Shield, 
  CreditCard, Globe, LogOut, Save, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    notifications: false,
    security: false,
    billing: false
  });

  // Form state
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your save logic here (API call, etc.)
    console.log('Saved:', formData);
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="flex flex-col space-y-2 mb-12">
        <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-2 block">Control Center</span>
        <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
          Network <span className="not-italic text-[var(--text-color)]">Settings</span>
        </h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-72 space-y-3">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security' },
            { id: 'billing', icon: CreditCard, label: 'Premium & Billing' },
            { id: 'preferences', icon: Globe, label: 'Preferences' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-6 py-4 rounded-2xl flex items-center justify-between transition-all duration-300 group ${
                activeSection === item.id 
                ? 'bg-[var(--primary-color)] text-white shadow-xl scale-[1.02]' 
                : 'bg-white text-[var(--text-muted)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-[var(--secondary-color)]' : 'group-hover:text-[var(--primary-color)]'}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {activeSection === item.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--secondary-color)] shadow- glow shadow-[var(--secondary-color)]"></div>}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-[var(--border-color)] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-6">
                  <h2 className="text-3xl font-black text-[var(--primary-color)] italic" style={{ fontFamily: 'var(--font-serif)' }}>
                    Personal <span className="not-italic text-[var(--text-color)]">Information</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('profile')}
                    className="w-10 h-10 rounded-full bg-[var(--background-color)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    {expandedSections.profile ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedSections.profile && (
                  <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[var(--text-color)] uppercase tracking-widest opacity-60 ml-1">Legal Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[var(--text-color)] uppercase tracking-widest opacity-60 ml-1">Email Identifier</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-[var(--text-color)] uppercase tracking-widest opacity-60 ml-1">Emergency Contact Line</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('notifications')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.notifications ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {expandedSections.notifications && (
                  <div className="space-y-4 pl-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-sm text-gray-500">Receive important updates via email</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.email"
                          checked={formData.notifications.email}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SMS Notifications</label>
                        <p className="text-sm text-gray-500">Receive text message alerts</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.sms"
                          checked={formData.notifications.sms}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Push Notifications</label>
                        <p className="text-sm text-gray-500">Receive app notifications</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="notifications.push"
                          checked={formData.notifications.push}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Settings
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('security')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.security ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {expandedSections.security && (
                  <div className="space-y-4 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current Password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Update Password
                      </button>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                        >
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing Information
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('billing')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.billing ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {expandedSections.billing && (
                  <div className="pl-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-blue-800">Premium Plan</h3>
                          <p className="text-sm text-blue-600">$9.99/month</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">Active</span>
                      </div>
                      <p className="mt-2 text-sm text-blue-700">Next billing date: January 15, 2024</p>
                      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Change Plan
                      </button>
                    </div>

                    <h3 className="font-medium text-gray-700 mb-2">Payment Method</h3>
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-gray-500">Expires 04/2025</p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Edit
                        </button>
                      </div>
                    </div>

                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      + Add Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Preferences
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleSection('preferences')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedSections.preferences ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>

                {expandedSections.preferences && (
                  <div className="space-y-4 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="USD">US Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">British Pound (£)</option>
                        <option value="JPY">Japanese Yen (¥)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Save Action */}
            <div className="pt-10 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="submit"
                className="btn btn-primary px-12 py-5 text-sm"
              >
                <Save className="w-5 h-5 mr-3" />
                Commit Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;