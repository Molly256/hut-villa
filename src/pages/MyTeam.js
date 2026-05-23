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

  const TeamMember = ({ member, level }) => (
    <div style={styles.memberCard}>
      <div style={styles.memberInfo}>
        <div style={styles.avatar}>{member.phone?.slice(-4) || '****'}</div>
        <div>
          <div style={styles.phone}>{member.phone || 'Unknown'}</div>
          <div style={styles.date}>Joined: {member.date || 'N/A'}</div>
        </div>
      </div>
      <div style={styles.reward}>
        <div style={styles.rewardLabel}>Reward</div>
        <div style={styles.rewardAmount}>
          {level === 'A'? '10%' : level === 'B'? '3%' : '1%'}
        </div>
      </div>
    </div>
  );

  const TeamSection = ({ title, level, data, color }) => (
    <div style={styles.section}>
      <div style={{...styles.sectionTitle, color}}>
        ▶ {title} <span style={styles.count}>({data.length})</span>
      </div>
      {data.length === 0? (
        <div style={styles.emptyState}>
          No {title} members yet.
        </div>
      ) : (
        data.map((member, idx) => (
          <TeamMember key={idx} member={member} level={level} />
        ))
      )}
    </div>
  );

  if (loading) {
    return <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>‹</button>
        <h2 style={styles.title}>My Team</h2>
        <div style={{ width: '24px' }}></div>
      </div>

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Team A</div>
          <div style={styles.summaryValue}>{team.levelA.length}</div>
          <div style={styles.summarySub}>Direct invites</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Team B</div>
          <div style={styles.summaryValue}>{team.levelB.length}</div>
          <div style={styles.summarySub}>Level 2</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Team C</div>
          <div style={styles.summaryValue}>{team.levelC.length}</div>
          <div style={styles.summarySub}>Level 3</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Earned</div>
          <div style={styles.summaryValue}>{team.totalCommission.toLocaleString()}</div>
          <div style={styles.summarySub}>UGX</div>
        </div>
      </div>

      <TeamSection title="Team A" level="A" data={team.levelA} color="#ff4f7a" />
      <TeamSection title="Team B" level="B" data={team.levelB} color="#ff8aa8" />
      <TeamSection title="Team C" level="C" data={team.levelC} color="#ffb3c7" />

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