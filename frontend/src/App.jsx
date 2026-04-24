import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LeadsPage from './pages/LeadsPage';
import NewLeadForm from './pages/NewLeadForm';
import LeadDetailPage from './pages/LeadDetailPage';
import ClientsPage from './pages/ClientsPage';
import NewClientForm from './pages/NewClientForm';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: '260px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/leads" replace />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/new" element={<NewLeadForm />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/new" element={<NewClientForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
