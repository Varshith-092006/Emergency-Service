import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const result = await login({ email, password });
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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,var(--secondary-color)_0%,transparent_70%)] opacity-20 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,var(--primary-color)_0%,transparent_70%)] opacity-30 blur-[100px] brightness-150"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 sm:p-16 border border-[var(--border-color)]">
          <div className="text-center mb-12">
            <span className="text-[var(--secondary-color)] text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Welcome Back</span>
            <h1 className="text-5xl font-black text-[var(--primary-color)] tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
              Sign <span className="not-italic text-[var(--text-color)]">In</span>
            </h1>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="block text-xs font-black text-[var(--text-color)] uppercase tracking-widest ml-1 opacity-60">Email Address</label>
              <input
                type="email"
                className="w-full px-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-black text-[var(--text-color)] uppercase tracking-widest ml-1 opacity-60">Password</label>
              <input
                type="password"
                className="w-full px-6 py-4 bg-[var(--background-color)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/30 focus:border-[var(--primary-color)] transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-xs font-bold py-3 px-4 bg-red-50 rounded-xl border border-red-100 italic">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-5 text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-5 h-5 mr-3" />
                  Authenticating...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-sm font-medium text-[var(--text-muted)]">
            New to the network?{' '}
            <Link
              to="/register"
              className="text-[var(--primary-color)] font-black hover:text-[var(--secondary-color)] transition-colors underline decoration-2 underline-offset-4"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;