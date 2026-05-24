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

        const updatedUser = { ...user, avatar: avatarData };
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
      const updatedUser = { ...user, nickname: newName.trim() };
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

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { 
        onClick: () => navigate(-1), 
        style: styles.backBtn 
      }, '‹'),
      React.createElement('h2', { style: styles.title }, 'Settings'),
      React.createElement('div', { style: { width: '24px' } })
    ),
    React.createElement('div', { style: styles.list },
      // Avatar
      React.createElement('div', { 
        style: styles.item, 
        onClick: () => document.getElementById('avatarUpload')?.click() 
      },
        React.createElement('span', null, 'Avatar'),
        React.createElement('div', { style: styles.right },
          React.createElement('img', {
            src: avatar,
            alt: 'avatar',
            style: {
              ...styles.avatar,
              opacity: isLegitUser ? 1 : 0.6
            }
          }),
          React.createElement('span', { style: styles.arrow }, '›')
        ),
        React.createElement('input', {
          type: 'file',
          id: 'avatarUpload',
          accept: 'image/*',
          style: { display: 'none' },
          onChange: handleAvatarUpload,
          disabled: !isLegitUser
        })
      ),
      // Nickname
      React.createElement('div', { style: styles.item, onClick: handleNicknameChange },
        React.createElement('span', null, 'Nick name'),
        React.createElement('div', { style: styles.right },
          React.createElement('span', { style: { color: '#999' } }, user.nickname || 'Anon'),
          React.createElement('span', { style: styles.arrow }, '›')
        )
      ),
      // Phone Number
      React.createElement('div', { style: styles.item },
        React.createElement('span', null, 'Phone Number'),
        React.createElement('span', { style: { color: '#999' } }, user.phone || '---')
      ),
      // Modify Password
      React.createElement('div', {
        style: { ...styles.item, opacity: isLegitUser ? 1 : 0.5 },
        onClick: () => isLegitUser ? navigate('/modifypassword') : alert('Rent a hut first')
      },
        React.createElement('span', null, 'Modify login password'),
        React.createElement('span', { style: styles.arrow }, '›')
      ),
      // Bank Information
      React.createElement('div', {
        style: { ...styles.item, opacity: isLegitUser ? 1 : 0.5 },
        onClick: () => isLegitUser ? navigate('/bankinfo') : alert('Rent a hut first')
      },
        React.createElement('span', null, 'Bank information'),
        React.createElement('span', { style: styles.arrow }, '›')
      ),
      // Version
      React.createElement('div', { style: { ...styles.item, background: '#1a1a1a' } },
        React.createElement('span', null, 'Version'),
        React.createElement('span', { style: { color: '#999' } }, '11.0.6')
      )
    ),
    React.createElement('button', { 
      onClick: handleLogout, 
      style: styles.logoutBtn 
    }, 'Sign out of account'),
    React.createElement('div', { style: { height: '80px' } })
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