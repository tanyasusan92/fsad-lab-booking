import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { labsAPI } from '../services/api';
import LabFormModal from '../components/LabFormModal';

function Labs() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const [labs, setLabs] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState(null);

  // Fetch labs on mount and when filter changes
  useEffect(() => {
    fetchLabs();
  }, [filterType]);

  const fetchLabs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = filterType ? { type: filterType } : {};
      const response = await labsAPI.getAll(params);
      setLabs(response.data.labs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingLab(null);
    setShowModal(true);
  };

  const handleEditClick = (lab) => {
    setEditingLab(lab);
    setShowModal(true);
  };

  const handleDelete = async (lab) => {
    if (!window.confirm(`Are you sure you want to delete "${lab.name}"?`)) {
      return;
    }
    try {
      await labsAPI.delete(lab.id);
      fetchLabs(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lab');
    }
  };

  const handleModalClose = (refresh) => {
    setShowModal(false);
    setEditingLab(null);
    if (refresh) fetchLabs();
  };

  // Helper: format lab type for display
  const formatType = (type) => {
    const labels = {
      computer: 'Computer Lab',
      printer_3d: '3D Printer Room',
      studio: 'Recording Studio',
      chemistry: 'Chemistry Lab',
    };
    return labels[type] || type;
  };

  // Helper: badge color by type
  const typeColor = (type) => {
    const colors = {
      computer: 'bg-blue-100 text-blue-800',
      printer_3d: 'bg-purple-100 text-purple-800',
      studio: 'bg-pink-100 text-pink-800',
      chemistry: 'bg-green-100 text-green-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Labs</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? 'Manage all campus labs' : 'Browse available labs'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              ← Dashboard
            </button>
            {isAdmin && (
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                + Add Lab
              </button>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="computer">Computer Lab</option>
            <option value="printer_3d">3D Printer Room</option>
            <option value="studio">Recording Studio</option>
            <option value="chemistry">Chemistry Lab</option>
          </select>
        </div>

        {/* Content */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Loading labs...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && labs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No labs found. {isAdmin && 'Click "+ Add Lab" to create one.'}
          </div>
        )}

        {!loading && labs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <div
                key={lab.id}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {lab.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${typeColor(lab.type)}`}
                  >
                    {formatType(lab.type)}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>📍 {lab.location}</p>
                  <p>👥 Capacity: {lab.capacity}</p>
                  <p>
                    🕒 {lab.operating_start_time?.slice(0, 5)} -{' '}
                    {lab.operating_end_time?.slice(0, 5)}
                  </p>
                  {lab.staff_name && <p>👤 Staff: {lab.staff_name}</p>}
                  {lab.equipment_description && (
                    <p className="text-gray-500 italic mt-2">
                      {lab.equipment_description}
                    </p>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(lab)}
                      className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lab)}
                      className="flex-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for add/edit */}
      {showModal && (
        <LabFormModal lab={editingLab} onClose={handleModalClose} />
      )}
    </div>
  );
}

export default Labs;