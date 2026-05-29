import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

function Login({ onLogin }) {
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: phone.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const userData = {
        phoneNumber: data.user.phoneNumber,
        phone: data.user.phoneNumber,
        role: data.user.role,
        balance: data.user.balance,
        nickname: data.user.nickname,
        avatar: data.user.avatar
      };
      
      localStorage.setItem('hutvilla_user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      onLogin(userData);
      alert('Login successful!');
      navigate('/dashboard');
      
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { 
    style: { padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' } 
  },
    React.createElement('form', { 
      onSubmit: handleLogin,
      style: { maxWidth: '400px', margin: '0 auto' }
    },
      React.createElement('h2', { 
        style: { textAlign: 'center', marginBottom: '20px' } 
      }, 'Login'),
      React.createElement('input', {
        type: 'tel',
        placeholder: 'Enter phone number',
        value: phone,
        onChange: (e) => setPhone(e.target.value),
        style: styles.input
      }),
      React.createElement('input', {
        type: 'password',
        placeholder: 'Password',
        value: password,
        onChange: (e) => setPassword(e.target.value), // <-- FIXED: was setPhone
        style: styles.input
      }),
      React.createElement('button', {
        type: 'submit',
        style: { ...styles.button, background: loading ? '#555' : '#ff6b35', opacity: loading ? 0.7 : 1 },
        disabled: loading
      }, loading ? 'Logging in...' : 'Login')
    )
  );
}

const styles = {
  input: { 
    width: '100%', 
    padding: '12px', 
    marginBottom: '15px', 
    borderRadius: '8px', 
    border: '1px solid #333', 
    fontSize: '14px', 
    background: '#1a1a1a', 
    color: '#fff', 
    outline: 'none' 
  },
  button: { 
    width: '100%', 
    padding: '12px', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '16px', 
    fontWeight: '600', 
    cursor: 'pointer' 
  }
};

export default Login;