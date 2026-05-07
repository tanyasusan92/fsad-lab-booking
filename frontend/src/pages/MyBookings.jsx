import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.getMine();
      setBookings(response.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    if (!window.confirm(`Cancel booking for ${booking.lab_name} on ${formatDate(booking.date)}?`)) {
      return;
    }
    try {
      await bookingsAPI.cancel(booking.id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr) => timeStr?.slice(0, 5) || '';

  const statusBadge = (status) => {
    const styles = {
      requested: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">My Bookings</h1>
            <p className="text-gray-600 mt-1">Your booking history and status</p>
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
            Loading...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate('/labs')}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Browse Labs
            </button>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {b.lab_name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(b.status)}`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      📍 {b.lab_location}
                    </p>
                    <p className="text-gray-700 text-sm mt-2">
                      🗓️ <strong>{formatDate(b.date)}</strong> at{' '}
                      {formatTime(b.start_time)} - {formatTime(b.end_time)}
                    </p>
                    {b.purpose && (
                      <p className="text-gray-500 text-sm mt-2 italic">
                        "{b.purpose}"
                      </p>
                    )}
                    {b.status === 'rejected' && b.rejection_reason && (
                      <p className="text-red-700 text-sm mt-2 bg-red-50 p-2 rounded">
                        Rejected: {b.rejection_reason}
                      </p>
                    )}
                    {b.decided_by_name && b.status !== 'requested' && (
                      <p className="text-gray-500 text-xs mt-2">
                        Decision by {b.decided_by_name}
                      </p>
                    )}
                  </div>
                  {(b.status === 'requested' || b.status === 'approved') && (
                    <button
                      onClick={() => handleCancel(b)}
                      className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;