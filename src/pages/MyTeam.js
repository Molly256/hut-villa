import React, { useState, useEffect } from 'react';

const MyTeam = ({ user }) => {
  const [teamData, setTeamData] = useState({ levelA: [], levelB: [], levelC: [], totalCommission: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.phone) {
      fetchTeamData(user.phone);
    }
  }, );

  const fetchTeamData = async (phone) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      if (res.ok && data.team) {
        setTeamData(data.team);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTeamMember = (member, level, idx) =>
    React.createElement('div', {
      key: member.phone || idx,
      style: styles.memberCard
    },
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
          level === 'levelA'? '10%' : level === 'levelB'? '3%' : '1%'
        )
      )
    );

  const renderTeamSection = (title, level, data, color) =>
    React.createElement('div', { style: styles.section },
      React.createElement('div', { style: {...styles.sectionTitle, color } },
        `▶ ${title} `,
        React.createElement('span', { style: styles.count }, `(${data.length})`)
      ),
      data.length === 0
       ? React.createElement('div', { style: styles.emptyState }, `No ${title} members yet.`)
        : data.map((member, idx) => renderTeamMember(member, level, idx))
    );

  if (loading) {
    return React.createElement('div', { style: styles.loading }, 'Loading team...');
  }

  return React.createElement('div', { style: styles.container },
    React.createElement('h2', { style: styles.title }, 'My Team'),
    React.createElement('div', { style: styles.commissionBox },
      React.createElement('div', { style: styles.commissionLabel }, 'Total Commission'),
      React.createElement('div', { style: styles.commissionAmount }, `₹${teamData.totalCommission || 0}`)
    ),
    renderTeamSection('Level A', 'levelA', teamData.levelA || [], '#FFD700'),
    renderTeamSection('Level B', 'levelB', teamData.levelB || [], '#C0C0C0'),
    renderTeamSection('Level C', 'levelC', teamData.levelC || [], '#CD7F32')
  );
};

const styles = {
  container: { padding: '20px', background: '#000', color: '#fff', minHeight: '100vh' },
  title: { fontSize: '24px', marginBottom: '15px', textAlign: 'center' },
  commissionBox: { 
    background: '#1a1a1a', 
    padding: '15px', 
    borderRadius: '8px', 
    textAlign: 'center', 
    marginBottom: '25px',
    border: '1px solid #FFD700'
  },
  commissionLabel: { fontSize: '14px', opacity: 0.7 },
  commissionAmount: { fontSize: '28px', fontWeight: 'bold', color: '#4CAF50', marginTop: '5px' },
  section: { marginBottom: '30px' },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
  count: { fontSize: '14px', opacity: 0.7 },
  memberCard: { background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  memberInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' },
  phone: { fontSize: '16px' },
  date: { fontSize: '12px', opacity: 0.7 },
  reward: { textAlign: 'right' },
  rewardLabel: { fontSize: '12px', opacity: 0.7 },
  rewardAmount: { fontSize: '16px', fontWeight: 'bold', color: '#4CAF50' },
  emptyState: { textAlign: 'center', padding: '20px', opacity: 0.5 },
  loading: { textAlign: 'center', padding: '50px', fontSize: '18px' }
};

export default MyTeam;