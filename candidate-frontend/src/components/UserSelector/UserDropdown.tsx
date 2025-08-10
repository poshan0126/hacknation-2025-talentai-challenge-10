import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

const UserDropdown: React.FC = () => {
  const { currentUser, allUsers, setCurrentUser, isLoading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        border: '1px solid #d1d5db'
      }}>
        <div style={{ fontSize: '1rem' }}>👤</div>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading...</span>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'all 0.2s ease',
          minWidth: '200px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb';
          e.currentTarget.style.borderColor = '#9ca3af';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'white';
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
      >
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
            {currentUser.user_id}
          </span>
        </div>
        
        <div style={{
          fontSize: '0.75rem',
          color: '#9ca3af',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </div>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
          zIndex: 50,
          minWidth: '250px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Switch User
            </p>
          </div>
          
          {allUsers.map((user) => (
            <button
              key={user.user_id}
              onClick={() => {
                setCurrentUser(user);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: user.user_id === currentUser.user_id ? '#f0f9ff' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
                borderRadius: 0
              }}
              onMouseEnter={(e) => {
                if (user.user_id !== currentUser.user_id) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (user.user_id !== currentUser.user_id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: user.user_id === currentUser.user_id ? '600' : '500', 
                  color: user.user_id === currentUser.user_id ? '#0c4a6e' : '#1f2937' 
                }}>
                  {user.user_id}
                </span>
              </div>
              
              {user.user_id === currentUser.user_id && (
                <div style={{ fontSize: '0.875rem', color: '#0ea5e9' }}>✓</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;