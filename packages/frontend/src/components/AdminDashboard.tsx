'use client';

import { useState, useEffect } from 'react';

interface PendingHour {
  email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  created_at: string;
  updated_at: string;
}

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [pendingHours, setPendingHours] = useState<PendingHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string>('');

  const fetchPendingHours = async () => {
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
        const data = await response.json();
        setPendingHours(data.pending_hours || []);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch pending hours');
      }
    } catch (error) {
      console.error('Error fetching pending hours:', error);
      setError('Failed to fetch pending hours');
    } finally {
      setLoading(false);
    }
  };

  const updateHourStatus = async (email: string, startTime: string, status: 'approved' | 'rejected') => {
    const key = `${email}-${startTime}`;
    setUpdating(key);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/admin/hours/${encodeURIComponent(email)}/${encodeURIComponent(startTime)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingHours(prev => prev.filter(hour => 
          !(hour.email === email && hour.start_time === startTime)
        ));
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${status} hour entry`);
      }
    } catch (error) {
      console.error(`Error ${status} hour:`, error);
      setError(`Failed to ${status} hour entry`);
    } finally {
      setUpdating('');
    }
  };

  useEffect(() => {
    if (token) {
      fetchPendingHours();
    }
  }, [token]);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const calculateHours = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading pending hours...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Pending Hours for Review</h3>
        <button
          onClick={fetchPendingHours}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {pendingHours.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending hours to review.
        </div>
      ) : (
        <div className="space-y-4">
          {pendingHours.map((hour, index) => {
            const key = `${hour.email}-${hour.start_time}`;
            const isUpdating = updating === key;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {hour.email}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(hour.start_time)} - {formatDateTime(hour.end_time)}
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {calculateHours(hour.start_time, hour.end_time)} hours
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateHourStatus(hour.email, hour.start_time, 'approved')}
                      disabled={isUpdating}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {isUpdating ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => updateHourStatus(hour.email, hour.start_time, 'rejected')}
                      disabled={isUpdating}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      {isUpdating ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
                
                {hour.description && (
                  <div className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">
                    <strong>Description:</strong> {hour.description}
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Submitted on {formatDateTime(hour.created_at)}
                </div>
              </div>
            );
          })}
          
          <div className="border-t pt-4 mt-6 bg-gray-50 p-4 rounded">
            <div className="text-lg font-semibold text-gray-900">
              Total Pending: {pendingHours.length} entries
            </div>
            <div className="text-sm text-gray-600">
              Total Hours: {pendingHours.reduce((total, hour) => {
                return total + parseFloat(calculateHours(hour.start_time, hour.end_time));
              }, 0).toFixed(1)} hours
            </div>
          </div>
        </div>
      )}
    </div>
  );
}