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

          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded">
            <p className="font-medium">Logged in successfully!</p>
            <p className="text-sm mt-1">
              Email: {user.email} | Role: <strong>{user.role}</strong>
            </p>
          </div>

          <p className="text-gray-500 mt-6 text-sm">
            (Full dashboard with labs and bookings coming soon...)
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;