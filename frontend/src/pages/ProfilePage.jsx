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
    <div className="flex justify-center items-center h-screen bg-[var(--background-color)]">
      <Loader2 className="animate-spin w-10 h-10 text-[var(--primary-color)]" />
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
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Profile Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 sm:p-12 mb-10 border border-[var(--border-color)]">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-3xl bg-[var(--primary-color)]/5 flex items-center justify-center border border-[var(--primary-color)]/10">
            <User className="w-8 h-8 text-[var(--primary-color)]" />
          </div>
          <h2 className="text-3xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>Identity & <span className="not-italic text-[var(--text-color)]">Profile</span></h2>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="ml-auto btn btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </button>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[var(--text-color)] opacity-80 uppercase tracking-wider ml-1">Full Name</label>
              <input
                name="name"
                className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all disabled:opacity-50"
                value={profile.name || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[var(--text-color)] opacity-80 uppercase tracking-wider ml-1">Contact Number</label>
              <input
                name="phone"
                className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all disabled:opacity-50"
                value={profile.phone || ''}
                onChange={handleProfileChange}
                disabled={!editMode}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-[var(--text-color)] opacity-80 uppercase tracking-wider ml-1">Email Address</label>
            <input
              name="email"
              className="w-full px-4 py-3 bg-[var(--surface-hover)] border border-[var(--border-color)] rounded-xl text-[var(--text-muted)] cursor-not-allowed"
              value={profile.email || ''}
              disabled
              readOnly
            />
          </div>
          {editMode && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-6 py-3 border border-[var(--border-color)] rounded-xl text-[var(--text-color)] font-bold hover:bg-[var(--surface-hover)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 modern-gradient text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Commit Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl p-8 sm:p-12 mb-10 border border-[var(--border-color)]">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 rounded-3xl bg-red-500/5 flex items-center justify-center border border-red-500/10">
            <Phone className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>Emergency <span className="not-italic text-[var(--text-color)]">Contacts</span></h2>
        </div>

        <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="md:col-span-1">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
              value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-1">
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
              value={contact.phone}
              onChange={e => setContact({ ...contact, phone: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-1">
            <select
              className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium cursor-pointer"
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
            className="btn btn-primary"
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" /> Add
          </button>
        </form>

        <ul className="space-y-4">
          {user.emergencyContacts?.length > 0 ? (
            user.emergencyContacts.map((c) => (
              <li key={c._id} className="flex items-center justify-between bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[var(--primary-color)]/50 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="bg-[var(--primary-color)]/10 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6 text-[var(--primary-color)]" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-color)] text-lg leading-none mb-1">{c.name}</p>
                    <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">{c.relationship} • {c.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveContact(c._id)}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  disabled={isLoading}
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </li>
            ))
          ) : (
            <div className="text-center py-10 glass-panel rounded-2xl">
              <p className="text-[var(--text-muted)] font-medium">Your emergency circle is empty. Add contacts to ensure quick response.</p>
            </div>
          )}
        </ul>
      </div>

      {/* Change Password Section */}
      <div className="bg-[var(--surface-color)] rounded-3xl shadow-xl p-6 sm:p-8 border border-[var(--border-color)]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-color)] tracking-tight">Access Control</h2>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[var(--text-color)] opacity-80 uppercase tracking-wider ml-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all"
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[var(--text-color)] opacity-80 uppercase tracking-wider ml-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[var(--background-color)] border border-[var(--border-color)] rounded-xl text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 transition-all font-medium"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[var(--surface-hover)] border border-[var(--border-color)] text-[var(--text-color)] font-bold rounded-xl hover:bg-[var(--primary-color)] hover:text-white hover:border-transparent active:scale-95 transition-all shadow-sm"
              disabled={isLoading}
            >
              Update Security
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;