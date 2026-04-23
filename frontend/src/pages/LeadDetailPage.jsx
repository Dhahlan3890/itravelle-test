import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit2, Trash2, ChevronDown, Plus, Plane, Hotel, CheckCircle, Receipt, Download } from 'lucide-react';
import { FlightForm, AccommodationForm } from '../components/ServiceForms';
import { FlightCard, AccommodationCard } from '../components/ServiceCards';

const API_BASE = 'http://localhost:8000/api';

const ItineraryTab = ({ lead, refresh }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--accent-primary)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '14px' }}>
        <strong>Select Preferred Options:</strong> In this tab, you can select the specific quotes you want to include in the final itinerary.
      </div>
      
      {lead.flights.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase' }}>Flights</h3>
          {lead.flights.map(flight => <FlightCard key={flight.id} flight={flight} refresh={refresh} showSelection={true} />)}
        </div>
      )}

      {lead.accommodations.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase' }}>Accommodations</h3>
          {lead.accommodations.map(acc => <AccommodationCard key={acc.id} accommodation={acc} refresh={refresh} showSelection={true} />)}
        </div>
      )}
    </div>
  );
};

const QuotationsTab = ({ lead }) => {
  const selectedQuotes = [
    ...lead.flights.flatMap(f => f.quotes.filter(q => q.is_selected)),
    ...lead.accommodations.flatMap(a => a.quotes.filter(q => q.is_selected))
  ];

  const total = selectedQuotes.reduce((acc, q) => acc + parseFloat(q.price), 0);

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Quote Summary</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Detailed breakdown of all selected services for {lead.name}</p>
        </div>
        <button style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--border-color)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '16px 24px', backgroundColor: 'var(--bg-tertiary)', fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 'bold', textTransform: 'uppercase' }}>
          <span>Service</span>
          <span>Details</span>
          <span>Provider</span>
          <span style={{ textAlign: 'right' }}>Price</span>
        </div>
        
        {selectedQuotes.length > 0 ? selectedQuotes.map((quote, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '20px 24px', backgroundColor: 'var(--bg-secondary)', fontSize: '14px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="var(--success)" /> 
              {quote.flight_service ? 'Flight' : 'Acc'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>{quote.details.substring(0, 50)}...</span>
            <span>{quote.provider}</span>
            <span style={{ textAlign: 'right', fontWeight: 'bold' }}>{quote.currency} {quote.price}</span>
          </div>
        )) : (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
            No quotes selected. Please go to the Itinerary tab to select preferred options.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '24px', backgroundColor: 'rgba(245, 158, 11, 0.05)', fontSize: '18px', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--text-primary)' }}>Total Estimated Price</span>
          <span style={{ textAlign: 'right', color: 'var(--accent-primary)' }}>USD {total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '20px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={18} color="var(--accent-primary)" /> Payment Status
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Outstanding Balance</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>USD {total.toFixed(2)}</span>
          </div>
          <button style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold' }}>
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
};

const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [metadata, setMetadata] = useState({ countries: [], cities: [], airports: [] });
  const [activeTab, setActiveTab] = useState('services');
  const [showAddService, setShowAddService] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState(null);

  useEffect(() => {
    fetchLead();
    fetchMetadata();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`${API_BASE}/leads/${id}/`);
      setLead(res.data);
    } catch (err) { console.error("Error fetching lead:", err); }
  };

  const fetchMetadata = async () => {
    try {
      const res = await axios.get(`${API_BASE}/metadata/`);
      setMetadata(res.data);
    } catch (err) { console.error("Error fetching metadata:", err); }
  };

  const handleAddService = (type) => {
    setServiceForm(type);
    setShowAddService(false);
  };

  if (!lead) return <div style={{ padding: '32px' }}>Loading...</div>;

  return (
    <div style={{ padding: '32px' }}>
      <button 
        onClick={() => navigate('/leads')}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', marginBottom: '24px' }}
      >
        <ArrowLeft size={20} />
        Back to Leads
      </button>

      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>#</div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{lead.name} <span style={{ color: 'var(--text-tertiary)', fontWeight: 'normal', fontSize: '18px' }}>#{lead.id}</span></h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{lead.client_account}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}><Edit2 size={18} /></button>
            <button style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}><Trash2 size={18} /></button>
            <button 
              onClick={() => setDetailsOpen(!detailsOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
            >
              Details <ChevronDown size={18} style={{ transform: detailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
          </div>
        </div>

        {detailsOpen && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '4px' }}>CONTACT PERSON</div>
              <div style={{ fontSize: '14px' }}>{lead.contact_person}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '4px' }}>LOCATION</div>
              <div style={{ fontSize: '14px' }}>{lead.city}, {lead.country}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '4px' }}>PAX COUNT</div>
              <div style={{ fontSize: '14px' }}>{lead.pax_count}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '4px' }}>DATES</div>
              <div style={{ fontSize: '14px' }}>{lead.start_date} to {lead.end_date}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['services', 'itinerary', 'quotations', 'payments'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: 'transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: activeTab === tab ? '600' : '400',
                padding: '8px 0',
                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowAddService(!showAddService)}
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add Service
          </button>
          
          {showAddService && (
            <div className="glass-panel" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '220px', zIndex: 10, padding: '8px' }}>
              <button onClick={() => handleAddService('flight')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'transparent', color: 'var(--text-primary)', textAlign: 'left', borderRadius: '6px' }} className="menu-item">
                <Plane size={18} /> Flight
              </button>
              <button onClick={() => handleAddService('accommodation')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'transparent', color: 'var(--text-primary)', textAlign: 'left', borderRadius: '6px' }} className="menu-item">
                <Hotel size={18} /> Accommodation
              </button>
            </div>
          )}
        </div>
      </div>

      {activeTab === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {serviceForm === 'flight' && <FlightForm leadId={lead.id} metadata={metadata} onCancel={() => setServiceForm(null)} onSuccess={() => { setServiceForm(null); fetchLead(); }} />}
          {serviceForm === 'accommodation' && <AccommodationForm leadId={lead.id} metadata={metadata} onCancel={() => setServiceForm(null)} onSuccess={() => { setServiceForm(null); fetchLead(); }} />}

          {lead.flights.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Flights ({lead.flights.length})</h3>
              {lead.flights.map(flight => <FlightCard key={flight.id} flight={flight} refresh={fetchLead} showSelection={false} />)}
            </div>
          )}

          {lead.accommodations.length > 0 && (
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Accommodations ({lead.accommodations.length})</h3>
              {lead.accommodations.map(acc => <AccommodationCard key={acc.id} accommodation={acc} refresh={fetchLead} showSelection={false} />)}
            </div>
          )}
        </div>
      )}

      {activeTab === 'itinerary' && <ItineraryTab lead={lead} refresh={fetchLead} />}
      {activeTab === 'quotations' && <QuotationsTab lead={lead} />}
      {activeTab === 'payments' && <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Payment history coming soon...</div>}
    </div>
  );
};

export default LeadDetailPage;
