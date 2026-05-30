import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VIP_TASKS = [
  { id: 1, name: 'Pink Villa', price: 32000, duration: '17 days', income: 42000, img: '/pink.jpg' },
  { id: 2, name: 'Red Villa', price: 50000, duration: '19 days', income: 70000, img: '/red.jpg' },
  { id: 3, name: 'Green Villa', price: 100000, duration: '20 days', income: 130000, img: '/green.jpg' },
  { id: 4, name: 'Orange Villa', price: 200000, duration: '20 days', income: 250000, img: '/orange.jpg' },
  { id: 5, name: 'Black Villa', price: 500000, duration: '30 days', income: 650000, img: '/black.jpg' },
  { id: 6, name: 'Yellow Villa', price: 600000, duration: '30 days', income: 800000, img: '/yellow.jpg' },
  { id: 7, name: 'Blue Villa', price: 50000, duration: '120 days', income: 250000, img: '/blue.jpg' },
  { id: 8, name: 'White Villa', price: 100000, duration: '120 days', income: 400000, img: '/white.jpg' },
  { id: 9, name: 'Purple Villa', price: 500000, duration: '120 days', income: 1000000, img: '/purple.jpg' },
  { id: 10, name: 'Maroon Villa', price: 800000, duration: '120 days', income: 1600000, img: '/maroon.jpg' },
  { id: 11, name: 'Silver Villa', price: 1000000, duration: '120 days', income: 2000000, img: '/silver.jpg' },
  { id: 12, name: 'Gold Villa', price: 2000000, duration: '120 days', income: 4000000, img: '/gold.jpg' },
];

export default function VipTask() {
  const [user, setUser] = useState(null);
  const [rented, setRented] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('hutvilla_user') || 'null');
    if (!u) {
      navigate('/login');
      return;
    }
    setUser(u);
    loadRented(u.phoneNumber || u.phone);
  }, [navigate]);

  const loadRented = async (phone) => {
    try {
      const res = await fetch('/api/get-rented', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      setRented(data.rented || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async (task) => {
    // Force read phone from localStorage to avoid undefined
    const savedUser = JSON.parse(localStorage.getItem('hutvilla_user') || '{}');
    const phoneNumber = savedUser.phoneNumber || savedUser.phone || user?.phoneNumber || user?.phone;

    if (!phoneNumber) {
      alert('Phone number missing. Please logout and login again.');
      return;
    }

    if (user.balance < task.price) {
      alert('Insufficient balance');
      return;
    }

    if (rented.find(r => r.hutId === task.id &&!r.collected)) {
      alert('You already rented this hut');
      return;
    }

    try {
      const res = await fetch('/api/rent-hut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: String(phoneNumber),
          hutId: task.id,
          hutName: task.name,
          rent: task.price,
          days: parseInt(task.duration),
          income: task.income
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Rent failed');
        return;
      }

      // Update user balance locally
      const newUser = {...user, balance: data.user.balance };
      setUser(newUser);
      localStorage.setItem('hutvilla_user', JSON.stringify(newUser));

      await loadRented(phoneNumber);
      alert(`${task.name} rented successfully!`);
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const handleCollect = async (rentId, income) => {
    const savedUser = JSON.parse(localStorage.getItem('hutvilla_user') || '{}');
    const phoneNumber = savedUser.phoneNumber || savedUser.phone || user?.phoneNumber || user?.phone;

    try {
      const res = await fetch('/api/collect-income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, rentId })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Collect failed');
        return;
      }

      const newUser = {...user, balance: data.user.balance };
      setUser(newUser);
      localStorage.setItem('hutvilla_user', JSON.stringify(newUser));

      await loadRented(phoneNumber);
      alert(`${income} UGX collected!`);
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>VIP Tasks</h2>
      <p style={styles.balance}>Balance: {user?.balance?.toLocaleString()} UGX</p>

      <div style={styles.grid}>
        {VIP_TASKS.map(task => {
          const isRented = rented.find(r => r.hutId === task.id &&!r.collected);
          const canCollect = isRented && Date.now() > isRented.maturityTime;

          return (
            <div key={task.id} style={styles.card}>
              <img src={task.img} alt={task.name} style={styles.img} />
              <h3>{task.name}</h3>
              <p>Price: {task.price.toLocaleString()} UGX</p>
              <p>Duration: {task.duration}</p>
              <p>Income: {task.income.toLocaleString()} UGX</p>

              {!isRented && (
                <button style={styles.btn} onClick={() => handleRent(task)}>
                  Rent Now
                </button>
              )}

              {isRented &&!canCollect && (
                <button style={styles.btnDisabled} disabled>
                  Locked
                </button>
              )}

              {isRented && canCollect && (
                <button style={styles.btnCollect} onClick={() => handleCollect(isRented.id, task.income)}>
                  Collect {task.income.toLocaleString()} UGX
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 20, maxWidth: 1000, margin: '0 auto' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  title: { textAlign: 'center', marginBottom: 10 },
  balance: { textAlign: 'center', fontWeight: 'bold', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
  card: { border: '1px solid #ddd', borderRadius: 12, padding: 12, textAlign: 'center' },
  img: { width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 },
  btn: { background: '#ff6600', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', width: '100%' },
  btnDisabled: { background: '#ccc', color: '#666', border: 'none', padding: '8px 16px', borderRadius: 8, width: '100%' },
  btnCollect: { background: '#28a745', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', width: '100%' },
};