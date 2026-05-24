import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api'; // change to your backend URL if separate

function Withdrawal() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) navigate('/login');
  }, [navigate]);

  const handleWithdraw = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10000) {
      alert('Minimum withdraw is 10,000 UGX');
      return;
    }
    if (!method) {
      alert('Select a method');
      return;
    }
    if (!number ||!name) {
      alert('Enter number and name');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('hutvilla_user'));

      const res = await fetch(`${API_URL}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.phone,
          amount: amt,
          method,
          accountNumber: number,
          accountName: name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Withdraw failed');
        setLoading(false);
        return;
      }

      alert('Withdraw request submitted');
      navigate('/dashboard');
    } catch (err) {
      alert('Network error. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{ marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Withdraw</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Minimum withdraw: 10,000 UGX
      </p>

      <input
        type="number"
        placeholder="Input amount......"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={styles.input}
      />

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Select method:</h3>

      <div
        style={{...styles.method, border: method === 'MTN'? '2px solid #ff6b35' : '1px solid #ddd' }}
        onClick={() => setMethod('MTN')}
      >
        <div>MTN Mobile Money</div>
      </div>

      <div
        style={{...styles.method, border: method === 'Airtel'? '2px solid #ff6b35' : '1px solid #ddd' }}
        onClick={() => setMethod('Airtel')}
      >
        <div>Airtel Mobile Money</div>
      </div>

      <input
        type="tel"
        placeholder="Input number...."
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        style={styles.input}
      />

      <input
        type="text"
        placeholder="Input names it brings........"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleWithdraw} disabled={loading} style={styles.button}>
        {loading? 'Processing...' : 'Tap withdraw button'}
      </button>

      <div style={styles.note}>
        <strong>Note:</strong><br />
        Minimum withdraw: 10,000 UGX.<br />
        Withdraw time: 9:00am - 5:00pm<br />
        Monday - Friday.<br />
        Money will arrive in your mobile money wallet within 30mins to 24hrs max.
      </div>
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
    cursor: 'pointer',
    textAlign: 'center'
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
    marginTop: '15px'
  },
  note: {
    marginTop: '20px',
    padding: '12px',
    background: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#856404',
    lineHeight: '1.5'
  }
};

export default Withdrawal;
