import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function Register({ onRegister }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');

  const handleRegister = async () => {
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanPhone ||!password ||!repeatPassword) {
      alert('Please fill all fields');
      return;
    }
    if (cleanPhone.length < 10) {
      alert('Enter valid phone number');
      return;
    }
    if (password!== repeatPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          password: password.trim(),
          inviteCode: inviteCode || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        return;
      }

      const userData = {
        phoneNumber: data.user.phoneNumber,
        phone: data.user.phoneNumber,
        role: data.user.role || 'user',
        balance: data.user.balance || 0,
        nickname: data.user.nickname || 'User',
        avatar: data.user.avatar || '',
        bankMethod: data.user.bankMethod || '',
        bankNumber: data.user.bankNumber || '',
        bankName: data.user.bankName || '',
        inviteCode: data.user.inviteCode
      };

      localStorage.setItem('hutvilla_user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');

      onRegister(userData);
      alert('Registered successfully!');
      navigate('/dashboard');

    } catch (err) {
      alert('Network error. Try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div',
    { style: { padding: '30px', background: '#000', minHeight: '100vh', color: '#fff' } },

    React.createElement('h2', { style: { textAlign: 'center', marginBottom: '20px' } }, 'Register'),

    inviteCode && React.createElement('p', {
      style: { textAlign: 'center', color: '#ff6b35', marginBottom: '15px', fontSize: '14px' }
    }, `Invited by: ${inviteCode}`),

    React.createElement('input', {
      type: 'tel',
      placeholder: 'Enter phone number',
      value: phone,
      onChange: (e) => setPhone(e.target.value),
      style: styles.input
    }),

    // Password with eye button
    React.createElement('div', { style: styles.passWrapper },
      React.createElement('input', {
        type: showPassword? 'text' : 'password',
        placeholder: 'Password',
        value: password,
        onChange: (e) => setPassword(e.target.value),
        style: styles.inputPass
      }),
      React.createElement('span', {
        onClick: () => setShowPassword(!showPassword),
        style: styles.eye
      }, showPassword? '🙈' : '👁️')
    ),

    // Repeat Password with eye button
    React.createElement('div', { style: styles.passWrapper },
      React.createElement('input', {
        type: showRepeatPassword? 'text' : 'password',
        placeholder: 'Repeat password',
        value: repeatPassword,
        onChange: (e) => setRepeatPassword(e.target.value),
        style: styles.inputPass
      }),
      React.createElement('span', {
        onClick: () => setShowRepeatPassword(!showRepeatPassword),
        style: styles.eye
      }, showRepeatPassword? '🙈' : '👁️')
    ),

    // Invitation code input - auto filled
    React.createElement('input', {
      type: 'text',
      placeholder: 'Invitation code',
      value: inviteCode || '',
      readOnly:!!inviteCode,
      style: {...styles.input, background: inviteCode? '#222' : '#1a1a1a', color: inviteCode? '#ff6b35' : '#fff' }
    }),

    React.createElement('button',
      {
        onClick: handleRegister,
        style: {...styles.button, background: loading? '#555' : '#ff6b35', cursor: loading? 'not-allowed' : 'pointer' },
        disabled: loading
      },
      loading? 'Registering...' : 'Register'
    ),

    React.createElement('p',
      { style: { textAlign: 'center', marginTop: '20px', color: '#aaa' } },
      'Already have an account? ',
      React.createElement('span',
        {
          onClick: () => navigate('/login'),
          style: { color: '#ff6b35', cursor: 'pointer', textDecoration: 'underline' }
        },
        'Login'
      )
    )
  );
}

const styles = {
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '8px',
    border: '1px solid #333',
    fontSize: '14px',
    background: '#1a1a1a',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  passWrapper: {
    position: 'relative',
    marginBottom: '15px'
  },
  inputPass: {
    width: '100%',
    padding: '12px 40px 12px 12px',
    borderRadius: '8px',
    border: '1px solid #333',
    fontSize: '14px',
    background: '#1a1a1a',
    color: '#fff',
    outline: 'none',
    boxSizing: 'border-box'
  },
  eye: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '18px',
    userSelect: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600'
  }
};

export default Register;