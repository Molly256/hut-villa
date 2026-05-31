import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Invite() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  if (!user) return null;

  const phoneClean = (user.phone || user.phoneNumber || '')
  .replace('+', '')
  .replace(/\D/g, '');

  const inviteCode = phoneClean.startsWith('0')? phoneClean.substring(1) : phoneClean || user.id || 'USER';
  const inviteLink = `https://hut-villa.vercel.app/register?code=${inviteCode}`;
  const shareText = `Join Hut Villa! Use my link to register and start earning: ${inviteLink}`;
  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const trackInvite = async () => {
    const phone = user.phone || user.phoneNumber;
    if (!phone) return;
    try {
      await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
    } catch (err) {
      console.error('Invite tracking failed:', err);
    }
  };

  // FIXED: Log invitation reward for testing + save to transaction history
  const logInvitationReward = async (invitedPhone, amount = 1000) => {
    const phone = user.phone || user.phoneNumber;
    if (!phone) return;
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log-invitation',
          phoneNumber: phone,
          amount: amount,
          invitedPhone: invitedPhone
        })
      });
    } catch (err) {
      console.error('Log invitation failed:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    trackInvite();
    // Test: log 1000 UGX reward for demo. Remove later when real deposit triggers it
    logInvitationReward('0743946046', 1000);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    window.open(whatsappLink, '_blank');
    setShared(true);
    trackInvite();
    logInvitationReward('0743946046', 1000);
    setTimeout(() => setShared(false), 2000);
  };

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', {
        onClick: () => navigate(-1),
        style: styles.backBtn
      }, '‹'),
      React.createElement('h2', { style: styles.title }, 'Invite Friends'),
      React.createElement('div', { style: { width: '24px' } })
    ),
    React.createElement('div', { style: styles.content },
      React.createElement('button', {
        style: styles.inviteBtn,
        onClick: handleCopy
      }, copied? 'LINK COPIED!' : 'Invite Friends'),
      React.createElement('button', {
        style: styles.whatsappBtn,
        onClick: handleWhatsAppShare
      }, `📱 ${shared? 'Opening WhatsApp...' : 'Share on WhatsApp'}`),
      React.createElement('div', { style: styles.card },
        React.createElement('h3', { style: styles.cardTitle }, 'How it works:'),
        React.createElement('ul', { style: styles.list },
          React.createElement('li', { style: styles.listItem },
            React.createElement('span', { style: styles.percent }, 'Get 10%'),
            ' on your Team A first deposit'
          ),
          React.createElement('li', { style: styles.listItem },
            React.createElement('span', { style: styles.percent }, 'Get 3%'),
            ' on your Team B first deposit'
          ),
          React.createElement('li', { style: styles.listItem },
            React.createElement('span', { style: styles.percent }, 'Get 1%'),
            ' on your Team C first deposit'
          )
        ),
        React.createElement('div', { style: styles.note },
          React.createElement('strong', null, 'Important:'),
          ' You only get the percentage on the invited user\'s ',
          React.createElement('strong', null, ' first deposit ONLY'),
          '. No daily income commissions from team members. No reward after the first deposit.'
        )
      ),
      React.createElement('div', { style: styles.card },
        React.createElement('div', { style: styles.label }, 'Your Invite Link'),
        React.createElement('input', {
          type: 'text',
          value: inviteLink,
          readOnly: true,
          style: styles.input
        }),
        React.createElement('button', {
          style: styles.copyBtn,
          onClick: handleCopy
        }, copied? 'Copied' : 'Copy Link')
      )
    )
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
  content: {
    padding: '20px'
  },
  inviteBtn: {
    width: '100%',
    padding: '16px',
    background: '#ff4f7a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(255, 79, 122, 0.3)'
  },
  whatsappBtn: {
    width: '100%',
    padding: '16px',
    background: '#ff4f7a',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  card: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '15px'
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#ff4f7a'
  },
  list: {
    paddingLeft: '20px',
    margin: '0 0 15px 0'
  },
  listItem: {
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '8px'
  },
  percent: {
    color: '#ff4f7a',
    fontWeight: '700'
  },
  note: {
    background: '#000',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#ccc',
    lineHeight: '1.5',
    borderLeft: '3px solid #ff4f7a'
  },
  label: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: '#000',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    marginBottom: '10px',
    boxSizing: 'border-box'
  },
  copyBtn: {
    width: '100%',
    padding: '12px',
    background: '#ff4f7a',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default Invite;