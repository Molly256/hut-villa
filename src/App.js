import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTeam from './pages/MyTeam';
import ManagerContact from './pages/ManagerContact';
import Invite from './pages/Invite';
import Download from './pages/Download';

// New pages
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

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState('https://via.placeholder.com/80');
  const [rentedHuts, setRentedHuts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('hutvilla_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn === 'true') {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');
      
      // Load rented huts for this user
      const huts = localStorage.getItem(`huts_${parsedUser.phone}`);
      setRentedHuts(huts ? JSON.parse(huts) : []);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setAvatar(userData.avatar || 'https://via.placeholder.com/80');
    localStorage.setItem('hutvilla_user', JSON.stringify(userData));
    localStorage.setItem('isLoggedIn', 'true');
    
    const huts = localStorage.getItem(`huts_${userData.phone}`);
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
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={user ? <DashboardWrapper user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/team" element={user ? <MyTeam user={user} /> : <Navigate to="/login" />} />
        <Route path="/contact" element={user ? <ManagerContact /> : <Navigate to="/login" />} />
        <Route path="/invite" element={user ? <Invite user={user} /> : <Navigate to="/login" />} />
        <Route path="/download" element={user ? <Download /> : <Navigate to="/login" />} />
        
        {/* New routes */}
        <Route path="/deposit" element={user ? <Deposit user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/withdraw" element={user ? <Withdraw user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/vip-task" element={user ? <VipTask user={user} setUser={setUser} rentedHuts={rentedHuts} setRentedHuts={setRentedHuts} /> : <Navigate to="/login" />} />
        <Route path="/bill" element={user ? <Bill /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} rentedHuts={rentedHuts} setAvatar={setAvatar} avatar={avatar} /> : <Navigate to="/login" />} />
        <Route path="/modifypassword" element={user ? <ModifyPassword user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;