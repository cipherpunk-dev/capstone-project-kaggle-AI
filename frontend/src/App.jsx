import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import VivaInterface from './pages/VivaInterface';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-background-primary text-text-primary selection:bg-accent-primary/30">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            element={isAuthenticated && isAdmin ? <DashboardLayout /> : <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          >
            <Route path="/admin-dashboard" element={<Dashboard />} />
            {/* Add placeholder routes for other sidebar links if needed */}
            <Route path="/admin-dashboard/sessions" element={<div className="p-8">Sessions Page (Coming Soon)</div>} />
            <Route path="/admin-dashboard/projects" element={<div className="p-8">Projects Page (Coming Soon)</div>} />
            <Route path="/admin-dashboard/targets" element={<div className="p-8">Targets Page (Coming Soon)</div>} />
          </Route>

          {/* User Routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated && !isAdmin ? <UserDashboard /> : <Navigate to={isAdmin ? "/admin-dashboard" : "/login"} />} 
          />
          <Route 
            path="/viva/:projectId" 
            element={isAuthenticated ? <VivaInterface /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? (isAdmin ? "/admin-dashboard" : "/dashboard") : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
