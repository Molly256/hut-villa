import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ 
    phone: '', 
    balance: 0, 
    nickname: 'Anon', 
    avatar: null 
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Ensure balance always exists
      setUser({ balance: 0, ...parsed });
    }
  }, []);

  const menuItems = [
    { label: 'Deposit', icon: '💳', path: '/deposit' },
    { label: 'Withdraw', icon: '💸', path: '/withdraw' },
    { label: 'VIP Task', icon: '🏠', path: '/vip-task' },
    { label: 'Transactions', icon: '📄', path: '/bill' },
    { label: 'Invite', icon: '📨', path: '/invite' },
    { label: 'My Team', icon: '👥', path: '/team' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
    { label: 'Manager Contact', icon: '📞', path: '/contact' },
    { label: 'Download App', icon: '⬇️', path: '/download' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.profile}>
        <div style={styles.avatar}>
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarDefault}>👤</div>
          )}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.phone}>{user.nickname || 'Anon'}</div>
          <div style={styles.subPhone}>{user.phone}</div>
          <div style={styles.balance}>Balance: {(user.balance || 0).toLocaleString()} UGX</div>
        </div>
      </div>

      <div style={styles.grid}>
        {menuItems.map((item) => (
          <div key={item.label} onClick={() => navigate(item.path)} style={styles.item}>
            <div style={styles.icon}>{item.icon}</div>
            <div style={styles.label}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { 
    padding: '20px', 
    paddingBottom: '80px', 
    background: '#f5f5f5', 
    minHeight: '100vh' 
  },
  profile: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    marginBottom: '25px', 
    padding: '15px', 
    background: '#fff', 
    borderRadius: '10px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
  },
  avatar: { 
    width: '60px', 
    height: '60px', 
    borderRadius: '50%', 
    background: '#ddd', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  avatarImg: { 
    width: '100%', 
    height: '100%', 
    objectFit: 'cover' 
  },
  avatarDefault: { 
    fontSize: '30px' 
  },
  userInfo: { 
    flex: 1 
  },
  phone: { 
    fontSize: '18px', 
    fontWeight: '600', 
    color: '#333' 
  },
  subPhone: { 
    fontSize: '13px', 
    color: '#666', 
    marginBottom: '5px' 
  },
  balance: { 
    fontSize: '15px', 
    color: '#ff6b35', 
    fontWeight: '600' 
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(3, 1fr)', 
    gap: '15px' 
  },
  item: { 
    textAlign: 'center', 
    padding: '15px 10px', 
    background: '#fff', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)' 
  },
  icon: { 
    fontSize: '28px', 
    marginBottom: '8px' 
  },
  label: { 
    fontSize: '12px', 
    color: '#333', 
    fontWeight: '500' 
  }
};

export default Dashboard;