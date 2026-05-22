import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;