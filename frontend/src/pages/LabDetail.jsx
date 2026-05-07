import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

function LabDetail() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Default to today's date in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const [lab, setLab] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking modal state
  const [bookingSlot, setBookingSlot] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, [labId, selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingsAPI.getSlots(labId, selectedDate);
      setLab(response.data.lab);
      setSlots(response.data.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    setBookingSlot(slot);
    setPurpose('');
  };

  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;
    setSubmitting(true);
    try {
      await bookingsAPI.create({
        slot_id: bookingSlot.id,
        purpose,
      });
      setBookingSlot(null);
      setPurpose('');
      fetchSlots(); // refresh the slot list
      alert('Booking submitted! Awaiting staff approval.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timeStr) => timeStr?.slice(0, 5) || '';

  // Get next 7 days for the date picker
  const getDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return dates;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={() => navigate('/labs')}
            className="text-blue-600 hover:underline mb-3 text-sm"
          >
            ← Back to Labs
          </button>
          {lab ? (
            <>
              <h1 className="text-3xl font-bold text-blue-600">{lab.name}</h1>
              <div className="text-gray-600 mt-2 space-y-1 text-sm">
                <p>📍 {lab.location}</p>
                <p>👥 Capacity: {lab.capacity}</p>
                <p>
                  🕒 Operating hours: {formatTime(lab.operating_start_time)} -{' '}
                  {formatTime(lab.operating_end_time)}
                </p>
                {lab.equipment_description && (
                  <p className="italic text-gray-500 mt-2">
                    {lab.equipment_description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-2xl text-gray-400">Loading lab...</h1>
          )}
        </div>

        {/* Date selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select date
          </label>
          <div className="flex gap-2 flex-wrap">
            {getDateOptions().map((d) => (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`px-4 py-2 rounded-md text-sm transition ${
                  selectedDate === d.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Slots */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available Slots
          </h2>

          {loading && (
            <div className="text-center text-gray-500 py-8">Loading slots...</div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No slots available for this date.
            </div>
          )}

          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {slots.map((slot) => {
                const timeLabel = `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`;

                if (slot.is_my_booking) {
                  return (
                    <div
                      key={slot.id}
                      className="border-2 border-green-400 bg-green-50 rounded-md p-3 text-center"
                    >
                      <p className="font-semibold text-green-700">{timeLabel}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Your booking ({slot.booking_status})
                      </p>
                    </div>
                  );
                }

                if (slot.status === 'blocked') {
                  return (
                    <div
                      key={slot.id}
                      className="border border-gray-300 bg-gray-100 rounded-md p-3 text-center opacity-60"
                    >
                      <p className="font-semibold text-gray-500">{timeLabel}</p>
                      <p className="text-xs text-gray-500 mt-1">Blocked</p>
                    </div>
                  );
                }

                if (!slot.is_available) {
                  return (
                    <div
                      key={slot.id}
                      className="border border-red-300 bg-red-50 rounded-md p-3 text-center"
                    >
                      <p className="font-semibold text-red-700">{timeLabel}</p>
                      <p className="text-xs text-red-600 mt-1">
                        Booked by {slot.booked_by_name || 'someone'}
                      </p>
                    </div>
                  );
                }

                return (
                  <button
                    key={slot.id}
                    onClick={() => handleBookSlot(slot)}
                    className="border-2 border-blue-400 bg-blue-50 hover:bg-blue-100 rounded-md p-3 text-center transition"
                  >
                    <p className="font-semibold text-blue-700">{timeLabel}</p>
                    <p className="text-xs text-blue-600 mt-1">Available — Book</p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex gap-4 flex-wrap">
            <span>
              <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-400 rounded mr-1"></span>
              Available
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-red-50 border border-red-300 rounded mr-1"></span>
              Booked by other
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-green-50 border border-green-400 rounded mr-1"></span>
              Your booking
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></span>
              Blocked
            </span>
          </div>
        </div>
      </div>

      {/* Booking confirmation modal */}
      {bookingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Confirm Booking
            </h2>
            <p className="text-gray-600 mb-4">
              <strong>{lab?.name}</strong>
              <br />
              {selectedDate} | {formatTime(bookingSlot.start_time)} -{' '}
              {formatTime(bookingSlot.end_time)}
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose (optional)
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="e.g. Working on FSAD assignment"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setBookingSlot(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabDetail;