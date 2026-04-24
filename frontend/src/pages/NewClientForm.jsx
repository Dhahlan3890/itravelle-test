import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const API_BASE = 'http://localhost:8000/api';

const NewClientForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [subClients, setSubClients] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Agent',
    agent: '',
    parent_client: '',
    sub_client_parent: '',
    currency: 'USD',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (formData.agent) fetchClients(formData.agent);
    else setClients([]);
  }, [formData.agent]);

  useEffect(() => {
    if (formData.parent_client) fetchSubClients(formData.parent_client);
    else setSubClients([]);
  }, [formData.parent_client]);

  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/clients/?role=Agent`);
      setAgents(res.data.map(a => ({ code: a.id, name: a.name })));
    } catch (err) { console.error(err); }
  };

  const fetchClients = async (agentId) => {
    try {
      const res = await axios.get(`${API_BASE}/clients/?role=Client`);
      // Filtering in JS for simplicity, though backend filtering by parent would be better
      // But my backend doesn't have parent filtering yet. I'll stick to simple role filtering.
      setClients(res.data.filter(c => c.agent === agentId).map(c => ({ code: c.id, name: c.name })));
    } catch (err) { console.error(err); }
  };

  const fetchSubClients = async (clientId) => {
    try {
      const res = await axios.get(`${API_BASE}/clients/?role=Sub-client`);
      setSubClients(res.data.filter(c => c.parent_client === clientId).map(c => ({ code: c.id, name: c.name })));
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset child fields when parent changes
    if (name === 'role') {
      setFormData(prev => ({ ...prev, role: value, agent: '', parent_client: '', sub_client_parent: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/clients/`, {
        ...formData,
        agent: formData.agent || null,
        parent_client: formData.parent_client || null,
        sub_client_parent: formData.sub_client_parent || null,
      });
      navigate('/clients');
    } catch (err) {
      console.error("Error creating client:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/clients')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Back to Clients
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Create New Client</h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Client Name</label>
            <input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corp" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Role / Type</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="Agent">Agent</option>
              <option value="Client">Client</option>
              <option value="Sub-client">Sub-client</option>
              <option value="Requester">Requester</option>
              <option value="Direct Requester">Direct Requester</option>
            </select>
          </div>

          {/* Conditional Dropdowns based on Role */}
          {['Client', 'Sub-client', 'Requester'].includes(formData.role) && (
            <SearchableSelect 
              label="Agent"
              placeholder="Select Agent"
              options={agents}
              value={formData.agent}
              onChange={val => setFormData({ ...formData, agent: val, parent_client: '', sub_client_parent: '' })}
            />
          )}

          {['Sub-client', 'Requester'].includes(formData.role) && (
            <SearchableSelect 
              label="Client"
              placeholder="Select Client"
              options={clients}
              value={formData.parent_client}
              onChange={val => setFormData({ ...formData, parent_client: val, sub_client_parent: '' })}
            />
          )}

          {formData.role === 'Requester' && (
            <SearchableSelect 
              label="Sub-client"
              placeholder="Select Sub-client"
              options={subClients}
              value={formData.sub_client_parent}
              onChange={val => setFormData({ ...formData, sub_client_parent: val })}
            />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Default Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="LKR">LKR</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="client@example.com" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Phone Number</label>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              <Save size={20} /> {loading ? 'Saving...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientForm;
