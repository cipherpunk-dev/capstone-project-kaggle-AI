import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Sun, Moon } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const endpoint = isSignUp ? 'register' : 'login';
      const res = await axios.post(`/api/auth/${endpoint}`, { email, password });
      
      if (isSignUp) {
        // After successful registration, log them in automatically or show success
        const loginRes = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.token);
        localStorage.setItem('role', loginRes.data.user.role);
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.user.role);
      }
      
      const role = localStorage.getItem('role');
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
      window.location.reload(); 
    } catch (err) {
      const serverError = err.response?.data?.error;
      // Zod errors come back as an array of objects
      if (Array.isArray(serverError)) {
        setError(serverError.map(e => e.message).join('. '));
      } else {
        setError(serverError || `${isSignUp ? 'Registration' : 'Login'} failed. Please check your credentials.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-background-primary transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 p-2 rounded-full bg-background-secondary text-text-secondary hover:text-text-primary border border-border-primary hover:border-text-tertiary transition-all"
        title="Toggle Theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-sm px-6">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-4 transform -rotate-12 border border-accent-primary/20">
            <Activity className="w-7 h-7 text-accent-primary transform rotate-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Viva Defender</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-status-error/10 border border-status-error/20 text-status-error text-sm p-3 rounded-lg text-center animate-fade-in-up">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="text"
              required
              className="w-full bg-background-secondary border border-border-primary rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all text-sm"
              placeholder="Username or E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <input
              type="password"
              required
              className="w-full bg-background-secondary border border-border-primary rounded-lg px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#475569] hover:bg-[#334155] text-white font-medium py-3 rounded-lg transition-colors mt-2 text-sm shadow-sm"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="flex justify-end mt-4">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors"
          >
            {isSignUp ? 'Sign In instead' : 'Sign Up'}
          </button>
        </div>

        {/* Social Login */}
        <div className="mt-10">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary"></div>
            </div>
            <span className="relative bg-background-primary px-3 text-sm text-text-tertiary">or you can sign in with</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button type="button" className="w-10 h-10 rounded-full bg-background-secondary border border-border-primary flex items-center justify-center text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors font-bold font-serif text-sm">
              in
            </button>
            <button type="button" className="w-10 h-10 rounded-full bg-background-secondary border border-border-primary flex items-center justify-center text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors font-bold font-serif text-sm">
              f
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
