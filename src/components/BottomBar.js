import { useNavigate, useLocation } from 'react-router-dom';

function BottomBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: 'VipTask', path: '/vip-task', icon: '⭐' },
    { label: 'Deposit', path: '/deposit', icon: '💳' },
    { label: 'Withdraw', path: '/withdraw', icon: '💰' },
    { label: 'My Team', path: '/team', icon: '👥' },
    { label: 'Invite', path: '/invite', icon: '📨' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div style={styles.bar}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <div 
            key={tab.path} 
            onClick={() => navigate(tab.path)} 
            style={active ? styles.activeItem : styles.item}
          >
            <div style={styles.icon}>{tab.icon}</div>
            <div style={styles.label}>{tab.label}</div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #ddd',
    zIndex: 1000
  },
  item: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#888',
    cursor: 'pointer',
    flex: 1
  },
  activeItem: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#ff6b35',
    cursor: 'pointer',
    flex: 1
  },
  icon: {
    fontSize: '20px',
    marginBottom: '2px'
  },
  label: {
    fontSize: '10px'
  }
};

export default BottomBar;