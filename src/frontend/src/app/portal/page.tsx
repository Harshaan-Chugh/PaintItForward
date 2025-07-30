'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginButton from '@/components/LoginButton';
import HourForm from '@/components/HourForm';
import HoursList from '@/components/HoursList';

interface User {
  email: string;
  name: string;
}

export default function Portal() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('google_token');
    const savedUser = localStorage.getItem('user_info');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = async (credential: string) => {
    try {
      // Decode the JWT to get user info (for demo purposes)
      const parts = credential.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      const userInfo = {
        email: payload.email,
        name: payload.name || payload.email
      };

      setToken(credential);
      setUser(userInfo);
      
      // Save to localStorage
      localStorage.setItem('google_token', credential);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    } catch (error) {
      console.error('Error processing login:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_info');
  };

  const handleHourSubmitted = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 rounded-lg mr-2 overflow-hidden">
                  <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Paint It Forward</h1>
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </nav>

        {/* Login Section */}
        <div className="flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Your Volunteer Portal
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in with Google to start tracking your volunteer hours and see your impact.
              </p>
              <div className="flex justify-center">
                <LoginButton onSuccess={handleLoginSuccess} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 rounded-lg mr-2 overflow-hidden">
                <img src="/logo.png" alt="Paint It Forward Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Paint It Forward</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Dashboard</h2>
          <p className="text-gray-600">Track your volunteer hours and see your impact on the community.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hour Logging Form */}
          <div>
            <HourForm token={token} onSubmit={handleHourSubmitted} />
          </div>

          {/* Hours List */}
          <div>
            <HoursList token={token} refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📝</span>
              </div>
              <h4 className="font-semibold mb-2">Log Your Hours</h4>
              <p className="text-sm text-gray-600">Enter your volunteer start and end times along with a description of your work.</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⏳</span>
              </div>
              <h4 className="font-semibold mb-2">Review Process</h4>
              <p className="text-sm text-gray-600">Your submitted hours will be reviewed and approved by our coordinators.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✅</span>
              </div>
              <h4 className="font-semibold mb-2">Track Your Impact</h4>
              <p className="text-sm text-gray-600">See your approved hours and total contribution to the community.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}