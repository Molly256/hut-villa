import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }

    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      alert('No account found. Please register first.');
      navigate('/register');
      return;
    }

    const userData = JSON.parse(savedUser);
    
    if (userData.phone === phone && userData.password === password) {
      localStorage.setItem('isLoggedIn', 'true');
      onLogin(userData);
      alert('Login successful!');
      navigate('/dashboard');
    } else {
      alert('Invalid phone or password');
    }
  };

  return (
    <div style={{ padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
      
      <input
        type="tel"
        placeholder="Phone number +256........"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="Password........"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      
      <button onClick={handleLogin} style={styles.button}>
        Login
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