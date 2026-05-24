import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

function Deposit() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  const handleSubmit = () => {
    const amt = Number(amount);
    if (!amt || amt < 10000) {
      alert('Minimum deposit is 10,000 UGX');
      return;
    }
    if (!method) {
      alert('Select a payment method');
      return;
    }
    alert('Payment info shown. Tap "I have sent the money" after paying');
  };

  const handleConfirm = async () => {
    if (!amount ||!method) {
      alert('Fill all fields first');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.phone,
          amount: Number(amount),
          method: method,
          status: 'pending'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Deposit failed');
        setLoading(false);
        return;
      }

      alert('Deposit submitted for review');
      navigate('/dashboard');
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Deposit</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Minimum deposit is 10,000 UGX
      </p>

      <input
        type="number"
        placeholder="Input amount......."
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Select method:</h3>

      <div
        style={{...styles.method, border: method === 'mtn'? '2px solid #ff6b35' : '1px solid #ddd' }}
        onClick={() => setMethod('mtn')}
      >
        <div style={{ fontWeight: '600' }}>MTN Mobile Money</div>
        <div>0773242118</div>
        <div>Besigye Benard</div>
      </div>

      <div
        style={{...styles.method, border: method === 'airtel'? '2px solid #ff6b35' : '1px solid #ddd' }}
        onClick={() => setMethod('airtel')}
      >
        <div style={{ fontWeight: '600' }}>Airtel Mobile Money</div>
        <div>0753520252</div>
        <div>Nakiyngi Maureen</div>
      </div>

      <button onClick={handleSubmit} style={styles.button}>
        Go pay and come back tap
      </button>

      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{...styles.button, background: '#28a745', marginTop: '10px' }}
      >
        {loading? 'Submitting...' : 'I have sent the money'}
      </button>
    </div>
  );
}

const styles = {
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  method: {
    padding: '12px',
    marginBottom: '10px',
    background: '#fff',
    borderRadius: '8px',
    cursor: 'pointer'
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
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default Deposit;
