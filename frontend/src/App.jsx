import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Labs from './pages/Labs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route — redirect to dashboard  if logged in, else login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/labs" element={ <ProtectedRoute> <Labs /> </ProtectedRoute> }/>

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        

        {/* Protected routes (any logged-in user) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;