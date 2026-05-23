import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = '/api';

function VipTask() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('VIP LITE');
  const [user, setUser] = useState(null);
  const [rentedHuts, setRentedHuts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('hutvilla_user');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    fetchHuts(parsedUser.phone);
  }, [navigate]);

  const fetchHuts = async (phone) => {
    try {
      const res = await fetch(`${API_URL}/huts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      setRentedHuts(data.huts || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const vipLiteHuts = [
    { id: 1, name: 'Pink Hut', rent: 32000, days: 17, income: 42000, img: '/assets/huts/pink-hut.jpg' },
    { id: 2, name: 'Red Hut', rent: 50000, days: 19, income: 70000, img: '/assets/huts/red-hut.jpg' },
    { id: 3, name: 'Green Hut', rent: 100000, days: 20, income: 130000, img: '/assets/huts/green-hut.jpg' },
    { id: 4, name: 'Orange Hut', rent: 200000, days: 20, income: 250000, img: '/assets/huts/orange-hut.jpg' },
    { id: 5, name: 'Black Hut', rent: 500000, days: 30, income: 650000, img: '/assets/huts/black-hut.jpg' },
    { id: 6, name: 'Yellow Hut', rent: 600000, days: 30, income: 800000, img: '/assets/huts/yellow-hut.jpg' },
  ];

  const vipProHuts = [
    { id: 7, name: 'Blue Hut', rent: 50000, days: 120, income: 250000, img: '/assets/huts/blue-hut.jpg' },
    { id: 8, name: 'White Hut', rent: 100000, days: 120, income: 400000, img: '/assets/huts/white-hut.jpg' },
    { id: 9, name: 'Purple Hut', rent: 500000, days: 120, income: 1000000, img: '/assets/huts/purple-hut.jpg' },
    { id: 10, name: 'Maroon Hut', rent: 800000, days: 120, income: 1600000, img: '/assets/huts/maroon-hut.jpg' },
    { id: 11, name: 'Silver Hut', rent: 1000000, days: 120, income: 2000000, img: '/assets/huts/silver-hut.jpg' },
    { id: 12, name: 'Gold Hut', rent: 2000000, days: 120, income: 4000000, img: '/assets/huts/gold-hut.jpg' },
  ];

  const hutsToShow = activeTab === 'VIP LITE'? vipLiteHuts : vipProHuts;
  const activeHuts = rentedHuts.filter(h =>!h.collected);
  const expiredHuts = rentedHuts.filter(h => h.collected);

  const handleRent = async (hut) => {
    const alreadyRented = rentedHuts.some(h => h.hut_id === hut.id &&!h.collected);
    if (alreadyRented) {
      alert(`You already rented the ${hut.name}. Each color can only be rented once.`);
      return;
    }

    const confirmed = window.confirm(`Rent ${hut.name} for ${hut.rent.toLocaleString()} UGX?`);
    if (!confirmed) return;

    if (user.balance < hut.rent) {
      alert('Insufficient balance. Please deposit first.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rent-hut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.phone,
          hutId: hut.id,
          hutName: hut.name,
          rent: hut.rent,
          days: hut.days,
          income: hut.income
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Rent failed');
        return;
      }

      setUser(data.user);
      localStorage.setItem('hutvilla_user', JSON.stringify(data.user));
      fetchHuts(user.phone);
      alert(`${hut.name} rented successfully!`);
    } catch (err) {
      alert('Network error. Try again.');
    }
  };

  const handleCollect = async (hutId) => {
    try {
      const res = await fetch(`${API_URL}/collect-hut`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.phone,
          hutId: hutId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Collect failed');
        return;
      }

      setUser(data.user);
      localStorage.setItem('hutvilla_user', JSON.stringify(data.user));
      fetchHuts(user.phone);
      alert(`${data.amount.toLocaleString()} UGX collected!`);
    } catch (err) {
      alert('Network error. Try again.');
    }
  };

  const getMaturityInfo = (rentedAt, days) => {
    const maturityDate = new Date(new Date(rentedAt).getTime() + days * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = maturityDate - now;

    if (diff <= 0) return { matured: true, date: maturityDate.toLocaleDateString(), timeLeft: 'Matured' };

    const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      matured: false,
      date: maturityDate.toLocaleDateString(),
      timeLeft: `${daysLeft}d ${hoursLeft}h left`
    };
  };

  const HutItem = ({ hut, isRented, maturity, onRent, onCollect }) => (
    <div style={styles.listItem}>
      <img
        src={hut.img}
        alt={hut.name}
        style={styles.hutImage}
        onError={(e) => e.target.style.display = 'none'}
      />
      <div style={styles.hutInfo}>
        <h3 style={styles.hutName}>{hut.name}</h3>
        <p style={styles.detail}>Price: {hut.rent.toLocaleString()} UGX</p>
        <p style={styles.detail}>Lock: {hut.days} Days</p>
        <p style={styles.detail}>Total income: {hut.income.toLocaleString()} UGX</p>
        {onRent &&!isRented && (
          <button onClick={() => onRent(hut)} style={styles.rentButton}>
            Rent Now
          </button>
        )}
        {onCollect && maturity?.matured &&!maturity?.collected && (
          <button onClick={() => onCollect(hut.id)} style={styles.collectButton}>
            Collect Income
          </button>
        )}
        {isRented && maturity &&!maturity.matured &&!maturity.collected && (
          <p style={styles.statusText}>{maturity.timeLeft}</p>
        )}
        {maturity?.collected && (
          <p style={styles.doneLabel}>✓ Income Collected</p>
        )}
      </div>
    </div>
  );

  if (loading ||!user) {
    return <div style={{...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <button
        onClick={() => navigate('/dashboard')}
        style={styles.backBtn}
      >
        ← Back
      </button>

      <h2 style={styles.title}>VIP Tasks</h2>
      <h4 style={styles.balance}>
        Balance: {user.balance.toLocaleString()} UGX
      </h4>

      <div style={styles.tabWrapper}>
        <button
          onClick={() => setActiveTab('VIP LITE')}
          style={activeTab === 'VIP LITE'? styles.activeTab : styles.inactiveTab}
        >
          VIP LITE
        </button>
        <button
          onClick={() => setActiveTab('VIP PRO')}
          style={activeTab === 'VIP PRO'? styles.activeTab : styles.inactiveTab}
        >
          VIP PRO
        </button>
      </div>

      <div style={styles.list}>
        {hutsToShow.map((hut) => {
          const rentedHut = rentedHuts.find(h => h.hut_id === hut.id &&!h.collected);
          return (
            <HutItem
              key={hut.id}
              hut={hut}
              isRented={!!rentedHut}
              onRent={handleRent}
            />
          );
        })}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Active Rented Huts</h3>
        {activeHuts.length === 0? (
          <p style={{ textAlign: 'center', color: '#666' }}>No active rented huts</p>
        ) : (
          <div style={styles.list}>
            {activeHuts.map(hut => {
              const maturity = getMaturityInfo(hut.rented_at, hut.days);
              return (
                <HutItem
                  key={`active-${hut.id}`}
                  hut={hut}
                  isRented={true}
                  maturity={maturity}
                  onCollect={handleCollect}
                />
              );
            })}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Expired Rented Huts</h3>
        {expiredHuts.length === 0? (
          <p style={{ textAlign: 'center', color: '#666' }}>No expired huts yet</p>
        ) : (
          <div style={styles.list}>
            {expiredHuts.map(hut => {
              const maturity = { collected: true };
              return (
                <HutItem
                  key={`expired-${hut.id}`}
                  hut={hut}
                  isRented={true}
                  maturity={maturity}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '20px 12px 80px',
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  backBtn: {
    marginBottom: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '22px',
    fontWeight: '700',
  },
  balance: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#ff6b35',
    fontSize: '16px',
    fontWeight: '600',
  },
  tabWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  activeTab: {
    padding: '10px 24px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  inactiveTab: {
    padding: '10px 24px',
    background: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '14px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    background: '#1a1a1a',
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden',
    border: '1px solid #2a2a2a',
  },
  hutImage: {
    width: '130px',
    height: '130px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  hutInfo: {
    flex: 1,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  hutName: {
    fontSize: '18px',
    fontWeight: '700',
    margin: '0 0 6px',
    color: '#2196f3',
  },
  detail: {
    fontSize: '14px',
    color: '#fff',
    margin: '2px 0',
  },
  rentButton: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  collectButton: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    background: 'hotpink',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statusText: {
    marginTop: '8px',
    fontSize: '13px',
    color: '#ff6b35',
    fontWeight: '600',
  },
  doneLabel: {
    marginTop: '8px',
    color: '#4caf50',
    fontWeight: '600',
    fontSize: '14px',
  },
  section: {
    marginTop: '35px',
  },
  sectionTitle: {
    marginBottom: '12px',
    borderBottom: '2px solid #ff6b35',
    paddingBottom: '6px',
    fontSize: '18px',
    color: '#000',
  },
};

export default VipTask;