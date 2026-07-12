import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Main Layout Wrapper
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-[#030712] text-dark-text overflow-hidden font-sans relative">
      {/* Background Aurora Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/12 blur-[120px] pointer-events-none z-0"></div>

      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden relative z-10">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

// Placeholder components for the other routes
const Placeholder = ({ title, icon, desc }) => (
  <div className="flex flex-col items-center justify-center h-4/5 text-center gap-4 text-dark-muted">
    <div className="text-5xl opacity-50">{icon}</div>
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
              title="5. Maintenance log" 
              icon="🔧" 
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
              icon="💳" 
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
              icon="📈" 
              desc="Observe distance metrics, calculate exact vehicle ROI, track fuel efficiencies, and export data spreadsheets." 
            />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Placeholder 
              title="8. Portal Settings" 
              icon="⚙" 
              desc="Customize user permissions, configure account triggers, modify local database buffers, or perform factory database resets." 
            />
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
