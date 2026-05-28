import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const handleConfirm = async () => {
    const amt = Number(amount);

    if (!amt || amt < 10000) {
      alert('Minimum deposit is 10,000 UGX');
      return;
    }
    if (!method) {
      alert('Select a payment method');
      return;
    }
    if (!user) {
      alert('User not found. Login again');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          phoneNumber: user.phone || user.phoneNumber,
          amount: amt,
          method: method
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Deposit failed');
        return;
      }

      alert('Deposit submitted for review. It will be confirmed within a few minutes.');
      navigate('/dashboard');
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return React.createElement('div', { style: { padding: '20px', minHeight: '100vh', background: '#f5f5f5' } },
    React.createElement('button', {
      onClick: () => navigate('/dashboard'),
      style: { marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }
    }, '← Back'),
    React.createElement('h2', { style: { textAlign: 'center', marginBottom: '20px' } }, 'Deposit'),
    React.createElement('p', { style: { textAlign: 'center', color: '#666', marginBottom: '20px' } },
      'Minimum deposit is 10,000 UGX'
    ),
    React.createElement('input', {
      type: 'number',
      placeholder: 'Input amount.......',
      value: amount,
      onChange: (e) => setAmount(e.target.value),
      style: styles.input
    }),
    React.createElement('h3', { style: { marginTop: '20px', marginBottom: '10px' } }, 'Select method:'),
    React.createElement('div', {
      style: {...styles.method, border: method === 'MTN'? '2px solid #ff6b35' : '1px solid #ddd' },
      onClick: () => setMethod('MTN')
    },
      React.createElement('div', { style: { fontWeight: '600' } }, 'MTN Mobile Money'),
      React.createElement('div', null, '0773242118'),
      React.createElement('div', null, 'Besigye Benard')
    ),
    React.createElement('div', {
      style: {...styles.method, border: method === 'Airtel'? '2px solid #ff6b35' : '1px solid #ddd' },
      onClick: () => setMethod('Airtel')
    },
      React.createElement('div', { style: { fontWeight: '600' } }, 'Airtel Mobile Money'),
      React.createElement('div', null, '0753520252'),
      React.createElement('div', null, 'Nakiyngi Maureen')
    ),
    React.createElement('button', {
      onClick: handleConfirm,
      disabled: loading,
      style: {...styles.button, background: loading? '#ccc' : '#28a745' }
    }, loading? 'Submitting...' : 'I have sent the money')
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