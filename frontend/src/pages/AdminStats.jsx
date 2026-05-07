import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

function AdminStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  // Helper: get count for a specific status
  const getStatusCount = (status) => {
    if (!stats?.status_breakdown) return 0;
    const found = stats.status_breakdown.find((s) => s.status === status);
    return found ? found.count : 0;
  };

  // Color mapping for status
  const statusColors = {
    requested: 'border-yellow-400 bg-yellow-50 text-yellow-800',
    approved: 'border-green-400 bg-green-50 text-green-800',
    rejected: 'border-red-400 bg-red-50 text-red-800',
    cancelled: 'border-gray-400 bg-gray-50 text-gray-700',
    completed: 'border-blue-400 bg-blue-50 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              📊 Admin Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Booking system usage at a glance
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
          >
            ← Dashboard
          </button>
        </div>

        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading stats...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Total bookings card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8 mb-6">
              <p className="text-blue-100 text-sm uppercase tracking-wide">
                Total Bookings
              </p>
              <p className="text-5xl font-bold mt-2">{stats.total_bookings}</p>
              <p className="text-blue-100 text-sm mt-2">
                Across all labs since launch
              </p>
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Status Breakdown
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['requested', 'approved', 'rejected', 'cancelled', 'completed'].map(
                  (status) => (
                    <div
                      key={status}
                      className={`border-2 rounded-md p-4 text-center ${statusColors[status]}`}
                    >
                      <p className="text-3xl font-bold">{getStatusCount(status)}</p>
                      <p className="text-xs uppercase tracking-wide mt-1">
                        {status}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Top labs */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Top 5 Most-Booked Labs
              </h2>
              {stats.top_labs && stats.top_labs.length > 0 ? (
                <div className="space-y-3">
                  {stats.top_labs.map((lab, index) => {
                    const maxCount = stats.top_labs[0]?.booking_count || 1;
                    const percentage = (lab.booking_count / maxCount) * 100;
                    return (
                      <div key={lab.id}>
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-700">
                            #{index + 1} {lab.name}
                          </p>
                          <p className="text-sm font-semibold text-blue-600">
                            {lab.booking_count} bookings
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.max(percentage, 5)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No booking data yet. Once bookings come in, top labs will appear here.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminStats;