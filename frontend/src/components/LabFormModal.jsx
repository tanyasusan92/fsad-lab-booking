import { useState, useEffect } from 'react';
import { labsAPI } from '../services/api';

function LabFormModal({ lab, onClose }) {
  const isEditing = !!lab;

  // Form state — initialize from lab if editing, else defaults
  const [formData, setFormData] = useState({
    name: '',
    type: 'computer',
    location: '',
    capacity: 1,
    equipment_description: '',
    operating_start_time: '09:00',
    operating_end_time: '18:00',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill if editing
  useEffect(() => {
    if (lab) {
      setFormData({
        name: lab.name || '',
        type: lab.type || 'computer',
        location: lab.location || '',
        capacity: lab.capacity || 1,
        equipment_description: lab.equipment_description || '',
        operating_start_time: lab.operating_start_time?.slice(0, 5) || '09:00',
        operating_end_time: lab.operating_end_time?.slice(0, 5) || '18:00',
      });
    }
  }, [lab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Convert HH:mm to HH:mm:ss for backend
    const payload = {
      ...formData,
      operating_start_time: `${formData.operating_start_time}:00`,
      operating_end_time: `${formData.operating_end_time}:00`,
      capacity: parseInt(formData.capacity, 10),
    };

    setLoading(true);
    try {
      if (isEditing) {
        await labsAPI.update(lab.id, payload);
      } else {
        await labsAPI.create(payload);
      }
      onClose(true); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lab');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Edit Lab' : 'Add New Lab'}
            </h2>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lab Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Computer Lab A-101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="computer">Computer Lab</option>
                <option value="printer_3d">3D Printer Room</option>
                <option value="studio">Recording Studio</option>
                <option value="chemistry">Chemistry Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Building A, 1st Floor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opens at
                </label>
                <input
                  type="time"
                  name="operating_start_time"
                  value={formData.operating_start_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Closes at
                </label>
                <input
                  type="time"
                  name="operating_end_time"
                  value={formData.operating_end_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Description
              </label>
              <textarea
                name="equipment_description"
                value={formData.equipment_description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 30 PCs with Visual Studio, MATLAB"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Lab' : 'Create Lab'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LabFormModal;