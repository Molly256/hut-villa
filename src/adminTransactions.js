import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function AdminTransactions() {
  const [user, setUser] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Get logged in user and check role
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        return;
      }

      const { data: userData } = await supabase
       .from('users')
       .select('*')
       .eq('id', authUser.id)
       .single();

      setUser(userData);
    };
    getUser();
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
        supabase.from('deposits').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('withdrawals').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      if (depRes.error) {
        setMessage('Deposits error: ' + depRes.error.message);
      } else if (witRes.error) {
        setMessage('Withdrawals error: ' + witRes.error.message);
      } else {
        setDeposits(depRes.data || []);
        setWithdrawals(witRes.data || []);
        if ((depRes.data || []).length === 0 && (witRes.data || []).length === 0) {
          setMessage('No pending transactions');
        }
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
    setLoading(false);
  }, [user]);

  const handleAction = async (table, id, action) => {
    if (!user || user.role!== 'admin') {
      setMessage('Unauthorized');
      return;
    }
    if (!window.confirm(`Are you sure you want to ${action} this ${table.slice(0, -1)}?`)) {
      return;
    }

    const newStatus = action === 'approve'? 'approved' : 'rejected';
    const { error } = await supabase
     .from(table)
     .update({ status: newStatus, updated_at: new Date().toISOString() })
     .eq('id', id);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage(`✅ ${table.slice(0, -1)} ${action}d successfully`);
      fetchTransactions();
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

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

  // Loading state
  if (!user) {
    return React.createElement('div', {
      style: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, 'Loading...');
  }

  // Unauthorized state
  if (user.role!== 'admin') {
    return React.createElement('div', {
      style: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, 'Unauthorized: Admin access only');
  }

  // Main UI
  return React.createElement('div', {
    style: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '20px' }
  },
    React.createElement('div', {
      style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }
    },
      React.createElement('h2', { style: { margin: 0 } }, 'Pending Transactions'),
      React.createElement('button', {
        onClick: fetchTransactions,
        style: { padding: '8px 16px', background: '#4CAF50', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' },
        disabled: loading
      }, loading? 'Refreshing...' : 'Refresh')
    ),

    message && React.createElement('div', {
      style: {
        padding: '12px',
        background: message.includes('error') || message.includes('Failed') || message.includes('Unauthorized')? '#f44336' : '#4CAF50',
        borderRadius: '6px',
        marginBottom: '20px'
      }
    }, message),

    React.createElement('h3', null, 'Pending Deposits'),
    deposits.length === 0
     ? React.createElement('p', { style: { color: '#888' } }, 'No pending deposits')
      : React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { style: tableStyle },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', { style: thStyle }, 'Phone'),
                React.createElement('th', { style: thStyle }, 'Amount'),
                React.createElement('th', { style: thStyle }, 'Date'),
                React.createElement('th', { style: thStyle }, 'Action')
              )
            ),
            React.createElement('tbody', null,
              deposits.map(d =>
                React.createElement('tr', { key: d.id },
                  React.createElement('td', { style: thTdStyle }, d.phone_number),
                  React.createElement('td', { style: thTdStyle }, d.amount + ' UGX'),
                  React.createElement('td', { style: thTdStyle }, new Date(d.created_at).toLocaleString()),
                  React.createElement('td', { style: thTdStyle },
                    React.createElement('button', {
                      onClick: () => handleAction('deposits', d.id, 'approve'),
                      style: {...buttonBase, background: '#4CAF50', marginRight: '8px' }
                    }, 'Approve'),
                    React.createElement('button', {
                      onClick: () => handleAction('deposits', d.id, 'reject'),
                      style: {...buttonBase, background: '#f44336' }
                    }, 'Reject')
                  )
                )
              )
            )
          )
        ),

    React.createElement('h3', { style: { marginTop: '40px' } }, 'Pending Withdrawals'),
    withdrawals.length === 0
     ? React.createElement('p', { style: { color: '#888' } }, 'No pending withdrawals')
      : React.createElement('div', { style: { overflowX: 'auto' } },
          React.createElement('table', { style: tableStyle },
            React.createElement('thead', null,
              React.createElement('tr', null,
                React.createElement('th', { style: thStyle }, 'Phone'),
                React.createElement('th', { style: thStyle }, 'Amount'),
                React.createElement('th', { style: thStyle }, 'Date'),
                React.createElement('th', { style: thStyle }, 'Action')
              )
            ),
            React.createElement('tbody', null,
              withdrawals.map(w =>
                React.createElement('tr', { key: w.id },
                  React.createElement('td', { style: thTdStyle }, w.phone_number),
                  React.createElement('td', { style: thTdStyle }, w.amount + ' UGX'),
                  React.createElement('td', { style: thTdStyle }, new Date(w.created_at).toLocaleString()),
                  React.createElement('td', { style: thTdStyle },
                    React.createElement('button', {
                      onClick: () => handleAction('withdrawals', w.id, 'approve'),
                      style: {...buttonBase, background: '#4CAF50', marginRight: '8px' }
                    }, 'Approve'),
                    React.createElement('button', {
                      onClick: () => handleAction('withdrawals', w.id, 'reject'),
                      style: {...buttonBase, background: '#f44336' }
                    }, 'Reject')
                  )
                )
              )
            )
          )
        )
  );
}

export default AdminTransactions;