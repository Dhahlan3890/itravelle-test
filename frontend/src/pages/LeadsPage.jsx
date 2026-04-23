import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, ArrowUpDown, MoreVertical, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads/`);
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Leads</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your travel leads and quotations.</p>
        </div>
        <Link 
          to="/leads/new" 
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--bg-primary)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none'
          }}
        >
          <Plus size={20} />
          New Lead
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              style={{ width: '100%', paddingLeft: '40px' }}
            />
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Filter size={18} />
            Filter
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <ArrowUpDown size={18} />
            Sort
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 16px' }}>Lead Name</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Client</th>
              <th style={{ padding: '12px 16px' }}>Country</th>
              <th style={{ padding: '12px 16px' }}>City</th>
              <th style={{ padding: '12px 16px' }}>Start Date</th>
              <th style={{ padding: '12px 16px' }}>Pax</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No leads found. Create one to get started.</td></tr>
            ) : (
              leads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', transition: 'background 0.2s' }} className="table-row">
                  <td style={{ padding: '16px' }}>{lead.name}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '100px', 
                      fontSize: '11px', 
                      fontWeight: '600',
                      backgroundColor: lead.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: lead.status === 'Pending' ? 'var(--accent-primary)' : 'var(--success)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>{lead.client_account}</td>
                  <td style={{ padding: '16px' }}>{lead.country}</td>
                  <td style={{ padding: '16px' }}>{lead.city}</td>
                  <td style={{ padding: '16px' }}>{lead.start_date}</td>
                  <td style={{ padding: '16px' }}>{lead.pax_count}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link to={`/leads/${lead.id}`} style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <Eye size={16} />
                      </Link>
                      <button style={{ color: 'var(--text-secondary)', padding: '6px' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsPage;
