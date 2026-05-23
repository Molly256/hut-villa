import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://hut-villa-site-backend.onrender.com';

function Login({ onLogin }) {
  const [phone, setPhone] = useState(''); // now 10 digits starting with 07
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }
    if (!/^07\d{8}$/.test(phone)) {
      alert('Phone must be 10 digits starting with 07. Example: 0752123456');
      return;
    }

    setLoading(true);
    try {
      // No more 256 prefix. Send phone as-is
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
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      
      <div style={styles.phoneWrapper}>
        <span style={styles.prefix}>07</span>
        <input
          type="tel"
          placeholder="52123456"
          value={phone.slice(2)} // show only last 8 digits
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
            setPhone('07' + digits);
          }}
          style={styles.phoneInput}
          inputMode="numeric"
          maxLength={8}
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