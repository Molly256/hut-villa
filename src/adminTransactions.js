import React, { useState, useEffect, useCallback } from 'react';

function AdminTransactions() {
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get logged in user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('hutvilla_user');
    if (!storedUser) {
      setUser(null);
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!user || user.role!== 'admin') {
      setMessage('Unauthorized: Admin access only');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const [depRes, witRes] = await Promise.all([
        fetch('/api/deposits?status=pending'),
        fetch('/api/withdrawals?status=pending')
      ]);

      const depData = await depRes.json();
      const witData = await witRes.json();

      if (!depRes.ok) {
        setMessage('Deposits error: ' + depData.error);
      } else if (!witRes.ok) {
        setMessage('Withdrawals error: ' + witData.error);
      } else {
        setDeposits(depData.deposits || []);
        setWithdrawals(witData.withdrawals || []);
        if ((depData.deposits || []).length === 0 && (witData.withdrawals || []).length === 0) {
          setMessage('No pending transactions');
        }
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
    setLoading(false);
  }, [user]);

  const handleAction = async (type, id, action) => {
    if (!user || user.role!== 'admin') {
      setMessage('Unauthorized');
      return;
    }
    if (!window.confirm(`Are you sure you want to ${action} this ${type.slice(0, -1)}?`)) {
      return;
    }

    const res = await fetch(`/api/${type}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: action === 'approve'? 'approved' : 'rejected' })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage('Error: ' + data.error);
    } else {
      setMessage(`✅ ${type.slice(0, -1)} ${action}d successfully`);
      fetchTransactions();
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#1a1a1a' };
  const thTdStyle = { border: '1px solid #333', padding: '12px', textAlign: 'left' };
  const thStyle = {...thTdStyle, background: '#2a2a2a', fontWeight: '600' };
  const buttonBase = { border: 'none', padding: '6px 12px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' };

  if (!user) {
    return <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (user.role!== 'admin') {
    return <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Unauthorized: Admin access only</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Pending Transactions</h2>
        <button onClick={fetchTransactions} style={{ padding: '8px 16px', background: '#4CAF50', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }} disabled={loading}>
          {loading? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px', background: message.includes('error') || message.includes('Unauthorized')? '#f44336' : '#4CAF50', borderRadius: '6px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <h3>Pending Deposits</h3>
      {deposits.length === 0? (
        <p style={{ color: '#888' }}>No pending deposits</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map(d => (
                <tr key={d.id}>
                  <td style={thTdStyle}>{d.phone_number}</td>
                  <td style={thTdStyle}>{d.amount} UGX</td>
                  <td style={thTdStyle}>{new Date(d.created_at).toLocaleString()}</td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleAction('deposits', d.id, 'approve')} style={{...buttonBase, background: '#4CAF50', marginRight: '8px' }}>Approve</button>
                    <button onClick={() => handleAction('deposits', d.id, 'reject')} style={{...buttonBase, background: '#f44336' }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ marginTop: '40px' }}>Pending Withdrawals</h3>
      {withdrawals.length === 0? (
        <p style={{ color: '#888' }}>No pending withdrawals</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map(w => (
                <tr key={w.id}>
                  <td style={thTdStyle}>{w.phone_number}</td>
                  <td style={thTdStyle}>{w.amount} UGX</td>
                  <td style={thTdStyle}>{new Date(w.created_at).toLocaleString()}</td>
                  <td style={thTdStyle}>
                    <button onClick={() => handleAction('withdrawals', w.id, 'approve')} style={{...buttonBase, background: '#4CAF50', marginRight: '8px' }}>Approve</button>
                    <button onClick={() => handleAction('withdrawals', w.id, 'reject')} style={{...buttonBase, background: '#f44336' }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminTransactions;