import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Loader2, User, Mail, Phone, Lock } from 'lucide-react';

const RegisterPage = () => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await register(formData);
    if (result.success) {
      navigate('/map');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden bg-[var(--primary-color)]">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,var(--secondary-color)_0%,transparent_70%)] opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,var(--primary-color)_0%,transparent_70%)] opacity-30 blur-[100px] brightness-150"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 sm:p-16 border border-[var(--border-color)]">
          <div className="text-center mb-12">
            <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Join the Circle</span>
            <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
              Create <span className="not-italic text-[var(--text-color)]">Account</span>
            </h1>
          </div>

          {error && (
            <div className="mb-8 text-red-600 text-xs font-bold py-3 px-4 bg-red-50 rounded-xl border border-red-100 italic">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-14 pr-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-14 pr-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full pl-14 pr-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[var(--primary-color)] transition-colors" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-14 pr-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-5 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-3 h-5 w-5" />
                    Initializing Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center text-sm font-medium text-[var(--text-muted)]">
            Already part of the network?{' '}
            <Link 
              to="/login" 
              className="text-[var(--primary-color)] font-black hover:text-[var(--secondary-color)] transition-colors underline decoration-2 underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;