import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function VipTask({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('VIP LITE');
  
  const [userBalance, setUserBalance] = useState(user?.balance || 0);
  const [rentedHuts, setRentedHuts] = useState([]);

  useEffect(() => {
    // Load rented huts from localStorage
    const savedHuts = localStorage.getItem(`huts_${user.phone}`);
    if (savedHuts) {
      setRentedHuts(JSON.parse(savedHuts));
    }
  }, [user.phone]);

  useEffect(() => {
    // Save rented huts whenever they change
    localStorage.setItem(`huts_${user.phone}`, JSON.stringify(rentedHuts));
  }, [rentedHuts, user.phone]);

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

  const hutsToShow = activeTab === 'VIP LITE' ? vipLiteHuts : vipProHuts;
  const activeHuts = rentedHuts.filter(h => !h.collected);
  const expiredHuts = rentedHuts.filter(h => h.collected);

  useEffect(() => {
    const checkMaturity = () => {
      const now = new Date();
      setRentedHuts(prev =>
        prev.map(h => {
          if (!h.matured && !h.collected) {
            const maturityTime = new Date(h.rentedAt).getTime() + h.days * 24 * 60 * 60 * 1000;
            if (now.getTime() >= maturityTime) {
              return { ...h, matured: true };
            }
          }
          return h;
        })
      );
    };

    checkMaturity();
    const interval = setInterval(checkMaturity, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateBalance = (newBalance) => {
    setUserBalance(newBalance);
    const updatedUser = { ...user, balance: newBalance };
    localStorage.setItem('hutvilla_user', JSON.stringify(updatedUser));
  };

  const handleRent = (hut) => {
    const alreadyRented = rentedHuts.some(h => h.name === hut.name && !h.collected);
    if (alreadyRented) {
      alert(`You already rented the ${hut.name}. Each color can only be rented once.`);
      return;
    }

    const confirmed = window.confirm(`Do you want to Rent ${hut.name} for ${hut.rent.toLocaleString()}ugx?`);
    if (!confirmed) return;

    if (userBalance < hut.rent) {
      alert('Insufficient balance. Please deposit first.');
      return;
    }

    updateBalance(userBalance - hut.rent);
    setRentedHuts([
      ...rentedHuts,
      {
        ...hut,
        rentedAt: new Date().toISOString(),
        matured: false,
        collected: false
      }
    ]);
    alert(`${hut.name} rented successfully!`);
  };

  const handleCollect = (hutId) => {
    setRentedHuts(prev =>
      prev.map(h => {
        if (h.id === hutId && h.matured && !h.collected) {
          const newBalance = userBalance + h.income;
          updateBalance(newBalance);
          alert(`${h.income.toLocaleString()}ugx collected and added to your balance!`);
          return { ...h, collected: true };
        }
        return h;
      })
    );
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

  return (
    <div style={{ padding: '30px', minHeight: '100vh', background: '#f5f5f5' }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ marginBottom: '15px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>VIP Tasks</h2>
      <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6b35' }}>
        Balance: {userBalance.toLocaleString()}ugx
      </h4>
      
      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <button 
          onClick={() => setActiveTab('VIP LITE')}
          style={activeTab === 'VIP LITE' ? styles.activeTab : styles.inactiveTab}
        >
          VIP LITE
        </button>
        <button 
          onClick={() => setActiveTab('VIP PRO')}
          style={activeTab === 'VIP PRO' ? styles.activeTab : styles.inactiveTab}
        >
          VIP PRO
        </button>
      </div>

      {/* Hut grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {hutsToShow.map((hut) => (
          <div key={hut.id} style={styles.card}>
            <img 
              src={hut.img} 
              alt={hut.name} 
              style={styles.image}
              onError={(e) => e.target.style.display = 'none'} 
            />
            <h3 style={styles.name}>{hut.name}</h3>
            <p style={styles.detail}>Rent: {hut.rent.toLocaleString()}ugx</p>
            <p style={styles.detail}>Days: {hut.days}</p>
            <p style={styles.detail}>Income: {hut.income.toLocaleString()}ugx</p>
            <button onClick={() => handleRent(hut)} style={styles.rentButton}>
              Rent Now
            </button>
          </div>
        ))}
      </div>

      {/* Active Rented Huts */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={styles.sectionTitle}>Active Rented Huts</h3>
        {activeHuts.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No active rented huts</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {activeHuts.map(hut => {
              const maturity = getMaturityInfo(hut.rentedAt, hut.days);
              return (
                <div key={hut.id} style={styles.activeCard}>
                  <img 
                    src={hut.img} 
                    alt={hut.name} 
                    style={styles.smallImage}
                    onError={(e) => e.target.style.display = 'none'} 
                  />
                  <h4>{hut.name}</h4>
                  <p>Amount Paid: {hut.rent.toLocaleString()}ugx</p>
                  <p>Locked for: {hut.days} days</p>
                  <p>Maturity Date: {maturity.date}</p>
                  <p>Status: {maturity.timeLeft}</p>
                  <p>Expected Income: {hut.income.toLocaleString()}ugx</p>
                  {maturity.matured && (
                    <button onClick={() => handleCollect(hut.id)} style={styles.collectButton}>
                      Collect Income
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expired Rented Huts */}
      <div>
        <h3 style={styles.sectionTitle}>Expired Rented Huts</h3>
        {expiredHuts.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No expired huts yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            {expiredHuts.map(hut => (
              <div key={hut.id} style={styles.expiredCard}>
                <img 
                  src={hut.img} 
                  alt={hut.name} 
                  style={styles.smallImage}
                  onError={(e) => e.target.style.display = 'none'} 
                />
                <h4>{hut.name}</h4>
                <p>Amount Paid: {hut.rent.toLocaleString()}ugx</p>
                <p>Income Collected: {hut.income.toLocaleString()}ugx</p>
                <p style={styles.doneLabel}>✓ Income Collection Done</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  activeTab: {
    padding: '8px 20px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  inactiveTab: {
    padding: '8px 20px',
    background: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '20px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  activeCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #4caf50'
  },
  expiredCard: {
    background: '#f5f5f5',
    borderRadius: '12px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    opacity: 0.8
  },
  image: {
    width: '100%',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px'
  },
  smallImage: {
    width: '100%',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '8px'
  },
  name: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  detail: {
    fontSize: '13px',
    color: '#555',
    margin: '3px 0'
  },
  sectionTitle: {
    marginBottom: '15px',
    borderBottom: '2px solid #ff6b35',
    paddingBottom: '5px'
  },
  rentButton: {
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  collectButton: {
    width: '100%',
    padding: '10px',
    marginTop: '12px',
    background: 'hotpink',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  doneLabel: {
    marginTop: '8px',
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default VipTask;