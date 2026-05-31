import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [avatar, setAvatar] = useState('https://via.placeholder.com/80');
  const [rentedHuts, setRentedHuts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Bank info form states
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    method: 'MTN Mobile Money',
    accountNumber: '',
    accountName: ''
  });

  // Password form states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');

    // Load existing bank details
    if (parsedUser.bankDetails) {
      setBankDetails(parsedUser.bankDetails);
    }

    const huts = JSON.parse(localStorage.getItem(`huts_${parsedUser.phone}`)) || [];
    setRentedHuts(huts);
  }, [navigate]);

  const isLegitUser = Array.isArray(rentedHuts) && rentedHuts.length > 0;

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: user.phone,...data })
      });

      const resData = await res.json();
      if (!res.ok) {
        alert(resData.error || 'Update failed');
        return false;
      }

      const updatedUser = {...user,...data };
      setUser(updatedUser);
      localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
      return true;
    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    if (!isLegitUser) {
      alert('Rent a hut first to change avatar');
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      alert('Image too large. Max 100KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatarData = reader.result;
      setAvatar(avatarData);
      updateProfile({ avatar: avatarData });
    };
    reader.readAsDataURL(file);
  };

  const handleNicknameChange = () => {
    if (!isLegitUser) {
      alert('Rent a hut first to change nickname');
      return;
    }
    const newName = prompt('Enter new nickname:', user.nickname || '');
    if (newName && newName.trim()) {
      updateProfile({ nickname: newName.trim() });
    }
  };

  const handleBankSave = async () => {
    if (!isLegitUser) {
      alert('Rent a hut first to add bank details');
      return;
    }
    if (!bankDetails.accountNumber ||!bankDetails.accountName) {
      alert('Fill mobile money number and account name');
      return;
    }

    const success = await updateProfile({ bankDetails });
    if (success) {
      alert('Bank details saved successfully');
      setShowBankForm(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!isLegitUser) {
      alert('Rent a hut first to change password');
      return;
    }
    if (passwords.oldPassword!== user.password) {
      alert('Old password incorrect');
      return;
    }
    if (passwords.newPassword.length < 4) {
      alert('New password must be at least 4 characters');
      return;
    }
    if (passwords.newPassword!== passwords.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    const success = await updateProfile({ password: passwords.newPassword });
    if (success) {
      alert('Password changed successfully');
      setShowPasswordForm(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
        style: {...styles.item, opacity: loading? 0.6 : 1 },
        onClick: () =>!loading && document.getElementById('avatarUpload')?.click()
      },
        React.createElement('span', null, 'Avatar'),
        React.createElement('div', { style: styles.right },
          React.createElement('img', {
            src: avatar,
            alt: 'avatar',
            style: {
             ...styles.avatar,
              opacity: isLegitUser? 1 : 0.6
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
          disabled:!isLegitUser || loading
        })
      ),
      // Nickname
      React.createElement('div', {
        style: {...styles.item, opacity: loading? 0.6 : 1 },
        onClick: () =>!loading && handleNicknameChange()
      },
        React.createElement('span', null, 'Nick name'),
        React.createElement('div', { style: styles.right },
          React.createElement('span', { style: { color: '#999' } }, user.nickname || 'Anon'),
          React.createElement('span', { style: styles.arrow }, '›')
        )
      ),
      // Phone Number - read only
      React.createElement('div', { style: {...styles.item, cursor: 'default' } },
        React.createElement('span', null, 'Phone Number'),
        React.createElement('span', { style: { color: '#999' } }, user.phone || '---')
      ),

      // Bank Information - MM dropdown + number + name
      React.createElement('div', {
        style: {...styles.item, opacity: isLegitUser? 1 : 0.5 },
        onClick: () => isLegitUser && setShowBankForm(!showBankForm)
      },
        React.createElement('span', null, 'Bank information'),
        React.createElement('span', { style: styles.arrow }, showBankForm? '⌄' : '›')
      ),
      showBankForm && isLegitUser && React.createElement('div', { style: styles.formBox },
        React.createElement('select', {
          value: bankDetails.method,
          onChange: (e) => setBankDetails({...bankDetails, method: e.target.value }),
          style: styles.input
        },
          React.createElement('option', { value: 'MTN Mobile Money' }, 'MTN Mobile Money'),
          React.createElement('option', { value: 'Airtel Mobile Money' }, 'Airtel Mobile Money')
        ),
        React.createElement('input', {
          type: 'tel',
          placeholder: 'Mobile money number',
          value: bankDetails.accountNumber,
          onChange: (e) => setBankDetails({...bankDetails, accountNumber: e.target.value }),
          style: styles.input
        }),
        React.createElement('input', {
          type: 'text',
          placeholder: 'Names that this number brings',
          value: bankDetails.accountName,
          onChange: (e) => setBankDetails({...bankDetails, accountName: e.target.value }),
          style: styles.input
        }),
        React.createElement('button', {
          onClick: handleBankSave,
          disabled: loading,
          style: styles.saveBtn
        }, loading? 'Saving...' : 'Save Bank Details')
      ),

      // Modify Password - 3 boxes
      React.createElement('div', {
        style: {...styles.item, opacity: isLegitUser? 1 : 0.5 },
        onClick: () => isLegitUser && setShowPasswordForm(!showPasswordForm)
      },
        React.createElement('span', null, 'Modify login password'),
        React.createElement('span', { style: styles.arrow }, showPasswordForm? '⌄' : '›')
      ),
      showPasswordForm && isLegitUser && React.createElement('div', { style: styles.formBox },
        React.createElement('input', {
          type: 'password',
          placeholder: '1. Input old password',
          value: passwords.oldPassword,
          onChange: (e) => setPasswords({...passwords, oldPassword: e.target.value }),
          style: styles.input
        }),
        React.createElement('input', {
          type: 'password',
          placeholder: '2. Create new password',
          value: passwords.newPassword,
          onChange: (e) => setPasswords({...passwords, newPassword: e.target.value }),
          style: styles.input
        }),
        React.createElement('input', {
          type: 'password',
          placeholder: '3. Repeat new password',
          value: passwords.confirmPassword,
          onChange: (e) => setPasswords({...passwords, confirmPassword: e.target.value }),
          style: styles.input
        }),
        React.createElement('button', {
          onClick: handlePasswordChange,
          disabled: loading,
          style: styles.saveBtn
        }, loading? 'Updating...' : 'Save')
      ),

      // Version
      React.createElement('div', { style: {...styles.item, background: '#1a1a1a', cursor: 'default' } },
        React.createElement('span', null, 'Version'),
        React.createElement('span', { style: { color: '#999' } }, '11.0.6')
      )
    ),
    React.createElement('button', {
      onClick: handleLogout,
      style: styles.logoutBtn,
      disabled: loading
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
  formBox: {
    padding: '15px',
    background: '#111',
    borderBottom: '1px solid #222'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    background: '#222',
    border: '1px solid #333',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  saveBtn: {
    width: '100%',
    padding: '10px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
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