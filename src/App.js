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
import Admin from './admin';
import AdminTransactions from './adminTransactions';

function DashboardWrapper(props) {
  const navigate = useNavigate();
  return <Dashboard {...props} onNavigate={navigate} />;
}

function AppContent({ user, handleLogin, handleLogout, setUser, rentedHuts, setRentedHuts, avatar, setAvatar }) {
  const location = useLocation();
  
  // hide bottom bar on auth + admin pages
  const hideBottomBar = !user || ['/', '/login', '/register', '/admin', '/admin/transactions'].includes(location.pathname);

  return (
    <div style={{ paddingBottom: hideBottomBar ? 0 : '70px' }}>
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />} />
        
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
        
        {/* Admin routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        
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

  // FIXED: Keep full phone number, don't strip 256
  const normalizePhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('hutvilla_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn === 'true') {
      const parsedUser = JSON.parse(storedUser);
      parsedUser.phone = normalizePhone(parsedUser.phone);
      setUser(parsedUser);
      setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');
      
      const huts = localStorage.getItem(`huts_${parsedUser.phone}`);
      setRentedHuts(huts ? JSON.parse(huts) : []);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    // FIXED: Map phoneNumber from DB to phone for frontend
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
    
    const huts = localStorage.getItem(`huts_${normalizedUser.phone}`);
    setRentedHuts(huts ? JSON.parse(huts) : []);
  };

  const handleLogout = () => {
    setUser(null);
    setAvatar('https://via.placeholder.com/80');
    setRentedHuts([]);
    localStorage.removeItem('hutvilla_user');
    localStorage.removeItem('isLoggedIn');
  };

  if (loading) {
    return <div style={{ background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
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