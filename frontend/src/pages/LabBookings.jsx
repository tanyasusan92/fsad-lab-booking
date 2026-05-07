import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, labsAPI } from '../services/api';

function LabBookings() {
  const { labId } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('requested'); // default: pending only
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reject modal state
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchLab();
  }, [labId]);

  useEffect(() => {
    fetchBookings();
  }, [labId, statusFilter]);

  const fetchLab = async () => {
    try {
      const response = await labsAPI.getById(labId);
      setLab(response.data.lab);
    } catch {
      // ignore — main bookings load handles errors
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.getForLab(labId, statusFilter);
      setBookings(response.data.bookings);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking) => {
    if (!window.confirm(`Approve booking for ${booking.user_name}?`)) return;
    try {
      await bookingsAPI.approve(booking.id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectClick = (booking) => {
    setRejectingBooking(booking);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectingBooking) return;
    try {
      await bookingsAPI.reject(rejectingBooking.id, rejectReason);
      setRejectingBooking(null);
      setRejectReason('');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline mb-3 text-sm"
          >
            ← Dashboard
          </button>
          <h1 className="text-3xl font-bold text-blue-600">
            Manage Bookings
          </h1>
          {lab && (
            <p className="text-gray-600 mt-1">
              {lab.name} • {lab.location}
            </p>
          )}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by status
          </label>
          <div className="flex gap-2 flex-wrap">
            {['requested', 'approved', 'rejected', 'cancelled', ''].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings */}
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
            No bookings found with this filter.
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {b.user_name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(b.status)}`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">{b.user_email}</p>
                    <p className="text-gray-700 text-sm mt-2">
                      🗓️ <strong>{formatDate(b.date)}</strong> •{' '}
                      {formatTime(b.start_time)} - {formatTime(b.end_time)}
                    </p>
                    {b.purpose && (
                      <p className="text-gray-600 text-sm mt-2 italic">
                        "{b.purpose}"
                      </p>
                    )}
                    {b.rejection_reason && (
                      <p className="text-red-700 text-sm mt-2 bg-red-50 p-2 rounded">
                        Rejection reason: {b.rejection_reason}
                      </p>
                    )}
                  </div>
                  {b.status === 'requested' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(b)}
                        className="px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(b)}
                        className="px-3 py-1.5 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Reject Booking
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {rejectingBooking.user_name} • {formatDate(rejectingBooking.date)} •{' '}
              {formatTime(rejectingBooking.start_time)}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              placeholder="e.g. Lab is reserved for a class at this time"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setRejectingBooking(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabBookings;