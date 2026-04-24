import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Briefcase, Mail, Phone, Globe, List, Users } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const ClientDrawer = ({ client, isOpen, onClose }) => {
  const [leads, setLeads] = useState([]);
  const [children, setChildren] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      fetchClientLeads();
      fetchClientChildren();
    }
  }, [isOpen, client]);

  const fetchClientLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await axios.get(`${API_BASE}/clients/${client.id}/leads/`);
      setLeads(res.data);
    } catch (err) {
      console.error("Error fetching client leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchClientChildren = async () => {
    setLoadingChildren(true);
    try {
      const res = await axios.get(`${API_BASE}/clients/${client.id}/children/`);
      setChildren(res.data);
    } catch (err) {
      console.error("Error fetching client children:", err);
    } finally {
      setLoadingChildren(false);
    }
  };

  if (!client) return null;

  const groupedChildren = {
    'Client': children.filter(c => c.role === 'Client'),
    'Sub-client': children.filter(c => c.role === 'Sub-client'),
    'Requester': children.filter(c => c.role === 'Requester'),
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: isOpen ? 0 : '-500px',
      width: '500px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
      transition: 'right 0.3s ease',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Client Details</h2>
        <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}><X size={24} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--bg-tertiary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '2px solid var(--accent-primary)'
          }}>
            <User size={40} color="var(--accent-primary)" />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>{client.name}</h3>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '100px', 
            backgroundColor: 'rgba(245, 158, 11, 0.1)', 
            color: 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: '600'
          }}>{client.role}</span>
        </div>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
          <DetailItem icon={<Mail size={18} />} label="Email" value={client.email} />
          <DetailItem icon={<Phone size={18} />} label="Phone" value={client.phone} />
          <DetailItem icon={<Globe size={18} />} label="Currency" value={client.currency} />
          
          {/* Hierarchy Info */}
          {client.role !== 'Agent' && <DetailItem icon={<Briefcase size={18} />} label="Linked Agent" value={client.agent_name} />}
          {['Sub-client', 'Requester'].includes(client.role) && client.parent_client_name && (
            <DetailItem icon={<User size={18} />} label="Linked Client" value={client.parent_client_name} />
          )}
          {client.role === 'Requester' && client.sub_client_parent_name && (
            <DetailItem icon={<User size={18} />} label="Linked Sub-Client" value={client.sub_client_parent_name} />
          )}
        </div>

        {/* Children Lists */}
        {['Agent', 'Client', 'Sub-client'].includes(client.role) && (
          <div style={{ marginBottom: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} /> Managed Hierarchy
            </h4>
            
            {loadingChildren ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading hierarchy...</p>
            ) : children.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No linked clients or sub-clients.</p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {groupedChildren['Client'].length > 0 && (
                  <ChildGroup title="Clients" list={groupedChildren['Client']} />
                )}
                {groupedChildren['Sub-client'].length > 0 && (
                  <ChildGroup title="Sub-clients" list={groupedChildren['Sub-client']} />
                )}
                {groupedChildren['Requester'].length > 0 && (
                  <ChildGroup title="Requesters" list={groupedChildren['Requester']} />
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} /> Related Leads
          </h4>
          {loadingLeads ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Loading leads...</p>
          ) : leads.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>No leads associated with this client.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {leads.map(lead => (
                <div key={lead.id} className="glass-panel" style={{ padding: '12px', fontSize: '14px' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{lead.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <span>{lead.status}</span>
                    <span>{lead.created_at.split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChildGroup = ({ title, list }) => (
  <div>
    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
      {title} ({list.length})
    </div>
    <div style={{ display: 'grid', gap: '8px' }}>
      {list.map(c => (
        <div key={c.id} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '14px', border: '1px solid var(--border-color)' }}>
          {c.name}
        </div>
      ))}
    </div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--text-tertiary)' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '15px' }}>{value || '-'}</div>
    </div>
  </div>
);

export default ClientDrawer;
