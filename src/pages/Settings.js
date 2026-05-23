import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [avatar, setAvatar] = useState('https://via.placeholder.com/80');
  const [rentedHuts, setRentedHuts] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');
    
    const huts = JSON.parse(localStorage.getItem(`huts_${parsedUser.phone}`)) || [];
    setRentedHuts(huts);
  }, [navigate]);

  const isLegitUser = Array.isArray(rentedHuts) && rentedHuts.length > 0;

  const handleAvatarUpload = (e) => {
    if (!isLegitUser) {
      alert('Rent a hut first to change avatar');
      return;
    }
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const avatarData = reader.result;
        setAvatar(avatarData);

        const updatedUser = {...user, avatar: avatarData };
        setUser(updatedUser);
        localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNicknameChange = () => {
    if (!isLegitUser) {
      alert('Rent a hut first to change nickname');
      return;
    }
    const newName = prompt('Enter new nickname:', user.nickname || '');
    if (newName && newName.trim()) {
      const updatedUser = {...user, nickname: newName.trim() };
      setUser(updatedUser);
      localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('hutvilla_user');
    localStorage.removeItem(`huts_${user.phone}`);
    localStorage.removeItem(`team_${user.id}`);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>‹</button>
        <h2 style={styles.title}>Settings</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={styles.list}>
        {/* Avatar */}
        <div style={styles.item} onClick={() => document.getElementById('avatarUpload')?.click()}>
          <span>Avatar</span>
          <div style={styles.right}>
            <img
              src={avatar}
              alt="avatar"
              style={{
               ...styles.avatar,
                opacity: isLegitUser? 1 : 0.6
              }}
            />
            <span style={styles.arrow}>›</span>
          </div>
          <input
            type="file"
            id="avatarUpload"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
            disabled={!isLegitUser}
          />
        </div>

        {/* Nickname */}
        <div style={styles.item} onClick={handleNicknameChange}>
          <span>Nick name</span>
          <div style={styles.right}>
            <span style={{ color: '#999' }}>{user.nickname || 'Anon'}</span>
            <span style={styles.arrow}>›</span>
          </div>
        </div>

        {/* Phone Number */}
        <div style={styles.item}>
          <span>Phone Number</span>
          <span style={{ color: '#999' }}>{user.phone || '---'}</span>
        </div>

        {/* Modify Password */}
        <div
          style={{...styles.item, opacity: isLegitUser? 1 : 0.5 }}
          onClick={() => isLegitUser? navigate('/modifypassword') : alert('Rent a hut first')}
        >
          <span>Modify login password</span>
          <span style={styles.arrow}>›</span>
        </div>

        {/* Bank Information */}
        <div
          style={{...styles.item, opacity: isLegitUser? 1 : 0.5 }}
          onClick={() => isLegitUser? navigate('/bankinfo') : alert('Rent a hut first')}
        >
          <span>Bank information</span>
          <span style={styles.arrow}>›</span>
        </div>

        {/* Version */}
        <div style={{...styles.item, background: '#1a1a1a' }}>
          <span>Version</span>
          <span style={{ color: '#999' }}>11.0.6</span>
        </div>
      </div>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        Sign out of account
      </button>

      <div style={{ height: '80px' }}></div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000',
    color: '#fff',
    paddingBottom: '80px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    borderBottom: '1px solid #222'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '28px',
    cursor: 'pointer'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0
  },
  list: {
    marginTop: '10px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 15px',
    borderBottom: '1px solid #222',
    cursor: 'pointer',
    fontSize: '15px'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  arrow: {
    color: '#666',
    fontSize: '20px'
  },
  logoutBtn: {
    width: '90%',
    margin: '30px 5%',
    padding: '14px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default Settings;