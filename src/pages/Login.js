import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // adjust path to your client

function Login({ onLogin }) {
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Query Supabase directly. Adjust table/column names to match yours
      const { data, error } = await supabase
        .from('users') // your table name
        .select('*')
        .eq('phone', phone)
        .eq('password', password) // better to use hashed passwords + auth
        .single();

      if (error || !data) {
        alert(error?.message || 'No account found');
        setLoading(false);
        return;
      }

      const userData = {
        phoneNumber: data.phone,
        phone: data.phone,
        role: data.role,
        balance: data.balance,
        nickname: data.nickname,
        avatar: data.avatar
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
      
      <button onClick={handleLogin} style={styles.button} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
}

const styles = {
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #333', fontSize: '14px', background: '#1a1a1a', color: '#fff', outline: 'none' },
  button: { width: '100%', padding: '12px', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }
};

export default Login;