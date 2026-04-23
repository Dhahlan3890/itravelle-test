import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ChevronDown, ChevronRight, Briefcase } from 'lucide-react';

const Sidebar = () => {
  const [operationsOpen, setOperationsOpen] = useState(true);

  return (
    <div className="sidebar" style={{
      width: '260px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div className="logo" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--accent-primary)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--bg-primary)',
          fontWeight: 'bold'
        }}>T</div>
        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>ITRAVELLE</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <button 
            onClick={() => setOperationsOpen(!operationsOpen)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Briefcase size={20} />
              <span>Operations</span>
            </div>
            {operationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {operationsOpen && (
            <div style={{ paddingLeft: '32px', marginTop: '4px' }}>
              <NavLink 
                to="/leads" 
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
                })}
              >
                Leads
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px'
          }}>SA</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>Super Admin</div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Luxury Explorers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
