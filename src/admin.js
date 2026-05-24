import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Admin() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setCheckingAuth(false);
        return;
      }

      const { data: userData, error } = await supabase
       .from('users')
       .select('*')
       .eq('id', authUser.id)
       .single();

      if (error || !userData || userData.role!== 'admin') {
        setUser(null);
      } else {
        setUser(userData);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!user || user.role!== 'admin') {
      setMessage('❌ Unauthorized: Admin access only');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { targetPhone, newPassword }
      });

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
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
      }, `Admin Panel - ${user.phonenumber}`),
      
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