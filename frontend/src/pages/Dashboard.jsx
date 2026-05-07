import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.name || 'User'}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded mb-6">
            <p className="text-sm text-blue-800">
              <strong>{user.email}</strong> | Role:{' '}
              <span className="font-bold">{user.role}</span>
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/labs')}
              className="text-left p-5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <h3 className="font-semibold text-blue-700">🏢 Browse Labs</h3>
              <p className="text-sm text-gray-600 mt-1">
                {user.role === 'admin'
                  ? 'View, add, edit, or delete campus labs'
                  : 'View available labs and book a slot'}
              </p>
            </button>

            <button
              onClick={() => navigate('/my-bookings')}
              className="text-left p-5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <h3 className="font-semibold text-green-700">📅 My Bookings</h3>
              <p className="text-sm text-gray-600 mt-1">
                View your booking history and cancel pending bookings
              </p>
            </button>

            {(user.role === 'staff' || user.role === 'admin') && (
              <button
                onClick={() => navigate('/labs')}
                className="text-left p-5 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition md:col-span-2"
              >
                <h3 className="font-semibold text-purple-700">
                  ✅ Manage Bookings
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click a lab to approve or reject pending bookings (you'll see a "Manage" link on each lab)
                </p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;