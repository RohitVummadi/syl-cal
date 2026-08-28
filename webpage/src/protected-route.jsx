import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

export default function ProtectedRoute({ children }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <main className="auth-loading">Checking your session…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
