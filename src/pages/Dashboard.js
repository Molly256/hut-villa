import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ phone: '', balance: 0, nickname: '', avatar: '' });

  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('hutvilla_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };
    loadUser();
    window.addEventListener('focus', loadUser);
    return () => window.removeEventListener('focus', loadUser);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = {...user, avatar: reader.result };
      setUser(updatedUser);
      localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { label: 'Deposit', icon: '💳', path: '/deposit' },
    { label: 'Withdraw', icon: '💸', path: '/withdraw' },
    { label: 'VIP Task', icon: '🏠', path: '/vip-task' },
    { label: 'Transactions', icon: '📄', path: '/bill' },
    { label: 'Invite', icon: '📨', path: '/invite' },
    { label: 'My Team', icon: '👥', path: '/team' },
    { label: 'Manager Contact', icon: '📞', path: '/contact' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}>
        {/* Top white card with user info */}
        <div style={styles.topCard}>
          <div style={styles.avatarCircle} onClick={() => fileInputRef.current.click()}>
            {user.avatar? (
              <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>👤</div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleAvatarChange}
          />

          <div style={styles.nickname}>{user.nickname || 'User'}</div>
          <div style={styles.phone}>{user.phone}</div>
          <div style={styles.balance}>{user.balance? `${user.balance.toLocaleString()} UGX` : '0 UGX'}</div>
        </div>

        {/* 8 menu icons */}
        <div style={styles.grid}>
          {menuItems.map((item) => (
            <div key={item.label} onClick={() => navigate(item.path)} style={styles.card}>
              <div style={styles.icon}>{item.icon}</div>
              <div style={styles.label}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Rotating notice */}
        <div style={styles.noticeWrapper}>
          <div style={styles.notice}>
            Welcome to Hut Villa site invest with confidence 🎉🎉🎊
          </div>
        </div>
      </div>
    </div>
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
    justifyContent: 'space-between',
  },
  topCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px 12px',
    textAlign: 'center',
    marginBottom: '20px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
    marginTop: '42px',
    alignContent: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '18px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
    minHeight: '98px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  label: {
    fontSize: '12px',
    color: '#333',
    fontWeight: '500',
    lineHeight: '1.2',
  },
  noticeWrapper: {
    marginTop: '20px',
    marginBottom: '20px',
    overflow: 'hidden',
    width: '100%',
    background: '#000',
    padding: '10px 0',
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
};

if (typeof document!== 'undefined') {
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