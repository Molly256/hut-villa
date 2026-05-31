import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminTransactions() {
  const [tab, setTab] = useState('deposits');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [targetPhone, setTargetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(function() {
    async function checkAuth() {
      const phoneNumber = localStorage.getItem('phoneNumber');
      if (!phoneNumber) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch('/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: phoneNumber })
        });
        const data = await res.json();
        // FIXED: No?. here
        if (res.ok && data.user && data.user.role === 'admin') {
          setUser(data.user);
          fetchPending();
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        navigate('/dashboard');
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [navigate]);

  async function fetchPending() {
    setLoading(true);
    try {
      const depRes = await fetch('/api/transactions?action=list-pending-deposits');
      const witRes = await fetch('/api/transactions?action=list-pending-withdrawals');
      const depData = await depRes.json();
      const witData = await witRes.json();
      setDeposits(depData.deposits || []);
      setWithdrawals(witData.withdrawals || []);
    } catch (err) {
      console.log('Fetch error:', err);
    }
    setLoading(false);
  }

  async function handleTxnAction(type, action, phoneNumber, id) {
    if (!window.confirm('Confirm ' + action + ' for ' + type + '?')) return;
    setLoading(true);
    try {
      const body = {
        action: action,
        adminPhone: '0753041411',
        adminPassword: '123456',
        phoneNumber: phoneNumber
      };
      body[type + 'Id'] = id;

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchPending();
    } catch (err) {
      alert('Network error: ' + err.message);
    }
    setLoading(false);
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!user || user.role!== 'admin') {
      setMessage('Unauthorized: Admin only');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          adminPhone: '0753041411',
          adminPassword: '123456',
          phoneNumber: targetPhone,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      setMessage(res.ok? 'Success: Password updated' : 'Error: ' + data.error);
      if (res.ok) {
        setTargetPhone('');
        setNewPassword('');
      }
    } catch (err) {
      setMessage('Network error: ' + err.message);
    }
    setLoading(false);
  }

  if (checkingAuth) {
    return <div style={{minHeight:'100vh', background:'#0f0f0f', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'}}>Checking auth...</div>;
  }

  return (
    <div style={{minHeight:'100vh', background:'#0f0f0f', color:'#fff', padding:'20px'}}>
      <h2 style={{textAlign:'center', color:'hotpink', marginBottom:'20px'}}>
        Admin Panel - {user? user.phoneNumber : ''}
      </h2>

      <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'20px'}}>
        <button onClick={function(){setTab('deposits')}} style={{padding:'10px 20px', background:tab==='deposits'?'hotpink':'#333', color:'#fff', border:'none', borderRadius:'6px'}}>Deposits ({deposits.length})</button>
        <button onClick={function(){setTab('withdrawals')}} style={{padding:'10px 20px', background:tab==='withdrawals'?'hotpink':'#333', color:'#fff', border:'none', borderRadius:'6px'}}>Withdrawals ({withdrawals.length})</button>
        <button onClick={function(){setTab('users')}} style={{padding:'10px 20px', background:tab==='users'?'hotpink':'#333', color:'#fff', border:'none', borderRadius:'6px'}}>Users</button>
      </div>

      {tab==='deposits' && (
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          {loading? <p>Loading...</p> : deposits.length===0? <p>No pending deposits</p> :
            deposits.map(function(d){
              return (
                <div key={d.id} style={{border:'1px solid #333', padding:'12px', marginBottom:'10px', background:'#1a1a1a'}}>
                  <p><b>Phone:</b> {d.phoneNumber}</p>
                  <p><b>Amount:</b> {d.amount} UGX</p>
                  <p><b>Method:</b> {d.method}</p>
                  <button onClick={function(){handleTxnAction('deposit','confirm-deposit',d.phoneNumber,d.id)}} style={{marginRight:'10px', background:'#28a745', color:'#fff', border:'none', padding:'8px'}}>Confirm</button>
                  <button onClick={function(){handleTxnAction('deposit','reject-deposit',d.phoneNumber,d.id)}} style={{background:'#dc3545', color:'#fff', border:'none', padding:'8px'}}>Reject</button>
                </div>
              );
            })
          }
        </div>
      )}

      {tab==='withdrawals' && (
        <div style={{maxWidth:'800px', margin:'0 auto'}}>
          {loading? <p>Loading...</p> : withdrawals.length===0? <p>No pending withdrawals</p> :
            withdrawals.map(function(w){
              return (
                <div key={w.id} style={{border:'1px solid #333', padding:'12px', marginBottom:'10px', background:'#1a1a1a'}}>
                  <p><b>Phone:</b> {w.phoneNumber}</p>
                  <p><b>Amount:</b> {w.amount} UGX</p>
                  <p><b>Method:</b> {w.method}</p>
                  <p><b>Account:</b> {w.accountName || w.phoneNumber}</p>
                  <button onClick={function(){handleTxnAction('withdrawal','confirm-withdrawal',w.phoneNumber,w.id)}} style={{marginRight:'10px', background:'#28a745', color:'#fff', border:'none', padding:'8px'}}>Confirm</button>
                  <button onClick={function(){handleTxnAction('withdrawal','reject-withdrawal',w.phoneNumber,w.id)}} style={{background:'#dc3545', color:'#fff', border:'none', padding:'8px'}}>Reject</button>
                </div>
              );
            })
          }
        </div>
      )}

      {tab==='users' && (
        <form onSubmit={handleResetPassword} style={{background:'#1a1a1a', padding:'30px', maxWidth:'400px', margin:'0 auto', border:'1px solid hotpink'}}>
          <h3 style={{color:'hotpink'}}>Reset Password</h3>
          <input type="text" value={targetPhone} onChange={function(e){setTargetPhone(e.target.value)}} placeholder="Phone" required style={{width:'100%', padding:'10px', marginBottom:'15px'}}/>
          <input type="text" value={newPassword} onChange={function(e){setNewPassword(e.target.value)}} placeholder="New Password" required style={{width:'100%', padding:'10px', marginBottom:'15px'}}/>
          <button type="submit" disabled={loading} style={{width:'100%', padding:'12px', background:'black', color:'hotpink', border:'2px solid hotpink'}}>Update</button>
          {message && <div style={{marginTop:'15px'}}>{message}</div>}
        </form>
      )}
    </div>
  );
}

export default AdminTransactions;