import React, { useState, useEffect, useCallback } from 'react';

function AdminTransactions() {
  const [adminPhone] = useState('256753520252');
  const [adminPass] = useState('admin256$');
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = 'https://hut-villa.vercel.app';

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/pending-transactions?phone=${adminPhone}&password=${adminPass}`
      );
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits);
        setWithdrawals(data.withdrawals);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
    setLoading(false);
  }, [adminPhone, adminPass]);

  const handleAction = async (type, id, action) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: adminPhone, password: adminPass, type, id, action })
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.success) fetchTransactions();
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
  const thTdStyle = { border: '1px solid #444', padding: '8px', textAlign: 'left' };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }}>
      <h2>Pending Transactions</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchTransactions} style={{ padding: '8px 16px', background: '#4CAF50', border: 'none', color: '#fff', borderRadius: '6px' }}>
          Refresh
        </button>
        {message && <p style={{ marginTop: '10px' }}>{message}</p>}
      </div>

      <h3>Pending Deposits</h3>
      {loading? <p>Loading...</p> : deposits.length === 0? <p>No pending deposits</p> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Phone</th>
              <th style={thTdStyle}>Amount</th>
              <th style={thTdStyle}>Date</th>
              <th style={thTdStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map(d => (
              <tr key={d._id}>
                <td style={thTdStyle}>{d.phoneNumber}</td>
                <td style={thTdStyle}>{d.amount}</td>
                <td style={thTdStyle}>{new Date(d.createdAt).toLocaleString()}</td>
                <td style={thTdStyle}>
                  <button onClick={() => handleAction('deposit', d._id, 'approve')} style={{ marginRight: '5px', background: '#4CAF50', border: 'none', padding: '5px 10px', color: '#fff' }}>Approve</button>
                  <button onClick={() => handleAction('deposit', d._id, 'reject')} style={{ background: '#f44336', border: 'none', padding: '5px 10px', color: '#fff' }}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '30px' }}>Pending Withdrawals</h3>
      {withdrawals.length === 0? <p>No pending withdrawals</p> : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Phone</th>
              <th style={thTdStyle}>Amount</th>
              <th style={thTdStyle}>Date</th>
              <th style={thTdStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map(w => (
              <tr key={w._id}>
                <td style={thTdStyle}>{w.phoneNumber}</td>
                <td style={thTdStyle}>{w.amount}</td>
                <td style={thTdStyle}>{new Date(w.createdAt).toLocaleString()}</td>
                <td style={thTdStyle}>
                  <button onClick={() => handleAction('withdrawal', w._id, 'approve')} style={{ marginRight: '5px', background: '#4CAF50', border: 'none', padding: '5px 10px', color: '#fff' }}>Approve</button>
                  <button onClick={() => handleAction('withdrawal', w._id, 'reject')} style={{ background: '#f44336', border: 'none', padding: '5px 10px', color: '#fff' }}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminTransactions;