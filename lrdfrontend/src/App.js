import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import { ToastProvider } from './hooks/useToast';
import { DialogProvider } from './hooks/useDialog';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyMeetings from './pages/MyMeetings';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <DialogProvider>
      <ToastProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <div className="App">
                <Navbar />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-meetings"
                    element={
                      <ProtectedRoute>
                        <MyMeetings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ToastProvider>
    </DialogProvider>
  );
}

export default App;
