'use client';

import { useState, useEffect } from 'react';

interface Hour {
  email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  created_at: string;
  updated_at: string;
}

interface HoursListProps {
  token: string;
  refreshTrigger?: number;
}

export default function HoursList({ token, refreshTrigger }: HoursListProps) {
  const [hours, setHours] = useState<Hour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHours = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/hours`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHours(data.hours || []);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch hours');
      }
    } catch (error) {
      console.error('Error fetching hours:', error);
      setError('Failed to fetch hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHours();
    }
  }, [token, refreshTrigger]);

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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading your hours...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Your Volunteer Hours</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {hours.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No volunteer hours logged yet. Start logging your hours to see them here!
        </div>
      ) : (
        <div className="space-y-4">
          {hours.map((hour, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-600">
                    {formatDateTime(hour.start_time)} - {formatDateTime(hour.end_time)}
                  </div>
                  <div className="font-medium text-gray-900">
                    {calculateHours(hour.start_time, hour.end_time)} hours
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(hour.status)}`}>
                  {hour.status.charAt(0).toUpperCase() + hour.status.slice(1)}
                </span>
              </div>
              
              {hour.description && (
                <div className="text-sm text-gray-700 mt-2">
                  {hour.description}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-2">
                Logged on {formatDateTime(hour.created_at)}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-4 mt-6">
            <div className="text-lg font-semibold text-gray-900">
              Total Hours: {hours.reduce((total, hour) => {
                return total + parseFloat(calculateHours(hour.start_time, hour.end_time));
              }, 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">
              Approved: {hours.filter(h => h.status === 'approved').reduce((total, hour) => {
                return total + parseFloat(calculateHours(hour.start_time, hour.end_time));
              }, 0).toFixed(1)} hours
            </div>
          </div>
        </div>
      )}
    </div>
  );
}