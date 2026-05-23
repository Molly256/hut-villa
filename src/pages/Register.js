import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://hut-villa-site-backend.vercel.app';

function Register({ onRegister }) {
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!phone || !password || !repeatPassword) {
      alert('Please fill all fields');
      return;
    }
    if (password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      const userData = {
        phoneNumber: data.user.phoneNumber,
        phone: data.user.phoneNumber,
        role: data.user.role || 'user',
        balance: data.user.balance || 0,
        nickname: data.user.nickname || 'User',
        avatar: data.user.avatar || ''
      };
      
      localStorage.setItem('hutvilla_user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      onRegister(userData);
      alert('Registered successfully!');
      navigate('/dashboard');
      
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return React.createElement('div', 
    { style: { padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' } },
    React.createElement('h2', { style: { textAlign: 'center', marginBottom: '20px' } }, 'Register'),
    
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
      onChange: (e) => setPassword(e.target.value),
      style: styles.input
    }),
    
    React.createElement('input', {
      type: 'password',
      placeholder: 'Repeat password',
      value: repeatPassword,
      onChange: (e) => setRepeatPassword(e.target.value),
      style: styles.input
    }),
    
    React.createElement('button', 
      { onClick: handleRegister, style: styles.button, disabled: loading },
      loading ? 'Registering...' : 'Register'
    ),

    React.createElement('p', 
      { style: { textAlign: 'center', marginTop: '20px', color: '#aaa' } },
      'Already have an account? ',
      React.createElement('span', 
        { 
          onClick: () => navigate('/login'), 
          style: { color: '#ff6b35', cursor: 'pointer', textDecoration: 'underline' }
        },
        'Login'
      )
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
    background: '#ff6b35', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '16px', 
    fontWeight: '600', 
    cursor: 'pointer' 
  }
};

export default Register;