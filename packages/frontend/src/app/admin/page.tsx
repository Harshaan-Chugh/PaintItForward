'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginButton from '@/components/LoginButton';
import AdminDashboard from '@/components/AdminDashboard';

interface User {
  email: string;
  name: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('google_token');
    const savedUser = localStorage.getItem('user_info');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    // Check admin status when user logs in
    if (user && token) {
      checkAdminStatus();
    }
  }, [user, token]);

  const checkAdminStatus = async () => {
    setCheckingAdmin(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/admin/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setCheckingAdmin(false);
    }
  };

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
    setIsAdmin(false);
    localStorage.removeItem('google_token');
    localStorage.removeItem('user_info');
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Paint It Forward</h1>
              </Link>
              <div className="flex space-x-4">
                <Link href="/portal" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Portal
                </Link>
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Login Section */}
        <div className="flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-8">
                Sign in with your admin Google account to manage volunteer hours.
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

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
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
        
        <div className="flex items-center justify-center py-24">
          <div className="text-gray-600">Checking admin permissions...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Paint It Forward</h1>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}</span>
                <Link href="/portal" className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
                  Portal
                </Link>
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
        
        <div className="flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-red-600 text-5xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-6">
                You don&apos;t have admin permissions to access this page.
              </p>
              <Link 
                href="/portal" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Portal
              </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">Paint It Forward</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user.name}</span>
              <Link href="/portal" className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium">
                Portal
              </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Review and approve volunteer hour submissions.</p>
        </div>

        <AdminDashboard token={token} />

        {/* Admin Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Approve Hours</h4>
              <p className="text-sm text-gray-600">
                Click &quot;Approve&quot; to accept volunteer hour submissions. Approved hours will count toward the volunteer&apos;s total.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Reject Hours</h4>
              <p className="text-sm text-gray-600">
                Click &quot;Reject&quot; if the submission is invalid or needs correction. The volunteer can resubmit if needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}