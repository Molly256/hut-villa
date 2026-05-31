import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminTransactions() {
  const [tab, setTab] = useState('deposits');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Transactions state
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Password reset state
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_TOKEN = process.env.REACT_APP_ADMIN_TOKEN;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const phoneNumber = localStorage.getItem('phoneNumber');

      if (!phoneNumber) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber })
        });

        const data = await res.json();
        if (res.ok && data.user?.role === 'admin') {
          setUser(data.user);
          fetchPending();
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/dashboard');
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, [navigate]);

  const fetchPending = async () => {
    setLoading(true);
    const [depRes, witRes] = await Promise.all([
      fetch('/api/transactions?action=list-pending-deposits'),
      fetch('/api/transactions?action=list-pending-withdrawals')
    ]);
    const depData = await depRes.json();
    const witData = await witRes.json();
    setDeposits(depData.deposits || []);
    setWithdrawals(witData.withdrawals || []);
    setLoading(false);
  };

  const handleTxnAction = async (type, action, phoneNumber, id) => {
    setLoading(true);
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, phoneNumber, [`${type}Id`]: id })
    });
    const data = await res.json();
    alert(data.message || data.error);
    fetchPending();
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!user || user.role!== 'admin') {
      setMessage('❌ Unauthorized: Admin access only');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      // FIXED: Use /api/transactions with action: 'reset-password' + admin auth
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset-password',
          adminPhone: '0753041411',
          adminPassword: '123456',
          phoneNumber: targetPhone,
          newPassword
        })
      });
      const data = await res.json();
      setMessage(res.ok? '✅ Success: Password updated' : `❌ Error: ${data.error}`);
      if (res.ok) {
        setTargetPhone('');
        setNewPassword('');
      }
    } catch (err) {
      setMessage(`❌ Network error: ${err.message}`);
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return <div style={centerStyle}>Checking auth...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: 'hotpink', marginBottom: '20px' }}>
        Admin Panel - {user?.phoneNumber || user?.phone}
      </h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('deposits')} style={tabStyle(tab === 'deposits')}>
          Deposits ({deposits.length})
        </button>
        <button onClick={() => setTab('withdrawals')} style={tabStyle(tab === 'withdrawals')}>
          Withdrawals ({withdrawals.length})
        </button>
        <button onClick={() => setTab('users')} style={tabStyle(tab === 'users')}>
          Users
        </button>
      </div>

      {/* Deposits Tab */}
      {tab === 'deposits' && (
        <div style={containerStyle}>
          {loading? <p>Loading...</p> : deposits.length === 0? <p>No pending deposits</p> :
            deposits.map(d => (
              <div key={d.id} style={cardStyle}>
                <p><b>Phone:</b> {d.phoneNumber}</p>
                <p><b>Amount:</b> {d.amount} UGX</p>
                <p><b>Method:</b> {d.method}</p>
                <p><b>Time:</b> {new Date(d.createdAt).toLocaleString()}</p>
                <div>
                  <button disabled={loading} onClick={() => handleTxnAction('deposit', 'confirm-deposit', d.phoneNumber, d.id)} style={btnGreen}>Confirm</button>
                  <button disabled={loading} onClick={() => handleTxnAction('deposit', 'reject-deposit', d.phoneNumber, d.id)} style={btnRed}>Reject</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <div style={containerStyle}>
          {loading? <p>Loading...</p> : withdrawals.length === 0? <p>No pending withdrawals</p> :
            withdrawals.map(w => (
              <div key={w.id} style={cardStyle}>
                <p><b>Phone:</b> {w.phoneNumber}</p>
                <p><b>Amount:</b> {w.amount} UGX</p>
                <p><b>Method:</b> {w.method}</p>
                <p><b>Account:</b> {w.accountName} - {w.accountNumber}</p>
                <div>
                  <button disabled={loading} onClick={() => handleTxnAction('withdrawal', 'confirm-withdrawal', w.phoneNumber, w.id)} style={btnGreen}>Confirm</button>
                  <button disabled={loading} onClick={() => handleTxnAction('withdrawal', 'reject-withdrawal', w.phoneNumber, w.id)} style={btnRed}>Reject</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <form onSubmit={handleResetPassword} style={formStyle}>
          <h3 style={{ color: 'hotpink', marginBottom: '15px' }}>Reset User Password</h3>

          <label style={labelStyle}>User Phone</label>
          <input type="text" value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)}
                 placeholder="0753520252" required style={inputStyle} />

          <label style={labelStyle}>New Password</label>
          <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                 placeholder="newpassword123" required style={inputStyle} />

          <button type="submit" disabled={loading} style={btnSubmit}>
            {loading? 'Updating...' : 'Update Password'}
          </button>

          {message && <div style={msgStyle(message)}>{message}</div>}
        </form>
      )}
    </div>
  );
}

// Styles - same vibe as your old admin.js
const centerStyle = { minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const containerStyle = { maxWidth: '800px', margin: '0 auto' };
const formStyle = { background: '#1a1a1a', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', margin: '0 auto', border: '1px solid hotpink' };
const cardStyle = { border: '1px solid #333', padding: '12px', marginBottom: '10px', borderRadius: '8px', background: '#1a1a1a' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', background: '#2a2a2a', border: '1px solid hotpink', borderRadius: '6px', color: '#fff', fontSize: '15px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px', color: 'hotpink' };
const tabStyle = (active) => ({ padding: '10px 20px', background: active? 'hotpink' : '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' });
const btnGreen = { marginRight: '10px', background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const btnRed = { background: '#dc3545', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const btnSubmit = { width: '100%', padding: '12px', background: 'black', color: 'hotpink', border: '2px solid hotpink', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const msgStyle = (msg) => ({ marginTop: '15px', padding: '10px', background: msg.includes('✅')? '#1e4620' : '#4a1e1e', borderRadius: '6px', fontSize: '14px' });

export default AdminTransactions;