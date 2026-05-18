import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModifyPassword({ user, setUser }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [repeatPass, setRepeatPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!oldPass || !newPass || !repeatPass) {
      alert("Fill all fields");
      return;
    }
    if (oldPass !== user.password) {
      alert("Old password incorrect");
      return;
    }
    if (newPass !== repeatPass) {
      alert("Passwords don't match");
      return;
    }
    if (newPass.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    const updatedUser = { ...user, password: newPass };
    setUser(updatedUser);
    localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
    
    alert("Password updated successfully");
    navigate("/settings");
  };

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: 'white', padding: '20px' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', marginBottom: '20px', cursor: 'pointer' }}
      >
        ← Back
      </button>
      
      <h3 style={{ textAlign: 'center', marginBottom: '30px' }}>Modify Password</h3>
      
      <input 
        type="password" 
        placeholder="Old password" 
        value={oldPass} 
        onChange={e => setOldPass(e.target.value)} 
        style={styles.input} 
      />
      
      <input 
        type="password" 
        placeholder="New password" 
        value={newPass} 
        onChange={e => setNewPass(e.target.value)} 
        style={styles.input} 
      />
      
      <input 
        type="password" 
        placeholder="Repeat new password" 
        value={repeatPass} 
        onChange={e => setRepeatPass(e.target.value)} 
        style={styles.input} 
      />
      
      <button onClick={handleSubmit} style={styles.button}>
        Save
      </button>
    </div>
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
    background: '#ff6b35',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    marginTop: '20px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};