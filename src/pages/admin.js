import React, { useState, useEffect } from 'react';

function Admin() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN;

  useEffect(() => {
    const checkAuth = async () => {
      const phoneNumber = localStorage.getItem('phoneNumber');

      if (!phoneNumber) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await fetch('/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });

        const data = await res.json();
        if (res.ok && data.user?.role === 'admin') {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }

      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'admin') {
      setMessage('❌ Unauthorized: Admin access only');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({ targetPhone, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(`❌ Error: ${data.error}`);
      } else {
        setMessage(`✅ Success: Password updated`);
        setTargetPhone('');
        setNewPassword('');
      }
    } catch (err) {
      setMessage(`❌ Network error: ${err.message}`);
    }

    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    background: '#2a2a2a',
    border: '1px solid hotpink',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '15px',
    boxSizing: 'border-box'
  };

  if (checkingAuth) {
    return React.createElement('div', {
      style: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, 'Checking auth...');
  }

  if (!user) {
    return React.createElement('div', {
      style: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }
    },
      React.createElement('h2', { style: { color: 'hotpink' } }, 'Unauthorized'),
      React.createElement('p', null, 'You need to log in as admin to access this page.')
    );
  }

  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }
  },
    React.createElement('form', {
      onSubmit: handleResetPassword,
      style: {
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid hotpink'
      }
    },
      React.createElement('h2', { 
        style: { textAlign: 'center', marginBottom: '20px', color: 'hotpink' } 
      }, `Admin Panel - ${user.phoneNumber || user.phone}`),
      
      React.createElement('label', { 
        style: { display: 'block', marginBottom: '5px', fontSize: '14px', color: 'hotpink' } 
      }, 'User Phone to Reset'),
      
      React.createElement('input', {
        type: 'text',
        value: targetPhone,
        onChange: (e) => setTargetPhone(e.target.value),
        placeholder: '0753520252',
        required: true,
        style: inputStyle
      }),

      React.createElement('label', { 
        style: { display: 'block', marginBottom: '5px', fontSize: '14px', color: 'hotpink' } 
      }, 'New Password'),
      
      React.createElement('input', {
        type: 'text',
        value: newPassword,
        onChange: (e) => setNewPassword(e.target.value),
        placeholder: 'newpassword123',
        required: true,
        style: inputStyle
      }),

      React.createElement('button', {
        type: 'submit',
        disabled: loading,
        style: {
          width: '100%',
          padding: '12px',
          background: loading ? '#33001a' : 'black',
          color: 'hotpink',
          border: '2px solid hotpink',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginTop: '10px'
        }
      }, loading ? 'Updating...' : 'Update Password'),

      message && React.createElement('div', {
        style: {
          marginTop: '15px',
          padding: '10px',
          background: message.includes('✅') ? '#1e4620' : '#4a1e1e',
          borderRadius: '6px',
          fontSize: '14px',
          wordBreak: 'break-word'
        }
      }, message)
    )
  );
}

export default Admin;