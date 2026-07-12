import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Settings from './pages/Settings';
import Header from './components/Header';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Main Layout Wrapper
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0d1318] text-[#ffffff] overflow-hidden font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

// Placeholder components for the other routes
const Placeholder = ({ title, desc }) => (
  <div className="flex flex-col items-center justify-center h-4/5 text-center gap-4 text-dark-muted">
    <h3 className="text-xl text-dark-text font-heading font-semibold">{title}</h3>
    <p className="text-sm max-w-sm leading-relaxed">{desc}</p>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/fleet" element={
        <ProtectedRoute>
          <Layout>
            <Fleet />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/drivers" element={
        <ProtectedRoute>
          <Layout>
            <Drivers />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/trips" element={
        <ProtectedRoute>
          <Layout>
            <Trips />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Placeholders */}
      <Route path="/maintenance" element={
        <ProtectedRoute>
          <Layout>
            <Placeholder
              title="5. Maintenance Log"
              desc="Assign vehicles to shop, review repair history, and track scheduling tasks."
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/fuel-expenses" element={
        <ProtectedRoute>
          <Layout>
            <Placeholder 
              title="6. Fuel & Expenses" 
              desc="Record fuel fills, toll fees, maintenance invoices, and track operational expenditure." 
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <Layout>
            <Placeholder
              title="7. Analytics Reports"
              desc="Observe distance metrics, calculate exact vehicle ROI, track fuel efficiencies, and export data spreadsheets."
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Wildcard redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
