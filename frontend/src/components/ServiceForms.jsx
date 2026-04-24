import React, { useState } from 'react';
import axios from 'axios';
import SearchableSelect from './SearchableSelect';

const API_BASE = 'http://localhost:8000/api';

export const FlightForm = ({ leadId, onCancel, onSuccess, metadata }) => {
  const [formData, setFormData] = useState({
    lead: leadId,
    origin: '',
    destination: '',
    departure_date: '',
    return_date: '',
    adults: 1,
    children: 0,
    cabin_class: 'Economy',
    trip_type: 'One Way'
  });

  const [originOptions, setOriginOptions] = useState([]);
  const [destOptions, setDestOptions] = useState([]);
  const [loading, setLoading] = useState({ origin: false, dest: false });

  const handleOriginSearch = async (query) => {
    if (!query || query.length < 2) return;
    setLoading(prev => ({...prev, origin: true}));
    try {
      const res = await axios.get(`${API_BASE}/metadata/airports/?q=${query}`);
      setOriginOptions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({...prev, origin: false})); }
  };

  const handleDestSearch = async (query) => {
    if (!query || query.length < 2) return;
    setLoading(prev => ({...prev, dest: true}));
    try {
      const res = await axios.get(`${API_BASE}/metadata/airports/?q=${query}`);
      setDestOptions(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(prev => ({...prev, dest: false})); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      if (formData.trip_type !== 'Return') {
        dataToSend.return_date = null;
      }
      await axios.post(`${API_BASE}/flights/`, dataToSend);
      onSuccess();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-primary)' }}>
      <h3 style={{ marginBottom: '24px' }}>New Flight Service</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <SearchableSelect 
          label="Origin"
          placeholder={loading.origin ? "Searching..." : "Type city/airport"}
          options={originOptions}
          value={formData.origin}
          onSearch={handleOriginSearch}
          onChange={val => {
            setFormData({...formData, origin: val});
          }}
        />
        <SearchableSelect 
          label="Destination"
          placeholder={loading.dest ? "Searching..." : "Type city/airport"}
          options={destOptions}
          value={formData.destination}
          onSearch={handleDestSearch}
          onChange={val => {
            setFormData({...formData, destination: val});
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Departure</label>
          <input type="date" required value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trip Type</label>
          <select value={formData.trip_type} onChange={e => setFormData({...formData, trip_type: e.target.value})}>
            <option>One Way</option>
            <option>Return</option>
            <option>Multi-city</option>
          </select>
        </div>
        {formData.trip_type === 'Return' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Return</label>
            <input type="date" required value={formData.return_date} min={formData.departure_date} onChange={e => setFormData({...formData, return_date: e.target.value})} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Adults</label>
          <input type="number" value={formData.adults} onChange={e => setFormData({...formData, adults: e.target.value})} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Children</label>
          <input type="number" value={formData.children} onChange={e => setFormData({...formData, children: e.target.value})} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cabin</label>
          <select value={formData.cabin_class} onChange={e => setFormData({...formData, cabin_class: e.target.value})}>
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
            <option>First Class</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold' }}>Add Flight</button>
        </div>
      </form>
    </div>
  );
};

export const AccommodationForm = ({ leadId, onCancel, onSuccess, metadata }) => {
  const [formData, setFormData] = useState({
    lead: leadId,
    hotel_name: '',
    hotel_id: '',
    country: '', // New field for selection
    city: '',
    check_in: '',
    check_out: '',
    rooms: 1,
    guests: 1,
    room_type: '',
    meal_type: ''
  });

  const [tboCountries, setTboCountries] = useState([]);
  const [tboCities, setTboCities] = useState([]);
  const [tboHotels, setTboHotels] = useState([]);
  const [loading, setLoading] = useState({ countries: false, cities: false, hotels: false });

  // Fetch TBO countries on mount
  React.useEffect(() => {
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

  // Fetch TBO cities when country changes
  React.useEffect(() => {
    const fetchCities = async () => {
      setLoading(prev => ({...prev, cities: true}));
      try {
        const res = await axios.get(`${API_BASE}/metadata/cities/?country_code=${formData.country}`);
        setTboCities(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({...prev, cities: false})); }
    };
    if (formData.country) fetchCities();
  }, [formData.country]);

  // Fetch TBO hotels when city changes
  React.useEffect(() => {
    const fetchHotels = async () => {
      setLoading(prev => ({...prev, hotels: true}));
      try {
        const res = await axios.get(`${API_BASE}/metadata/hotels/?city_code=${formData.city}`);
        setTboHotels(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(prev => ({...prev, hotels: false})); }
    };
    if (formData.city) fetchHotels();
  }, [formData.city]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { country, ...dataToSubmit } = formData;
      await axios.post(`${API_BASE}/accommodations/`, dataToSubmit);
      onSuccess();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--accent-primary)' }}>
      <h3 style={{ marginBottom: '24px' }}>New Accommodation Service</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <SearchableSelect 
          label="Country"
          placeholder={loading.countries ? "Loading..." : "Select Country"}
          options={tboCountries}
          value={formData.country}
          onChange={val => setFormData({...formData, country: val, city: '', hotel_name: ''})}
        />
        <SearchableSelect 
          label="City"
          placeholder={loading.cities ? "Loading..." : "Select City"}
          options={tboCities}
          value={formData.city}
          onChange={val => setFormData({...formData, city: val, hotel_name: ''})}
        />
        <SearchableSelect 
          label="Hotel Name"
          placeholder={loading.hotels ? "Loading..." : "Select Hotel (from TBO)"}
          options={tboHotels}
          value={formData.hotel_name}
          onChange={val => {
            const selected = tboHotels.find(h => h.code === val);
            setFormData({
              ...formData, 
              hotel_name: selected ? selected.name : val,
              hotel_id: selected ? selected.tbo_id : ''
            });
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Check-in</label>
          <input 
            type="date" 
            required 
            value={formData.check_in} 
            onChange={e => {
              const newCheckIn = e.target.value;
              setFormData({
                ...formData, 
                check_in: newCheckIn,
                check_out: formData.check_out && formData.check_out < newCheckIn ? newCheckIn : formData.check_out
              });
            }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Check-out</label>
          <input 
            type="date" 
            required 
            min={formData.check_in}
            value={formData.check_out} 
            onChange={e => setFormData({...formData, check_out: e.target.value})} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rooms</label>
          <input type="number" value={formData.rooms} onChange={e => setFormData({...formData, rooms: e.target.value})} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Guests</label>
          <input type="number" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Room Type</label>
          <input value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})} placeholder="Deluxe" />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
          <button type="submit" style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold' }}>Add Acc</button>
        </div>
      </form>
    </div>
  );
};
