import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ phone: '', balance: 0 });

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
          <div style={styles.avatar}>👤</div>
          <div style={styles.phone}>{user.phone}</div>
          <div style={styles.balanceLabel}>Account Balance</div>
          <div style={styles.balanceAmount}>
            {user.balance ? `${user.balance.toLocaleString()} UGX` : ''}
          </div>
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

        {/* Rotating notice - now centered in the middle space */}
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
    justifyContent: 'space-between', // distributes space so notice sits in the middle
  },
  topCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '18px 12px',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
    fontSize: '28px',
    color: '#2196f3',
  },
  phone: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
    minHeight: '20px',
  },
  balanceLabel: {
    fontSize: '12px',
    color: '#999',
  },
  balanceAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ff69b4',
    minHeight: '24px',
    marginTop: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '18px',
    marginTop: '42px',
    alignContent: 'start',
    // removed flexGrow: 1
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

// Inject keyframes for marquee animation
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