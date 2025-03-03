import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';

const Login = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuth();
  const { success, error: showError, warning, info } = useNotification();

  // Apple-inspired animation for form appearance
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById('login-form-container').classList.add('opacity-100', 'translate-y-0');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      info('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await login(formData.email, formData.password);
      success('Logged in successfully!');
      setCurrentPage('home');
    } catch (err) {
      console.error('Login error:', err);
      showError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200 px-6">
      <div 
        id="login-form-container"
        className="w-full max-w-md transform transition-all duration-700 opacity-0 translate-y-4"
      >
        {/* Logo or Brand Element */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-light mb-1">Welcome Back</h1>
          <p className="text-base-content/60 text-sm">
            Sign in to continue your basketball analytics journey
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl backdrop-blur-sm border border-base-300">
          <div className="card-body p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1 block">Email</label>
                <div 
                  className={`transition-all duration-300 rounded-xl border ${focused === 'email' ? 'border-primary shadow-sm' : 'border-base-300'} overflow-hidden bg-base-200/50`}
                >
                  <div className="flex items-center px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-5 w-5 mr-4 transition-all duration-300 ${focused === 'email' ? 'text-primary' : 'text-base-content/40'}`}
                    >
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      className="grow bg-transparent border-none py-0 focus:outline-none focus:ring-0 text-base-content placeholder:text-base-content/30"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="text-sm font-medium pl-1 block">Password</label>
                <div 
                  className={`transition-all duration-300 rounded-xl border ${focused === 'password' ? 'border-primary shadow-sm' : 'border-base-300'} overflow-hidden bg-base-200/50`}
                >
                  <div className="flex items-center px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`h-5 w-5 mr-4 transition-all duration-300 ${focused === 'password' ? 'text-primary' : 'text-base-content/40'}`}
                    >
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className="grow bg-transparent border-none py-0 focus:outline-none focus:ring-0 text-base-content placeholder:text-base-content/30"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="text-right">
                <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
              </div>

              <button 
                type="submit" 
                className="relative w-full transition-all duration-300 overflow-hidden group"
                disabled={loading}
              >
                <div className="h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white font-medium group-hover:opacity-90 transition-opacity shadow-md">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Signing in</span>
                    </div>
                  ) : (
                    <span>Sign In</span>
                  )}
                </div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary to-secondary opacity-50 blur-lg transition-all duration-300 scale-90 group-hover:scale-100 group-hover:opacity-60"></div>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-base-content/70">
            Don't have an account?{' '}
            <span
              className="text-primary font-medium cursor-pointer hover:underline"
              onClick={() => setCurrentPage('register')}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 