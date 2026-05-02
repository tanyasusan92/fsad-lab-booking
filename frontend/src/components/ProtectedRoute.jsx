import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  // 1. No token → bounce to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Token exists but user data is missing → corrupted state, force re-login
  if (!userJson) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  // 3. If allowedRoles provided, check the user's role
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(userJson);
      if (!allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        return <Navigate to="/unauthorized" replace />;
      }
    } catch {
      // Corrupted user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  // 4. All checks passed — render the protected content
  return children;
}

export default ProtectedRoute;