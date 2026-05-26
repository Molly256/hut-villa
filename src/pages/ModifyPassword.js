import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

export default function ModifyPassword() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const handleSubmit = async () => {
    if (!oldPass ||!newPass ||!repeatPass) {
      alert("Fill all fields");
      return;
    }
    if (newPass!== repeatPass) {
      alert("Passwords don't match");
      return;
    }
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/modify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.phone || user.phoneNumber,
          oldPassword: oldPass,
          newPassword: newPass
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Password update failed');
        return;
      }

      alert("Password updated successfully");
      navigate("/settings");
    } catch (err) {
      alert("Network error. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return React.createElement('div', {
    style: { background: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px' }
  },
    React.createElement('button', {
      onClick: () => navigate(-1),
      style: { background: 'none', border: 'none', color: 'white', fontSize: '20px', marginBottom: '20px', cursor: 'pointer' }
    }, '← Back'),
    React.createElement('h3', {
      style: { textAlign: 'center', marginBottom: '30px' }
    }, 'Modify Password'),
    React.createElement('input', {
      type: 'password',
      placeholder: 'Old password',
      value: oldPass,
      onChange: e => setOldPass(e.target.value),
      style: styles.input
    }),
    React.createElement('input', {
      type: 'password',
      placeholder: 'New password',
      value: newPass,
      onChange: e => setNewPass(e.target.value),
      style: styles.input
    }),
    React.createElement('input', {
      type: 'password',
      placeholder: 'Repeat new password',
      value: repeatPass,
      onChange: e => setRepeatPass(e.target.value),
      style: styles.input
    }),
    React.createElement('button', {
      onClick: handleSubmit,
      disabled: loading,
      style: {...styles.button, background: loading? '#555' : '#ff6b35' }
    }, loading? 'Saving...' : 'Save')
  );
}

const styles = {
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#2a2a2a',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '15px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginTop: '20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};