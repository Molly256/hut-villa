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
      : data.map((member, idx) => renderTeamMember(member, level, idx))
  );