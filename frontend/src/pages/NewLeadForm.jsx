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
  const [loading, setLoading] = useState({ countries: false, cities: false });
  
  // Internal state to track codes for API calls
  const [selectionCodes, setSelectionCodes] = useState({
    country: '',
    city: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    client_account: '',
    sub_account: '',
    contact_person: '',
    country: '', // This will store the NAME
    city: '',    // This will store the NAME
    pax_count: 1,
    start_date: '',
    end_date: '',
    currency: 'USD'
  });

  // Fetch TBO countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoading(prev => ({...prev, countries: true}));
      try {
        const res = await axios.get(`${API_BASE}/metadata/countries/`);
        setTboCountries(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({...prev, countries: false})); }
    };
    fetchCountries();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/leads/`, formData);
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Lead Name</label>
            <input name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Colombo Trip" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Client Account</label>
            <input name="client_account" required value={formData.client_account} onChange={handleChange} placeholder="e.g. Nestle" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Contact Person</label>
            <input name="contact_person" required value={formData.contact_person} onChange={handleChange} placeholder="e.g. John Doe" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sub-Account</label>
            <input name="sub_account" value={formData.sub_account} onChange={handleChange} placeholder="e.g. Sales Dept" />
          </div>

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
