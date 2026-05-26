import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const API_URL = '/api';

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ phone: '', balance: 0, nickname: '', avatar: '', role: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('hutvilla_user');
      if (!savedUser) {
        navigate('/login');
        return;
      }

      const localUser = JSON.parse(savedUser);

      try {
        const res = await fetch(`${API_URL}/user`, {
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
        await fetch(`${API_URL}/update-avatar`, {
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

  const handleAdminClick = () => {
    const pass = prompt("Enter admin password:");
    if (pass === 'admin256$') {
      navigate('/admin');
    } else {
      alert("Wrong password");
    }
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

  const adminMenuItems = [
    { label: 'Admin', icon: '🔐', action: handleAdminClick },
    { label: 'Admin Transactions', icon: '💰', path: '/admin/transactions' },
  ];

  const menuItems = user.phone === '0753520252'
    ? [...baseMenuItems, ...adminMenuItems]
    : baseMenuItems;

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
        React.createElement('div', { style: styles.nickname }, user.nickname || 'User'),
        React.createElement('div', { style: styles.phone }, user.phone || user.phoneNumber),
        React.createElement('div', { style: styles.balance }, 
          user.balance ? `${Number(user.balance).toLocaleString()} UGX` : '0 UGX'
        )
      ),
      React.createElement('div', { style: styles.noticeWrapper },
        React.createElement('div', { style: styles.notice }, 
          'Welcome to Hut Villa site invest with confidence 🎉🎉🎊'
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
    color: '#ff69b4',
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