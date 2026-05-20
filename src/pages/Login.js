import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://hut-villa-site-backend.onrender.com';

function Login({ onLogin }) {
  const [phone, setPhone] = useState(''); // 9 digits starting with 7
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }
    if (!/^7\d{8}$/.test(phone)) {
      alert('Phone must be 9 digits starting with 7. Example: 772123456');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save session only
      const userData = { phoneNumber: phone, balance: data.user.balance };
      localStorage.setItem('hutvilla_user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      
      onLogin(userData);
      alert('Login successful!');
      navigate('/dashboard');
      
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      
      <div style={styles.phoneWrapper}>
        <span style={styles.prefix}>+256</span>
        <input
          type="tel"
          placeholder="7XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
          style={styles.phoneInput}
          inputMode="numeric"
          maxLength={9}
        />
      </div>
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      
      <button onClick={handleLogin} style={styles.button} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
        Don’t have an account?{' '}
        <span 
          onClick={() => navigate('/register')} 
          style={{ color: '#ff6b35', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Register
        </span>
      </p>
    </div>
  );
}

const styles = {
  phoneWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
    border: '1px solid #333',
    borderRadius: '8px',
    background: '#1a1a1a',
    overflow: 'hidden'
  },
  prefix: {
    padding: '12px',
    background: '#2a2a2a',
    color: '#fff',
    fontWeight: '600',
    userSelect: 'none'
  },
  phoneInput: {
    flex: 1,
    padding: '12px',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: '14px',
    outline: 'none'
  },
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

export default Login;