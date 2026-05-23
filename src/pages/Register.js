import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // update path to your client

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
      // Check if phone already exists
      const { data: existing } = await supabase
        .from('users') // change to your table name
        .select('phone')
        .eq('phone', phone)
        .single();

      if (existing) {
        alert('Phone number already registered');
        setLoading(false);
        return;
      }

      // Insert new user
      const { data, error } = await supabase
        .from('users') // change to your table name
        .insert([{ phone: phone, password: password }]) // hash passwords in prod
        .select()
        .single();

      if (error) {
        alert(error.message || 'Registration failed');
        setLoading(false);
        return;
      }

      const userData = {
        phoneNumber: data.phone,
        phone: data.phone,
        role: data.role || 'user',
        balance: data.balance || 0,
        nickname: data.nickname || 'User',
        avatar: data.avatar || ''
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

  return (
    <div style={{ padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
      
      <input
        type="tel"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      
      <input
        type="password"
        placeholder="Repeat password"
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
        style={styles.input}
      />
      
      <button onClick={handleRegister} style={styles.button} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
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