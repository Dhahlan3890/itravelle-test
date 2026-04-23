import React, { useState } from 'react';
import axios from 'axios';
import { Plane, Hotel, Sparkles, Globe, Pencil, ChevronDown, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const ManualQuoteForm = ({ serviceId, serviceType, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    source: 'Manual',
    provider: '',
    price: '',
    currency: 'USD',
    details: '',
    [serviceType === 'flight' ? 'flight_service' : 'accommodation_service']: serviceId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/quotes/`, formData);
      onSuccess();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', marginTop: '12px', border: '1px dashed var(--text-tertiary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px' }}>Manual Aviation Quote</h4>
        <button onClick={onCancel} style={{ color: 'var(--text-tertiary)', backgroundColor: 'transparent' }}><X size={16} /></button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
        <input required placeholder="Airline / Provider Name" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
        <input required type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}>
          <option>USD</option>
          <option>AED</option>
          <option>LKR</option>
        </select>
        <textarea 
          style={{ gridColumn: 'span 3' }} 
          placeholder="Additional Details (Flight times, notes...)" 
          value={formData.details} 
          onChange={e => setFormData({...formData, details: e.target.value})}
        />
        <button type="submit" style={{ gridColumn: 'span 3', padding: '10px', borderRadius: '6px', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Save size={16} /> Save Manual Quote
        </button>
      </form>
    </div>
  );
};

export const FlightCard = ({ flight, refresh, showSelection = false }) => {
  const [showQuotes, setShowQuotes] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const generateQuotes = async (type) => {
    setLoadingQuotes(true);
    try {
      const endpoint = type === 'AI' ? 'generate_ai_quotes' : 'generate_direct_quotes';
      await axios.post(`${API_BASE}/flights/${flight.id}/${endpoint}/`);
      refresh();
      setShowQuotes(true);
    } catch (err) { console.error(err); }
    finally { setLoadingQuotes(false); }
  };

  const selectQuote = async (quoteId) => {
    try {
      await axios.post(`${API_BASE}/quotes/${quoteId}/select_quote/`);
      refresh();
    } catch (err) { console.error(err); }
  };

  const selectedQuote = flight.quotes.find(q => q.is_selected);

  return (
    <div className="glass-panel" style={{ marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)' }}><Plane size={20} /></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{flight.origin} → {flight.destination}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{flight.departure_date}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>PAX</div>
            <div style={{ fontSize: '14px' }}>{flight.adults}a, {flight.children}c</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {selectedQuote ? (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>SELECTED ({selectedQuote.provider})</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>{selectedQuote.currency} {selectedQuote.price}</div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No quote selected</div>
          )}
          <button onClick={() => setShowQuotes(!showQuotes)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showQuotes ? 'Hide Quotes' : 'View Quotes'} <ChevronDown size={16} style={{ transform: showQuotes ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {showQuotes && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {!showSelection && (
            <div style={{ display: 'flex', gap: '12px', padding: '16px 0' }}>
              <button onClick={() => generateQuotes('AI')} disabled={loadingQuotes} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-primary)" /> AI Agentic Bot
              </button>
              <button onClick={() => generateQuotes('Direct')} disabled={loadingQuotes} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Globe size={16} color="#3b82f6" /> Airline Direct
              </button>
              <button onClick={() => setShowManualForm(!showManualForm)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--text-secondary)" /> Aviation Manual
              </button>
            </div>
          )}

          {showManualForm && <ManualQuoteForm serviceId={flight.id} serviceType="flight" onCancel={() => setShowManualForm(false)} onSuccess={() => { refresh(); setShowManualForm(false); }} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {flight.quotes.map(quote => (
              <div key={quote.id} style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: quote.is_selected ? '1px solid var(--success)' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{quote.provider}</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{quote.source}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{quote.details}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{quote.currency} {quote.price}</div>
                  {showSelection && (
                    <button onClick={() => selectQuote(quote.id)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: quote.is_selected ? 'var(--success)' : 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: '12px' }}>
                      {quote.is_selected ? 'Selected' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const AccommodationCard = ({ accommodation, refresh, showSelection = false }) => {
  const [showQuotes, setShowQuotes] = useState(false);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const generateQuotes = async (type) => {
    setLoadingQuotes(true);
    try {
      const endpoint = type === 'AI' ? 'generate_ai_quotes' : 'generate_direct_quotes';
      await axios.post(`${API_BASE}/accommodations/${accommodation.id}/${endpoint}/`);
      refresh();
      setShowQuotes(true);
    } catch (err) { console.error(err); }
    finally { setLoadingQuotes(false); }
  };

  const selectQuote = async (quoteId) => {
    try {
      await axios.post(`${API_BASE}/quotes/${quoteId}/select_quote/`);
      refresh();
    } catch (err) { console.error(err); }
  };

  const selectedQuote = accommodation.quotes.find(q => q.is_selected);

  return (
    <div className="glass-panel" style={{ marginBottom: '16px', overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Hotel size={20} /></div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{accommodation.hotel_name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{accommodation.city}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>STAY</div>
            <div style={{ fontSize: '14px' }}>{accommodation.check_in} → {accommodation.check_out}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {selectedQuote ? (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>SELECTED ({selectedQuote.provider})</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>{selectedQuote.currency} {selectedQuote.price}</div>
            </div>
          ) : (
            <div style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>No quote selected</div>
          )}
          <button onClick={() => setShowQuotes(!showQuotes)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showQuotes ? 'Hide Quotes' : 'View Quotes'} <ChevronDown size={16} style={{ transform: showQuotes ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>
      </div>

      {showQuotes && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {!showSelection && (
            <div style={{ display: 'flex', gap: '12px', padding: '16px 0' }}>
              <button onClick={() => generateQuotes('AI')} disabled={loadingQuotes} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-primary)" /> Agentic Quote
              </button>
              <button onClick={() => generateQuotes('Direct')} disabled={loadingQuotes} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Globe size={16} color="#3b82f6" /> Direct (TBO)
              </button>
              <button onClick={() => setShowManualForm(!showManualForm)} style={{ flex: 1, padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Pencil size={16} color="var(--text-secondary)" /> Aviation Manual
              </button>
            </div>
          )}

          {showManualForm && <ManualQuoteForm serviceId={accommodation.id} serviceType="accommodation" onCancel={() => setShowManualForm(false)} onSuccess={() => { refresh(); setShowManualForm(false); }} />}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {accommodation.quotes.map(quote => (
              <div key={quote.id} style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', border: quote.is_selected ? '1px solid var(--success)' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{quote.provider}</span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>{quote.source}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{quote.details}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{quote.currency} {quote.price}</div>
                  {showSelection && (
                    <button onClick={() => selectQuote(quote.id)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: quote.is_selected ? 'var(--success)' : 'var(--accent-primary)', color: 'var(--bg-primary)', fontWeight: 'bold', fontSize: '12px' }}>
                      {quote.is_selected ? 'Selected' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
