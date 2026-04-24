import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, onSearch, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Handle async search
  useEffect(() => {
    if (onSearch && searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        onSearch(searchTerm);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, onSearch]);

  const filteredOptions = onSearch ? options : options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    opt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.code === value);

  return (
    <div ref={wrapperRef} style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', width: '100%' }}>
      {label && <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-tertiary)'
        }}
      >
        <span>{selectedOption ? `${selectedOption.name} (${selectedOption.code})` : placeholder}</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 100,
          maxHeight: '200px',
          overflowY: 'auto',
          padding: '8px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 8px 8px 32px', fontSize: '13px' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.code}
                  onClick={() => {
                    onChange(opt.code);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    backgroundColor: value === opt.code ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                    color: value === opt.code ? 'var(--accent-primary)' : 'var(--text-primary)',
                    transition: 'background 0.2s'
                  }}
                  className="dropdown-item"
                >
                  {opt.name} <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>({opt.code})</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '8px', color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center' }}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
