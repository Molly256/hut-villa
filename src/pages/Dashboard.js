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
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    backgroundImage: 'url(/assets/huts/hut-bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    width: '100%',
  },
  overlay: {
    background: 'rgba(255, 105, 180, 0.8)',
    minHeight: '100vh',
    width: '100%',
    padding: '12px',
    paddingBottom: '70px',
    boxSizing: 'border-box',
  },
  topCard: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px 12px',
    textAlign: 'center',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    gap: '10px',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '14px 6px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
  icon: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#333',
    fontWeight: '500',
  },
};

export default Dashboard;