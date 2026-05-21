import React, { useState } from 'react';

function Admin() {
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://hut-villa-site-backend.onrender.com';

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetPhone: targetPhone,
          newPassword: newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Success: ${data.message}`);
        setTargetPhone('');
        setNewPassword('');
      } else {
        setMessage(`❌ Error: ${data.error || data.message}`);
      }
    } catch (err) {
      setMessage(`❌ Network error: ${err.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <form onSubmit={handleResetPassword} style={{
        background: '#1a1a1a',
        padding: '30px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid hotpink'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'hotpink' }}>Admin Panel</h2>
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'hotpink' }}>User Phone to Reset</label>
        <input
          type="text"
          value={targetPhone}
          onChange={(e) => setTargetPhone(e.target.value)}
          placeholder="2567XXXXXXXX"
          required
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'hotpink' }}>New Password</label>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="newpassword123"
          required
          style={inputStyle}
        />

        <button 
          type="submit" 
          disabled={loading}
          style={{
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
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: message.includes('✅') ? '#1e4620' : '#4a1e1e',
            borderRadius: '6px',
            fontSize: '14px',
            wordBreak: 'break-word'
          }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

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

export default Admin;