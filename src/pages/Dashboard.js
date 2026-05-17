import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ 
    nickname: 'User', 
    avatar: null 
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser({ ...parsed });
    }
  }, []);

  // Only 5 center icons as requested
  const menuItems = [
    { label: 'Deposit', icon: '💳', path: '/deposit' },
    { label: 'Withdraw', icon: '💸', path: '/withdraw' },
    { label: 'VIP Task', icon: '🏠', path: '/vip-task' },
    { label: 'Transactions', icon: '📄', path: '/bill' },
    { label: 'Invite', icon: '📨', path: '/invite' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.userBar}>
          <div style={styles.avatar}>
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarDefault}>👤</div>
            )}
          </div>
          <span style={styles.username}>{user.nickname || 'User'}</span>
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
    background: '#ff69b4', // hot pink background
  },
  header: {
    background: '#ff69b4',
    padding: '15px 20px',
    color: '#fff',
  },
  userBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarDefault: {
    fontSize: '20px',
  },
  username: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    background: '#ff69b4',
    padding: '15px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '18px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  icon: {
    fontSize: '32px', // larger emoji for visibility
    marginBottom: '6px',
    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))', // makes emoji pop on pink
  },
  label: {
    fontSize: '13px',
    color: '#333',
    fontWeight: '500',
  }
};

export default Dashboard;