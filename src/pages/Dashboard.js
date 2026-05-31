import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const API_URL = '/api';

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ phone: '', balance: 0, nickname: '', avatar: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [adminPanel, setAdminPanel] = useState(false);
  const [adminTab, setAdminTab] = useState('reset');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('hutvilla_user');
      if (!savedUser) {
        navigate('/login');
        return;
      }

      const localUser = JSON.parse(savedUser);

      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: localUser.phone || localUser.phoneNumber })
        });

        if (!res.ok) {
          setUser(localUser);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('hutvilla_user', JSON.stringify(data.user));
      } catch (err) {
        console.error(err);
        setUser(localUser);
      }
      setLoading(false);
    };

    loadUser();
    window.addEventListener('focus', loadUser);
    return () => window.removeEventListener('focus', loadUser);
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const avatarData = reader.result;
      const updatedUser = { ...user, avatar: avatarData };

      try {
        await fetch(`${API_URL}/user/update-avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: user.phone || user.phoneNumber, avatar: avatarData })
        });

        setUser(updatedUser);
        localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
      } catch (err) {
        alert('Failed to update avatar');
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadApp = () => {
    navigate('/download');
  };

  const handleAdminClick = async () => {
    if (user.role !== 'admin') return alert('Admin only');
    setAdminPanel(true);
    setAdminTab('reset');
    fetchPending();
  };

  const searchUser = async () => {
    if (!searchPhone) return alert('Enter phone number');
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: searchPhone })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        setFoundUser(null);
      } else {
        setFoundUser(data.user);
        setNewPassword('');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
      setFoundUser(null);
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return alert('Enter new password');
    if (!foundUser) return alert('Search user first');
    
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset-password',
          adminPhone: '0753041411',
          adminPassword: '123456',
          phoneNumber: foundUser.phone,
          newPassword: newPassword
        })
      });
      const data = await res.json().catch(() => ({}));
      alert(data.message || data.error || 'No response from server');
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const fetchPending = async () => {
    const [depRes, witRes] = await Promise.all([
      fetch(`${API_URL}/transactions?action=list-pending-deposits`),
      fetch(`${API_URL}/transactions?action=list-pending-withdrawals`)
    ]);
    const depData = await depRes.json();
    const witData = await witRes.json();
    setPendingDeposits(depData.deposits || []);
    setPendingWithdrawals(witData.withdrawals || []);
  };

  const handleTxnAction = async (type, action, phoneNumber, id) => {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action, 
        phoneNumber,
        adminPhone: '0753041411',
        adminPassword: '123456',
        [`${type}Id`]: id 
      })
    });
    const data = await res.json();
    alert(data.message || data.error);
    fetchPending();
  };

  const baseMenuItems = [
    { label: 'Deposit', icon: '💳', path: '/deposit' },
    { label: 'Withdraw', icon: '💸', path: '/withdraw' },
    { label: 'VIP Task', icon: '🏠', path: '/vip-task' },
    { label: 'Transactions', icon: '📄', path: '/bill' },
    { label: 'Invite', icon: '📨', path: '/invite' },
    { label: 'My Team', icon: '👥', path: '/team' },
    { label: 'Manager Contact', icon: '📞', path: '/contact' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
    { label: 'Download App', icon: '📱', action: handleDownloadApp },
  ];

  const adminMenuItems = user.role === 'admin' ? [
    { label: 'Admin', icon: '🔐', action: handleAdminClick },
  ] : [];

  const menuItems = [...baseMenuItems, ...adminMenuItems];

  const bottomNav = [
    { label: 'Home', icon: '🏠', path: '/dashboard' },
    { label: 'Task', icon: '📋', path: '/vip-task' },
    { label: 'Deposit', icon: '💳', path: '/deposit' },
    { label: 'Me', icon: '👤', path: '/profile' },
  ];

  if (loading) {
    return React.createElement('div', { 
      style: { ...styles.wrapper, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' } 
    }, 'Loading...');
  }

  return React.createElement('div', { style: styles.wrapper },
    React.createElement('div', { style: styles.overlay },
      React.createElement('div', { style: styles.topCard },
        React.createElement('div', { 
          style: styles.avatarCircle, 
          onClick: () => fileInputRef.current.click() 
        },
          user.avatar
            ? React.createElement('img', { src: user.avatar, alt: 'avatar', style: styles.avatarImg })
            : React.createElement('div', { style: styles.avatarPlaceholder }, '👤')
        ),
        React.createElement('input', {
          type: 'file',
          ref: fileInputRef,
          style: { display: 'none' },
          accept: 'image/*',
          onChange: handleAvatarChange
        }),
        
        React.createElement('div', { style: styles.nickname }, 
          user.role === 'admin' ? 'Admin' : user.nickname || 'User'
        ),
        
        React.createElement('div', { style: styles.phone }, user.phone || user.phoneNumber),
        
        React.createElement('div', { 
          style: { ...styles.balance, color: Number(user.balance) < 0 ? '#ff4444' : '#4caf50' } 
        }, 
          `${Number(user.balance).toLocaleString()} UGX`
        )
      ),
      
      React.createElement('div', { style: styles.noticeWrapper },
        React.createElement('div', { style: styles.notice }, 
          'Welcome to Hut Villa site invest with confidence 🎉🎉🎊'
        )
      ),
      
      ...(adminPanel ? [
        React.createElement('div', { key: 'admin-panel', style: { background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '20px' } },
          React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } },
            React.createElement('button', { 
              onClick: () => setAdminTab('reset'),
              style: { flex: 1, padding: '10px', background: adminTab === 'reset' ? '#2196f3' : '#eee', color: adminTab === 'reset' ? '#fff' : '#333', border: 'none', borderRadius: '6px', fontWeight: '700' }
            }, 'Password Reset'),
            React.createElement('button', { 
              onClick: () => { setAdminTab('transactions'); fetchPending(); },
              style: { flex: 1, padding: '10px', background: adminTab === 'transactions' ? '#4caf50' : '#eee', color: adminTab === 'transactions' ? '#fff' : '#333', border: 'none', borderRadius: '6px', fontWeight: '700' }
            }, 'Admin Transactions'),
            React.createElement('button', { 
              onClick: () => setAdminPanel(false),
              style: { padding: '10px 16px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700' }
            }, 'Close')
          ),

          ...(adminTab === 'reset' ? [
            React.createElement('div', { key: 'reset-tab' },
              React.createElement('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px' } },
                React.createElement('input', {
                  type: 'text',
                  placeholder: 'Enter phone number',
                  value: searchPhone,
                  onChange: (e) => setSearchPhone(e.target.value),
                  style: { flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '6px' }
                }),
                React.createElement('button', { onClick: searchUser, style: { padding: '8px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '6px' } }, 'Search')
              ),
              ...(foundUser ? [
                React.createElement('div', { key: 'user-info', style: { borderTop: '1px solid #eee', paddingTop: '12px' } },
                  React.createElement('p', null, React.createElement('b', null, 'Name: '), foundUser.name),
                  React.createElement('p', null, React.createElement('b', null, 'Phone: '), foundUser.phone),
                  React.createElement('p', null, React.createElement('b', null, 'Current Password: '), foundUser.password),
                  React.createElement('p', null, React.createElement('b', null, 'Balance: '), foundUser.balance, ' UGX'),
                  React.createElement('input', {
                    type: 'text',
                    placeholder: 'Enter new password',
                    value: newPassword,
                    onChange: (e) => setNewPassword(e.target.value),
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '6px', marginTop: '8px' }
                  }),
                  React.createElement('button', { onClick: resetPassword, style: { width: '100%', padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '6px', marginTop: '8px', fontWeight: '700' } }, 'Update Password')
                )
              ] : [])
            )
          ] : []),

          ...(adminTab === 'transactions' ? [
            React.createElement('div', { key: 'tx-tab' },
              React.createElement('h4', { style: { color: '#2196f3', marginBottom: '8px' } }, 'Pending Deposits'),
              ...(pendingDeposits.length === 0 ? [React.createElement('p', { style: { color: '#999' } }, 'No pending deposits')] : 
                pendingDeposits.map(d => React.createElement('div', { key: d.id, style: { border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '8px' } },
                  React.createElement('p', null, React.createElement('b', null, 'Phone: '), d.phoneNumber),
                  React.createElement('p', null, React.createElement('b', null, 'Amount: '), d.amount, ' UGX'),
                  React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                    React.createElement('button', { onClick: () => handleTxnAction('deposit', 'confirm-deposit', d.phoneNumber, d.id), style: { flex: 1, padding: '6px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px' } }, 'Confirm'),
                    React.createElement('button', { onClick: () => handleTxnAction('deposit', 'reject-deposit', d.phoneNumber, d.id), style: { flex: 1, padding: '6px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px' } }, 'Reject')
                  )
                ))
              ),
              
              React.createElement('h4', { style: { color: '#ff9800', marginTop: '16px', marginBottom: '8px' } }, 'Pending Withdrawals'),
              ...(pendingWithdrawals.length === 0 ? [React.createElement('p', { style: { color: '#999' } }, 'No pending withdrawals')] : 
                pendingWithdrawals.map(w => React.createElement('div', { key: w.id, style: { border: '1px solid #ddd', padding: '10px', borderRadius: '6px', marginBottom: '8px' } },
                  React.createElement('p', null, React.createElement('b', null, 'Phone: '), w.phoneNumber),
                  React.createElement('p', null, React.createElement('b', null, 'Amount: '), w.amount, ' UGX'),
                  React.createElement('p', null, React.createElement('b', null, 'Account: '), w.accountName, ' - ', w.accountNumber),
                  React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                    React.createElement('button', { onClick: () => handleTxnAction('withdrawal', 'confirm-withdrawal', w.phoneNumber, w.id), style: { flex: 1, padding: '6px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px' } }, 'Confirm'),
                    React.createElement('button', { onClick: () => handleTxnAction('withdrawal', 'reject-withdrawal', w.phoneNumber, w.id), style: { flex: 1, padding: '6px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px' } }, 'Reject')
                  )
                ))
              )
            )
          ] : [])
        )
      ] : []),
      
      React.createElement('div', { style: styles.grid },
        menuItems.map((item) =>
          React.createElement('div', {
            key: item.label,
            onClick: () => item.action ? item.action() : navigate(item.path),
            style: styles.card
          },
            React.createElement('div', { style: styles.icon }, item.icon),
            React.createElement('div', { style: styles.label }, item.label)
          )
        )
      ),
      
      React.createElement('div', { style: styles.bottomBar },
        bottomNav.map((item) =>
          React.createElement('div', {
            key: item.label,
            style: styles.navItem,
            onClick: () => navigate(item.path)
          },
            React.createElement('div', { style: styles.navIcon }, item.icon),
            React.createElement('div', { style: styles.navLabel }, item.label)
          )
        )
      )
    )
  );
}

const styles = {
  wrapper: {
    backgroundImage: 'url(/bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.35)',
    minHeight: '100vh',
    width: '100%',
    padding: '16px 16px 80px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  topCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px 12px',
    textAlign: 'center',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  avatarCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    margin: '0 auto 10px',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '2px solid #ff69b4',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    fontSize: '36px',
    color: '#2196f3',
  },
  nickname: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '4px',
  },
  phone: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '6px',
  },
  balance: {
    fontSize: '20px',
    fontWeight: '700',
  },
  noticeWrapper: {
    marginBottom: '32px',
    overflow: 'hidden',
    width: '100%',
    background: '#000',
    padding: '12px 0',
    borderRadius: '8px',
  },
  notice: {
    display: 'inline-block',
    whiteSpace: 'nowrap',
    color: '#ff69b4',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.5px',
    animation: 'marquee 12s linear infinite',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '22px',
    marginTop: '0',
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '20px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
    minHeight: '105px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: '34px',
    marginBottom: '12px',
  },
  label: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
    lineHeight: '1.2',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #eee',
    zIndex: 100,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flex: 1,
  },
  navIcon: {
    fontSize: '22px',
    marginBottom: '2px',
  },
  navLabel: {
    fontSize: '11px',
    color: '#333',
    fontWeight: '500',
  },
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = `
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;