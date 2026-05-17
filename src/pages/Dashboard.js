import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nickname: 'User', phone: '', avatar: null });

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({ ...parsed });
    }
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
      <div style={styles.header}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarDefault}>👤</div>
            )}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.phone}>{user.phone || user.nickname || 'User'}</div>
            <div style={styles.balanceLabel}>Account Balance</div>
            <div style={styles.balanceAmount}></div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
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
    minHeight: '100vh',
    background: '#ff69b4',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '60px',
  },
  header: {
    background: '#ff69b4',
    padding: '12px 16px 8px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: '#fff0f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarDefault: {
    fontSize: '22px',
    color: '#ff69b4',
  },
  userInfo: {
    flex: 1,
    textAlign: 'center',
  },
  phone: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '2px',
  },
  balanceLabel: {
    fontSize: '12px',
    color: '#999',
  },
  balanceAmount: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ff69b4',
    minHeight: '24px',
  },
  content: {
    background: '#ff69b4',
    padding: '10px',
    flex: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  card: {
    background: '#fff',
    borderRadius: '6px',
    padding: '12px 4px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    minHeight: '78px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: '26px',
    marginBottom: '4px',
  },
  label: {
    fontSize: '11px',
    color: '#333',
    fontWeight: '500',
    lineHeight: '1.1',
  }
};

export default Dashboard;