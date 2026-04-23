import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadsPage from './pages/LeadsPage';
import NewLeadForm from './pages/NewLeadForm';
import LeadDetailPage from './pages/LeadDetailPage';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: '260px', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/leads" replace />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/new" element={<NewLeadForm />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
