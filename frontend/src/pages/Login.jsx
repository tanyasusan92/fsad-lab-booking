import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('signup')==='success') {
        setSuccessMessage('Account created successfully! Please log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload on form submit

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      const { token, user } = response.data;

      // Store token + user info in localStorage so it persists across page refreshes
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to dashboard (we'll create this in next step)
      navigate('/dashboard');
    } catch (err) {
      // Show error message from backend, or fallback
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">
          Campus Lab Booking
        </h1>
        <p className="text-gray-600 mb-6">Login to your account</p>
        
        {/* Success message banner */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* Error message banner */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;