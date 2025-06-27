import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Loader2, User, Phone, Plus, Trash2, Save, Lock, Edit } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, addEmergencyContact, removeEmergencyContact, isLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(user || {});
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [contact, setContact] = useState({ name: '', phone: '', relationship: 'family' });

  if (!user) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
    </div>
  );

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    await updateProfile(profile);
    setEditMode(false);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    await changePassword(passwords);
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    await addEmergencyContact(contact);
    setContact({ name: '', phone: '', relationship: 'family' });
  };

  const handleRemoveContact = async (id) => {
    await removeEmergencyContact(id);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="ml-auto flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profile.name || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                name="phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={profile.phone || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              value={profile.email || ''}
              disabled
              readOnly
            />
          </div>
          {editMode && (
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Emergency Contacts</h2>
        </div>

        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              type="tel"
              placeholder="Phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={contact.phone}
              onChange={e => setContact({ ...contact, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={contact.relationship}
              onChange={e => setContact({ ...contact, relationship: e.target.value })}
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </form>

        <ul className="space-y-3">
          {user.emergencyContacts?.length > 0 ? (
            user.emergencyContacts.map((c) => (
              <li key={c._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{c.name}</p>
                    <p className="text-sm text-gray-600">{c.phone} • {c.relationship}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveContact(c._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No emergency contacts added yet</p>
          )}
        </ul>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;