import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import BottomBar from './components/BottomBar';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTeam from './pages/MyTeam';
import ManagerContact from './pages/ManagerContact';
import Invite from './pages/Invite';
import Downloadapp from './pages/Downloadapp';

import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import VipTask from './pages/VipTask';
import Bill from './pages/Bill';
import Settings from './pages/Settings';
import ModifyPassword from './pages/ModifyPassword';

function DashboardWrapper(props) {
  const navigate = useNavigate();
  return <Dashboard {...props} onNavigate={navigate} />;
}

function AppContent({ user, handleLogin, handleLogout, setUser, rentedHuts, setRentedHuts, avatar, setAvatar }) {
  const location = useLocation();
  
  // Clear stale login when landing on register or home
  useEffect(() => {
    const path = location.pathname;
    if (path === '/register' || path === '/') {
      localStorage.removeItem('hutvilla_user');
      localStorage.removeItem('isLoggedIn');
    }
  }, [location.pathname]);

  const hideBottomBar = !user || ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div style={{ paddingBottom: hideBottomBar ? 0 : '70px' }}>
      <Routes>
        {/* Default route is Register */}
        <Route path="/" element={<Register onRegister={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={user ? <DashboardWrapper user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/team" element={user ? <MyTeam user={user} /> : <Navigate to="/login" />} />
        <Route path="/contact" element={user ? <ManagerContact /> : <Navigate to="/login" />} />
        <Route path="/invite" element={user ? <Invite user={user} /> : <Navigate to="/login" />} />
        <Route path="/download" element={user ? <Downloadapp /> : <Navigate to="/login" />} />
        <Route path="/deposit" element={user ? <Deposit user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/withdraw" element={user ? <Withdraw user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/vip-task" element={user ? <VipTask user={user} setUser={setUser} rentedHuts={rentedHuts} setRentedHuts={setRentedHuts} /> : <Navigate to="/login" />} />
        <Route path="/bill" element={user ? <Bill /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} rentedHuts={rentedHuts} setAvatar={setAvatar} avatar={avatar} /> : <Navigate to="/login" />} />
        <Route path="/modifypassword" element={user ? <ModifyPassword user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideBottomBar && <BottomBar />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('https://via.placeholder.com/80');
  const [rentedHuts, setRentedHuts] = useState([]);

  const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const fetchHuts = async (phone) => {
    try {
      const res = await fetch('/api/huts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRentedHuts(data.huts);
      }
    } catch (err) {
      console.error('Failed to fetch huts:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('hutvilla_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn === 'true') {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.phone = normalizePhone(parsedUser.phone);
      setUser(parsedUser);
      setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');
      fetchHuts(parsedUser.phone);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (userData) => {
    const normalizedUser = {
      ...userData,
      phone: normalizePhone(userData.phoneNumber || userData.phone),
      nickname: userData.nickname || userData.name || 'User',
      role: userData.role || ''
    };
    
    setUser(normalizedUser);
    setAvatar(normalizedUser.avatar || 'https://via.placeholder.com/80');
    localStorage.setItem('hutvilla_user', JSON.stringify(normalizedUser));
    localStorage.setItem('isLoggedIn', 'true');
    
    await fetchHuts(normalizedUser.phone);
  };

  const handleLogout = () => {
    setUser(null);
    setAvatar('https://via.placeholder.com/80');
    setRentedHuts([]);
    localStorage.removeItem('hutvilla_user');
    localStorage.removeItem('isLoggedIn');
  };

  if (loading) {
    return (
      <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        user={user} 
        handleLogin={handleLogin}
        handleLogout={handleLogout} 
        setUser={setUser}
        rentedHuts={rentedHuts}
        setRentedHuts={setRentedHuts}
        avatar={avatar}
        setAvatar={setAvatar}
      />
    </Router>
  );
}

export default App;