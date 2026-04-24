import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const API_BASE = 'http://localhost:8000/api';

const NewLeadForm = () => {
  const navigate = useNavigate();
  const [tboCountries, setTboCountries] = useState([]);
  const [tboCities, setTboCities] = useState([]);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [subClients, setSubClients] = useState([]);
  const [requesters, setRequesters] = useState([]);
  const [directRequesters, setDirectRequesters] = useState([]);
  const [loading, setLoading] = useState({ countries: false, cities: false });
  const [leadType, setLeadType] = useState('Agent'); // 'Agent' or 'Direct'
  
  // Internal state to track codes for API calls
  const [selectionCodes, setSelectionCodes] = useState({
    country: '',
    city: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    agent: '',
    client: '',
    sub_client: '',
    contact_person: '',
    country: '',
    city: '',
    pax_count: 1,
    start_date: '',
    end_date: '',
    currency: 'USD'
  });

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(prev => ({...prev, countries: true}));
      try {
        const [countryRes, agentRes, directRes] = await Promise.all([
          axios.get(`${API_BASE}/metadata/countries/`),
          axios.get(`${API_BASE}/clients/?role=Agent`),
          axios.get(`${API_BASE}/clients/?role=Direct Requester`)
        ]);
        setTboCountries(countryRes.data);
        setAgents(agentRes.data.map(a => ({ code: a.id, name: a.name })));
        setDirectRequesters(directRes.data.map(a => ({ code: a.id, name: a.name })));
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({...prev, countries: false})); }
    };
    fetchInitialData();
  }, []);

  // Fetch TBO cities when country code changes
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(prev => ({...prev, cities: true}));
      try {
        const res = await axios.get(`${API_BASE}/metadata/cities/?country_code=${selectionCodes.country}`);
        setTboCities(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({...prev, cities: false})); }
    };
    if (selectionCodes.country) fetchCities();
  }, [selectionCodes.country]);

  // Fetch Clients when Agent changes
  useEffect(() => {
    const fetchLinkedClients = async () => {
      try {
        const res = await axios.get(`${API_BASE}/clients/?role=Client`);
        setClients(res.data.filter(c => c.agent === formData.agent).map(c => ({ code: c.id, name: c.name })));
      } catch (err) { console.error(err); }
    };
    if (formData.agent && leadType === 'Agent') fetchLinkedClients();
    else setClients([]);
  }, [formData.agent, leadType]);

  // Fetch Sub-Clients & Requesters when Client changes
  useEffect(() => {
    const fetchLinkedSubData = async () => {
      try {
        const [subRes, reqRes] = await Promise.all([
          axios.get(`${API_BASE}/clients/?role=Sub-client`),
          axios.get(`${API_BASE}/clients/?role=Requester`)
        ]);
        setSubClients(subRes.data.filter(c => c.parent_client === formData.client).map(c => ({ code: c.id, name: c.name })));
        setRequesters(reqRes.data.filter(c => c.parent_client === formData.client).map(c => ({ code: c.id, name: c.name })));
      } catch (err) { console.error(err); }
    };
    if (formData.client && leadType === 'Agent') fetchLinkedSubData();
    else {
      setSubClients([]);
      setRequesters([]);
    }
  }, [formData.client, leadType]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type) => {
    setLeadType(type);
    // Clear selections when switching type
    setFormData({
      ...formData,
      agent: '',
      client: '',
      sub_client: '',
      contact_person: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/leads/`, {
        ...formData,
        agent: formData.agent || null,
        client: formData.client || null,
        sub_client: formData.sub_client || null,
        contact_person: formData.contact_person || null
      });
      navigate('/leads');
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/leads')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Back to Leads
      </button>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '32px' }}>Create New Lead</h1>

        {/* Lead Type Toggle */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', backgroundColor: 'var(--bg-tertiary)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
          <button 
            type="button"
            onClick={() => handleTypeChange('Agent')}
            style={{ 
              padding: '8px 20px', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: leadType === 'Agent' ? 'var(--accent-primary)' : 'transparent',
              color: leadType === 'Agent' ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}
          >
            Agent Lead
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('Direct')}
            style={{ 
              padding: '8px 20px', 
              borderRadius: '8px', 
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: leadType === 'Direct' ? 'var(--accent-primary)' : 'transparent',
              color: leadType === 'Direct' ? 'var(--bg-primary)' : 'var(--text-secondary)'
            }}
          >
            Direct Lead
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: 'span 2' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Lead Name</label>
            <input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Colombo Trip" style={{ width: '100%' }} />
          </div>

          {leadType === 'Agent' ? (
            <>
              <SearchableSelect 
                label="Agent"
                placeholder="Select Agent"
                options={agents}
                value={formData.agent}
                onChange={val => setFormData({ ...formData, agent: val, client: '', sub_client: '', contact_person: '' })}
              />

              <SearchableSelect 
                label="Client"
                placeholder="Select Client"
                options={clients}
                value={formData.client}
                onChange={val => setFormData({ ...formData, client: val, sub_client: '', contact_person: '' })}
              />

              <SearchableSelect 
                label="Sub-Client"
                placeholder="Select Sub-Client"
                options={subClients}
                value={formData.sub_client}
                onChange={val => setFormData({ ...formData, sub_client: val })}
              />

              <SearchableSelect 
                label="Contact Person (Requester)"
                placeholder="Select Requester"
                options={requesters}
                value={formData.contact_person}
                onChange={val => setFormData({ ...formData, contact_person: val })}
              />
            </>
          ) : (
            <div style={{ gridColumn: 'span 2' }}>
              <SearchableSelect 
                label="Direct Requester"
                placeholder="Select Direct Requester"
                options={directRequesters}
                value={formData.contact_person}
                onChange={val => setFormData({ ...formData, contact_person: val })}
              />
            </div>
          )}

          <SearchableSelect 
            label="Country"
            placeholder={loading.countries ? "Loading..." : "Select Country"}
            options={tboCountries}
            value={selectionCodes.country}
            onChange={val => {
              const selected = tboCountries.find(c => c.code === val);
              setSelectionCodes({ ...selectionCodes, country: val, city: '' });
              setFormData({ ...formData, country: selected ? selected.name : val, city: '' });
            }}
          />

          <SearchableSelect 
            label="City"
            placeholder={loading.cities ? "Loading..." : "Select City"}
            options={tboCities}
            value={selectionCodes.city}
            onChange={val => {
              const selected = tboCities.find(c => c.code === val);
              setSelectionCodes({ ...selectionCodes, city: val });
              setFormData({ ...formData, city: selected ? selected.name : val });
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Number of Pax</label>
            <input type="number" name="pax_count" required value={formData.pax_count} onChange={handleChange} min="1" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="LKR">LKR</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Start Date</label>
            <input type="date" name="start_date" required value={formData.start_date} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>End Date</label>
            <input type="date" name="end_date" required value={formData.end_date} onChange={handleChange} />
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
            <button type="submit" style={{ width: '100%', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Save size={20} /> Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLeadForm;
