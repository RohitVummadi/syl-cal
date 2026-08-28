import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SylCal from "./pages/SylCal";
import { AuthProvider } from './auth-context';
import ProtectedRoute from './protected-route';
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/sylcal" element={<ProtectedRoute><SylCal /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
