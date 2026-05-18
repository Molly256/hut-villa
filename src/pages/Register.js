import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ onRegister }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = () => {
    if (!phone || !password || !repeatPassword) {
      alert('Please fill all fields');
      return;
    }
    if (password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    
    // Check if user already exists
    const existingUser = localStorage.getItem('hutvilla_user');
    if (existingUser) {
      const user = JSON.parse(existingUser);
      if (user.phone === phone) {
        alert('Account with this phone already exists. Please login.');
        navigate('/login');
        return;
      }
    }
    
    // Create user object with password
    const userData = { phone, password, balance: 0 };
    
    // Save to localStorage
    localStorage.setItem('hutvilla_user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    // Tell App.js user is logged in
    onRegister(userData);
    
    alert('Registered successfully!');
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      
      <input
        type="tel"
        placeholder="Phone number +256......."
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="Password......."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="Repeat password......."
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        style={styles.input}
      />
      
      <button onClick={handleRegister} style={styles.button}>
        Register
      </button>

      <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
        Already have an account?{' '}
        <span 
          onClick={() => navigate('/login')} 
          style={{ color: '#ff6b35', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Login
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

export default Register;