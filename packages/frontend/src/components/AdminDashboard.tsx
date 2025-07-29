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

interface AllSubmission {
  user_email: string;
  user_name: string;
  start_time: string;
  end_time: string;
  hours: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Summary {
  totalVolunteers: number;
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  totalEntries: number;
}

interface AdminDashboardProps {
  token: string;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [pendingHours, setPendingHours] = useState<PendingHour[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<AllSubmission[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

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

      const response = await fetch(`${apiUrl}/admin/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: email,
          start_time: startTime,
          status: status
        })
      });

      if (response.ok) {
        // Remove from pending list
        setPendingHours(prev => prev.filter(hour => 
          !(hour.email === email && hour.start_time === startTime)
        ));
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to ${status} hour entry`);
        console.log('Error response:', errorData);
      }
    } catch (error) {
      console.error(`Error ${status} hour:`, error);
      setError(`Failed to ${status} hour entry`);
    } finally {
      setUpdating('');
    }
  };

  const fetchAllSubmissions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllSubmissions(data.entries || []);
        setSummary(data.summary || null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch all submissions');
      }
    } catch (error) {
      console.error('Error fetching all submissions:', error);
      setError('Failed to fetch all submissions');
    }
  };

  const downloadExport = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const response = await fetch(`${apiUrl}/admin/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `volunteer-hours-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download export');
      }
    } catch (error) {
      console.error('Error downloading export:', error);
      setError('Failed to download export');
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === 'pending') {
        fetchPendingHours();
      } else {
        fetchAllSubmissions();
      }
    }
  }, [token, activeTab]);

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
        <h3 className="text-xl font-semibold">Admin Dashboard</h3>
        <div className="flex space-x-2">
          <button
            onClick={downloadExport}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Export CSV
          </button>
          <button
            onClick={activeTab === 'pending' ? fetchPendingHours : fetchAllSubmissions}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Hours ({pendingHours.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Submissions
          </button>
        </nav>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Summary Stats (for All Submissions tab) */}
      {activeTab === 'all' && summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.totalVolunteers}</div>
            <div className="text-sm text-gray-600">Volunteers</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.totalHours}</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{summary.approvedHours}</div>
            <div className="text-sm text-gray-600">Approved Hours</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingHours}</div>
            <div className="text-sm text-gray-600">Pending Hours</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{summary.totalEntries}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
        </div>
      )}

      {/* Pending Hours Tab */}
      {activeTab === 'pending' && (
        pendingHours.length === 0 ? (
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
        )
      )}

      {/* All Submissions Tab */}
      {activeTab === 'all' && (
        allSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No volunteer submissions found.
          </div>
        ) : (
          <div className="space-y-4">
            {allSubmissions.map((submission, index) => {
              const getStatusBadge = (status: string) => {
                const badges = {
                  pending: 'bg-yellow-100 text-yellow-800',
                  approved: 'bg-green-100 text-green-800',
                  rejected: 'bg-red-100 text-red-800'
                };
                return badges[status as keyof typeof badges] || badges.pending;
              };

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {submission.user_name} ({submission.user_email})
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(submission.start_time)} - {formatDateTime(submission.end_time)}
                      </div>
                      <div className="text-sm font-medium text-blue-600">
                        {submission.hours} hours
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </div>
                  
                  {submission.description && (
                    <div className="text-sm text-gray-700 mb-2 bg-gray-50 p-2 rounded">
                      <strong>Description:</strong> {submission.description}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Submitted: {formatDateTime(submission.created_at)}</span>
                    {submission.updated_at !== submission.created_at && (
                      <span>Updated: {formatDateTime(submission.updated_at)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}