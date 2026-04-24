import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, MoreVertical, Eye, User, Briefcase, Users, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientDrawer from '../components/ClientDrawer';

const API_BASE = 'http://localhost:8000/api';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [subParentFilter, setSubParentFilter] = useState('');
  
  const [agentOptions, setAgentOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [subClientOptions, setSubClientOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [search, roleFilter, agentFilter, parentFilter, subParentFilter]);

  useEffect(() => {
    fetchFilterOptions();
  }, [agentFilter, parentFilter]);

  const fetchClients = async () => {
    try {
      const url = `${API_BASE}/clients/?search=${search}&role=${roleFilter}&agent_id=${agentFilter}&parent_id=${parentFilter}&sub_parent_id=${subParentFilter}`;
      const res = await axios.get(url);
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch Agents
      const agentRes = await axios.get(`${API_BASE}/clients/?role=Agent`);
      setAgentOptions(agentRes.data);

      // Fetch Clients for selected Agent
      if (agentFilter) {
        const clientRes = await axios.get(`${API_BASE}/clients/?role=Client&agent_id=${agentFilter}`);
        setClientOptions(clientRes.data);
      } else {
        setClientOptions([]);
      }

      // Fetch Sub-clients for selected Client
      if (parentFilter) {
        const subRes = await axios.get(`${API_BASE}/clients/?role=Sub-client&parent_id=${parentFilter}`);
        setSubClientOptions(subRes.data);
      } else {
        setSubClientOptions([]);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Agent': return <Briefcase size={16} className="text-accent" />;
      case 'Client': return <Users size={16} />;
      case 'Sub-client': return <Users size={16} style={{ opacity: 0.7 }} />;
      case 'Requester': return <UserCircle size={16} />;
      default: return <User size={16} />;
    }
  };

  const openClient = (client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Client</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your clients here.</p>
        </div>
        <Link 
          to="/clients/new" 
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
          New Client
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '40px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
            <Filter size={18} style={{ color: 'var(--text-tertiary)' }} />
            <select 
              value={roleFilter} 
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setAgentFilter('');
                setParentFilter('');
                setSubParentFilter('');
              }}
              style={{ flex: 1 }}
            >
              <option value="">All Roles</option>
              <option value="Agent">Agent</option>
              <option value="Client">Client</option>
              <option value="Sub-client">Sub-client</option>
              <option value="Requester">Requester</option>
              <option value="Direct Requester">Direct Requester</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
            <Briefcase size={18} style={{ color: 'var(--text-tertiary)' }} />
            <select 
              value={agentFilter} 
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setParentFilter('');
                setSubParentFilter('');
              }}
              style={{ flex: 1 }}
            >
              <option value="">All Agents</option>
              {agentOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {(agentFilter || roleFilter === 'Client' || roleFilter === 'Sub-client' || roleFilter === 'Requester') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
              <User size={18} style={{ color: 'var(--text-tertiary)' }} />
              <select 
                value={parentFilter} 
                onChange={(e) => {
                  setParentFilter(e.target.value);
                  setSubParentFilter('');
                }}
                style={{ flex: 1 }}
              >
                <option value="">All Clients</option>
                {clientOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {(parentFilter || roleFilter === 'Sub-client' || roleFilter === 'Requester') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
              <Users size={18} style={{ color: 'var(--text-tertiary)' }} />
              <select 
                value={subParentFilter} 
                onChange={(e) => setSubParentFilter(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">All Sub-clients</option>
                {subClientOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-tertiary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <th style={{ padding: '12px 16px' }}>Client ID</th>
              <th style={{ padding: '12px 16px' }}>Client Name</th>
              <th style={{ padding: '12px 16px' }}>Role</th>
              <th style={{ padding: '12px 16px' }}>Hierarchy / Links</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              <th style={{ padding: '12px 16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No clients found.</td></tr>
            ) : (
              clients.map(client => (
                <tr 
                  key={client.id} 
                  style={{ borderBottom: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer' }} 
                  className="table-row"
                  onClick={() => openClient(client)}
                >
                  <td style={{ padding: '16px' }}>#{client.id}</td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{client.name}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getRoleIcon(client.role)}
                      {client.role}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {client.role === 'Agent' ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {client.client_count} Cl | {client.sub_client_count} Sub | {client.requester_count} Req
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {client.agent_name && `Agent: ${client.agent_name}`}
                        {client.parent_client_name && ` > ${client.parent_client_name}`}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>{client.email || '-'}</td>
                  <td style={{ padding: '16px' }}>{client.phone || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openClient(client); }}
                      style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'transparent' }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ClientDrawer 
        client={selectedClient} 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </div>
  );
};

export default ClientsPage;
