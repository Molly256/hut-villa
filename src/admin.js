import React, { useState } from 'react';

function Admin() {
  const [adminPhone, setAdminPhone] = useState('256753520252');
  const [adminPass, setAdminPass] = useState('admin256$');
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://hut-villa.vercel.app';

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: adminPhone,
          password: adminPass,
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
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Panel</h2>
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Admin Phone</label>
        <input
          type="text"
          value={adminPhone}
          onChange={(e) => setAdminPhone(e.target.value)}
          required
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Admin Password</label>
        <input
          type="password"
          value={adminPass}
          onChange={(e) => setAdminPass(e.target.value)}
          required
          style={inputStyle}
        />

        <hr style={{ margin: '20px 0', borderColor: '#333' }} />

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>User Phone to Reset</label>
        <input
          type="text"
          value={targetPhone}
          onChange={(e) => setTargetPhone(e.target.value)}
          placeholder="2567XXXXXXXX"
          required
          style={inputStyle}
        />

        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>New Password</label>
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
            background: loading ? '#555' : '#4CAF50',
            color: '#fff',
            border: 'none',
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
  border: '1px solid #444',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '15px',
  boxSizing: 'border-box'
};

export default Admin;