import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const API_URL = '/api';

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ phone: '', balance: 0, nickname: '', avatar: '', role: '', rentedHuts: [] });
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
      const cleanPhone = searchPhone.replace(/\D/g, '');
      const res = await fetch(`${API_URL}/user?phone=${cleanPhone}`);
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
    if (!newPassword) return alert('Enter temp password first');
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
      if (data.success) {
        alert(data.message);
        setFoundUser({ ...foundUser, password: newPassword });
        setNewPassword('');
      } else {
        alert(data.error || 'Reset failed');
      }
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

  // NEW: Split rented huts by expiry using startTime + days like VipTask.js
  const now = Date.now();
  const activeRentedHuts = (user?.rentedHuts || []).filter(hut => {
    if (!hut.startTime || !hut.days) return false;
    const endTime = new Date(hut.startTime).getTime() + (hut.days * 24 * 60 * 60 * 1000);
    return endTime > now;
  });

  const expiredRentedHuts = (user?.rentedHuts || []).filter(hut => {
    if (!hut.startTime || !hut.days) return false;
    const endTime = new Date(hut.startTime).getTime() + (hut.days * 24 * 60 * 60 * 1000);
    return endTime <= now;
  });

  const getTimeLeft = (hut) => {
    const endTime = new Date(hut.startTime).getTime() + (hut.days * 24 * 60 * 60 * 1000);
    const diff = endTime - now;
    if (diff <= 0) return { days: 0, hours: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
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

      // NEW: Active Rented Huts - same card as VipTask.js
      activeRentedHuts.length > 0 && React.createElement('div', { style: { marginTop: '30px' } },
        React.createElement('h3', { style: styles.sectionTitle }, 'Active Rented Huts'),
        React.createElement('div', { style: styles.list },
          activeRentedHuts.map((hut, idx) => {
            const timeLeft = getTimeLeft(hut);
            const hutImage = hut.img || hut.image || hut.colorImage; // matches VipTask.js
            
            return React.createElement('div', { key: idx, style: styles.listItem },
              React.createElement('img', {
                src: hutImage,
                alt: hut.name,
                style: styles.hutImage,
                onError: (e) => e.target.style.display = 'none'
              }),
              React.createElement('div', { style: styles.hutInfo },
                React.createElement('h3', { style: styles.hutName }, hut.name),
                React.createElement('p', { style: styles.detail }, `Price: ${Number(hut.rent || hut.price).toLocaleString()} UGX`),
                React.createElement('p', { style: styles.detail }, `Lock: ${hut.days} Days`),
                React.createElement('p', { style: styles.detail }, `Total income: ${Number(hut.income || hut.totalIncome).toLocaleString()} UGX`),
                React.createElement('p', { style: styles.statusText }, `${timeLeft.days}d ${timeLeft.hours}h left`)
              )
            );
          })
        )
      ),

      // NEW: Expired Rented Huts - same card + EXPIRED label
      React.createElement('div', { style: { marginTop: '35px' } },
        React.createElement('h3', { style: styles.sectionTitle }, 'Expired Rented Huts'),
        expiredRentedHuts.length === 0
          ? React.createElement('p', { style: { textAlign: 'center', color: '#666' } }, 'No expired huts yet')
          : React.createElement('div', { style: styles.list },
              expiredRentedHuts.map((hut, idx) => {
                const hutImage = hut.img || hut.image || hut.colorImage;
                
                return React.createElement('div', { key: idx, style: { ...styles.listItem, opacity: 0.75 } },
                  React.createElement('div', { style: { position: 'relative' } },
                    React.createElement('img', {
                      src: hutImage,
                      alt: hut.name,
                      style: styles.hutImage,
                      onError: (e) => e.target.style.display = 'none'
                    }),
                    React.createElement('div', { 
                      style: { 
                        position: 'absolute', 
                        inset: 0, 
                        background: 'rgba(0,0,0,0.6)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        borderRadius: '12px 0 0 12px'
                      } 
                    },
                      React.createElement('span', { style: { color: '#fff', fontWeight: '700', fontSize: '12px' } }, 'EXPIRED')
                    )
                  ),
                  React.createElement('div', { style: styles.hutInfo },
                    React.createElement('h3', { style: styles.hutName }, hut.name),
                    React.createElement('p', { style: styles.detail }, `Price: ${Number(hut.rent || hut.price).toLocaleString()} UGX`),
                    React.createElement('p', { style: styles.detail }, `Lock: ${hut.days} Days`),
                    React.createElement('p', { style: styles.detail }, `Total income: ${Number(hut.income || hut.totalIncome).toLocaleString()} UGX`),
                    React.createElement('p', { style: { ...styles.doneLabel, color: '#ff4444' } }, 'EXPIRED')
                  )
                );
              })
            )
      ),
      
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
  sectionTitle: {
    marginBottom: '12px',
    borderBottom: '2px solid #ff6b35',
    paddingBottom: '6px',
    fontSize: '18px',
    color: '#fff',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    background: '#1a1a1a',
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden',
    border: '1px solid #2a2a2a',
  },
  hutImage: {
    width: '130px',
    height: '130px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  hutInfo: {
    flex: 1,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  hutName: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 6px',
    color: '#2196f3',
  },
  detail: {
    fontSize: '14px',
    color: '#fff',
    margin: '2px 0',
  },
  statusText: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#ff6b35',
    fontWeight: '600',
  },
  doneLabel: {
    marginTop: '8px',
    color: '#4caf50',
    fontWeight: '600',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '22px',
    marginTop: '30px',
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