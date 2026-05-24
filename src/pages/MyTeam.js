import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

function Team() {
  const navigate = useNavigate();
  const [team, setTeam] = useState({
    levelA: [],
    levelB: [],
    levelC: [],
    totalCommission: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(savedUser);

    fetch(`${API_URL}/team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: user.phone })
    })
    .then(res => res.json())
    .then(data => {
      setTeam(data.team || {
        levelA: [],
        levelB: [],
        levelC: [],
        totalCommission: 0
      });
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [navigate]);

  const renderTeamMember = (member, level) => 
    React.createElement('div', { style: styles.memberCard },
      React.createElement('div', { style: styles.memberInfo },
        React.createElement('div', { style: styles.avatar }, 
          member.phone?.slice(-4) || '****'
        ),
        React.createElement('div', null,
          React.createElement('div', { style: styles.phone }, member.phone || 'Unknown'),
          React.createElement('div', { style: styles.date }, `Joined: ${member.date || 'N/A'}`)
        )
      ),
      React.createElement('div', { style: styles.reward },
        React.createElement('div', { style: styles.rewardLabel }, 'Reward'),
        React.createElement('div', { style: styles.rewardAmount },
          level === 'A'? '10%' : level === 'B'? '3%' : '1%'
        )
      )
    );

  const renderTeamSection = (title, level, data, color) =>
    React.createElement('div', { style: styles.section },
      React.createElement('div', { style: { ...styles.sectionTitle, color } },
        `▶ ${title} `,
        React.createElement('span', { style: styles.count }, `(${data.length})`)
      ),
      data.length === 0
        ? React.createElement('div', { style: styles.emptyState }, `No ${title} members yet.`)
        : data.map((member, idx) => renderTeamMember(member, level))
    );

  if (loading) {
    return React.createElement('div', {
      style: { ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }
    }, 'Loading...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('div', { style: styles.header },
      React.createElement('button', { onClick: () => navigate(-1), style: styles.backBtn }, '‹'),
      React.createElement('h2', { style: styles.title }, 'My Team'),
      React.createElement('div', { style: { width: '24px' } })
    ),
    React.createElement('div', { style: styles.summaryRow },
      React.createElement('div', { style: styles.summaryCard },
        React.createElement('div', { style: styles.summaryLabel }, 'Team A'),
        React.createElement('div', { style: styles.summaryValue }, team.levelA.length),
        React.createElement('div', { style: styles.summarySub }, 'Direct invites')
      ),
      React.createElement('div', { style: styles.summaryCard },
        React.createElement('div', { style: styles.summaryLabel }, 'Team B'),
        React.createElement('div', { style: styles.summaryValue }, team.levelB.length),
        React.createElement('div', { style: styles.summarySub }, 'Level 2')
      ),
      React.createElement('div', { style: styles.summaryCard },
        React.createElement('div', { style: styles.summaryLabel }, 'Team C'),
        React.createElement('div', { style: styles.summaryValue }, team.levelC.length),
        React.createElement('div', { style: styles.summarySub }, 'Level 3')
      ),
      React.createElement('div', { style: styles.summaryCard },
        React.createElement('div', { style: styles.summaryLabel }, 'Total Earned'),
        React.createElement('div', { style: styles.summaryValue }, team.totalCommission.toLocaleString()),
        React.createElement('div', { style: styles.summarySub }, 'UGX')
      )
    ),
    renderTeamSection('Team A', 'A', team.levelA, '#ff4f7a'),
    renderTeamSection('Team B', 'B', team.levelB, '#ff8aa8'),
    renderTeamSection('Team C', 'C', team.levelC, '#ffb3c7'),
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
  summaryRow: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    overflowX: 'auto'
  },
  summaryCard: {
    flex: '1 0 22%',
    background: '#1a1a1a',
    border: '1px solid #ff4f7a',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'center',
    minWidth: '80px'
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#999',
    marginBottom: '5px'
  },
  summaryValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ff4f7a'
  },
  summarySub: {
    fontSize: '11px',
    color: '#666',
    marginTop: '3px'
  },
  section: {
    margin: '15px',
    padding: '15px',
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #222'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '15px'
  },
  count: {
    color: '#fff',
    fontWeight: '400'
  },
  memberCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#000',
    borderRadius: '8px',
    marginBottom: '10px',
    border: '1px solid #333'
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#ff4f7a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600'
  },
  phone: {
    fontSize: '14px',
    fontWeight: '500'
  },
  date: {
    fontSize: '12px',
    color: '#666',
    marginTop: '3px'
  },
  reward: {
    textAlign: 'right'
  },
  rewardLabel: {
    fontSize: '11px',
    color: '#666'
  },
  rewardAmount: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ff4f7a'
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
    padding: '20px'
  }
};

export default Team;