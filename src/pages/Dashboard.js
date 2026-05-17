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
      setUser({ balance: 0, ...parsed });
    }
  }, []);

  const iconColor = '#ff69b4';

  const menuItems = [
    { 
      label: 'Deposit', 
      path: '/deposit',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      )
    },
    { 
      label: 'Withdraw', 
      path: '/withdraw',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"></path>
        </svg>
      )
    },
    { 
      label: 'VIP Task', 
      path: '/vip-task',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    { 
      label: 'Transactions', 
      path: '/bill',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      )
    },
    { 
      label: 'Invite', 
      path: '/invite',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      )
    },
    { 
      label: 'My Team', 
      path: '/team',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    { 
      label: 'Settings', 
      path: '/settings',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      )
    },
    { 
      label: 'Manager Contact', 
      path: '/contact',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      )
    },
    { 
      label: 'Download App', 
      path: '/download',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
      )
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.profile}>
        <div style={styles.avatar}>
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" style={styles.avatarImg} />
          ) : (
            <div style={{...styles.avatarDefault, color: iconColor}}>👤</div>
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
    background: '#ffffff', 
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
    background: '#fff0f6', 
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
    color: '#ff69b4', 
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
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'transform 0.1s'
  },
  icon: { 
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'center'
  },
  label: { 
    fontSize: '12px', 
    color: '#333', 
    fontWeight: '500' 
  }
};

export default Dashboard;