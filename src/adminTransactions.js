import React, { useState, useEffect, useCallback } from 'react';

function AdminTransactions() {
  const [adminPhone] = useState('256753520252');
  const [adminPass] = useState('admin256$');
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // FIXED: Point to backend on Render, not Vercel frontend
  const API_URL = 'https://hut-villa-site-backend.onrender.com';

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(
        `${API_URL}/api/admin/pending-transactions?phone=${adminPhone}&password=${adminPass}`
      );
      const data = await res.json();

      if (data.success) {
        setDeposits(data.deposits || []);
        setWithdrawals(data.withdrawals || []);
        if (data.deposits?.length === 0 && data.withdrawals?.length === 0) {
          setMessage('No pending transactions');
        }
      } else {
        setMessage(data.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
    setLoading(false);
  }, [adminPhone, adminPass]);

  const handleAction = async (type, id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this ${type}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/approve-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone, password: adminPass, type, id, action })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.success) {
        fetchTransactions();
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    background: '#1a1a1a'
  };
  const thTdStyle = {
    border: '1px solid #333',
    padding: '12px',
    textAlign: 'left'
  };
  const thStyle = {
   ...thTdStyle,
    background: '#2a2a2a',
    fontWeight: '600'
  };
  const buttonBase = {
    border: 'none',
    padding: '6px 12px',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Pending Transactions</h2>
        <button
          onClick={fetchTransactions}
          style={{ padding: '8px 16px', background: '#4CAF50', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}
          disabled={loading}
        >
          {loading? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '12px',
          background: message.includes('error') || message.includes('Failed')? '#f44336' : '#4CAF50',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      <h3>Pending Deposits</h3>
      {loading? (
        <p>Loading...</p>
      ) : deposits.length === 0? (
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
                <tr key={d._id}>
                  <td style={thTdStyle}>{d.phoneNumber}</td>
                  <td style={thTdStyle}>{d.amount} UGX</td>
                  <td style={thTdStyle}>{new Date(d.createdAt).toLocaleString()}</td>
                  <td style={thTdStyle}>
                    <button
                      onClick={() => handleAction('deposit', d._id, 'approve')}
                      style={{...buttonBase, background: '#4CAF50', marginRight: '8px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('deposit', d._id, 'reject')}
                      style={{...buttonBase, background: '#f44336' }}
                    >
                      Reject
                    </button>
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
                <tr key={w._id}>
                  <td style={thTdStyle}>{w.phoneNumber}</td>
                  <td style={thTdStyle}>{w.amount} UGX</td>
                  <td style={thTdStyle}>{new Date(w.createdAt).toLocaleString()}</td>
                  <td style={thTdStyle}>
                    <button
                      onClick={() => handleAction('withdrawal', w._id, 'approve')}
                      style={{...buttonBase, background: '#4CAF50', marginRight: '8px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('withdrawal', w._id, 'reject')}
                      style={{...buttonBase, background: '#f44336' }}
                    >
                      Reject
                    </button>
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