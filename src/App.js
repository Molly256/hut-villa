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
import AdminTransactions from './pages/AdminTransactions';

function DashboardWrapper(props) {
  const navigate = useNavigate();
  return React.createElement(Dashboard, { ...props, onNavigate: navigate });
}

function AppContent({ user, handleLogin, handleLogout, setUser, rentedHuts, setRentedHuts, avatar, setAvatar }) {
  const location = useLocation();
  
  // FIXED: Don't clear storage on register page if user is already logged in
  useEffect(() => {
    const path = location.pathname;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if ((path === '/register' || path === '/') && !isLoggedIn) {
      localStorage.removeItem('hutvilla_user');
      localStorage.removeItem('isLoggedIn');
    }
  }, [location.pathname]);

  const hideBottomBar = !user || ['/', '/login', '/register'].includes(location.pathname);

  return React.createElement('div', { style: { paddingBottom: hideBottomBar ? 0 : '70px' } },
    React.createElement(Routes, null,
      React.createElement(Route, { path: '/', element: React.createElement(Register, { onRegister: handleLogin }) }),
      React.createElement(Route, { path: '/register', element: React.createElement(Register, { onRegister: handleLogin }) }),
      React.createElement(Route, { path: '/login', element: React.createElement(Login, { onLogin: handleLogin }) }),
      
      React.createElement(Route, { path: '/dashboard', element: user ? React.createElement(DashboardWrapper, { user: user, handleLogout: handleLogout }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/team', element: user ? React.createElement(MyTeam, { user: user }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/contact', element: user ? React.createElement(ManagerContact, null) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/invite', element: user ? React.createElement(Invite, { user: user }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/download', element: user ? React.createElement(Downloadapp, null) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/deposit', element: user ? React.createElement(Deposit, { user: user, setUser: setUser }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/withdraw', element: user ? React.createElement(Withdraw, { user: user, setUser: setUser }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/vip-task', element: user ? React.createElement(VipTask, { user: user, setUser: setUser, rentedHuts: rentedHuts, setRentedHuts: setRentedHuts }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/bill', element: user ? React.createElement(Bill, null) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/settings', element: user ? React.createElement(Settings, { user: user, setUser: setUser, rentedHuts: rentedHuts, setAvatar: setAvatar, avatar: avatar }) : React.createElement(Navigate, { to: '/login' }) }),
      React.createElement(Route, { path: '/modifypassword', element: user ? React.createElement(ModifyPassword, { user: user, setUser: setUser }) : React.createElement(Navigate, { to: '/login' }) }),
      
      React.createElement(Route, { path: '/admin/transactions', element: user && user.role === 'admin' ? React.createElement(AdminTransactions, { user: user }) : React.createElement(Navigate, { to: '/dashboard' }) }),
      
      React.createElement(Route, { path: '*', element: React.createElement(Navigate, { to: '/' }) })
    ),
    !hideBottomBar && React.createElement(BottomBar, null)
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
        setRentedHuts(data.huts || []);
      }
    } catch (err) {
      console.error('Failed to fetch huts:', err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('hutvilla_user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedUser && isLoggedIn === 'true') {
      try {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.phone = normalizePhone(parsedUser.phone);
        parsedUser.balance = Number(parsedUser.balance) || 0;
        parsedUser.role = parsedUser.role || 'user';
        setUser(parsedUser);
        setAvatar(parsedUser.avatar || 'https://via.placeholder.com/80');
        fetchHuts(parsedUser.phone);
      } catch (e) {
        localStorage.removeItem('hutvilla_user');
        localStorage.removeItem('isLoggedIn');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (userData) => {
    const normalizedUser = {
      ...userData,
      phone: normalizePhone(userData.phoneNumber || userData.phone),
      nickname: userData.nickname || userData.name || 'User',
      balance: Number(userData.balance) || 0,
      role: userData.role || 'user'
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
    return React.createElement('div', { 
      style: { background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } 
    }, 'Loading...');
  }

  return React.createElement(Router, null,
    React.createElement(AppContent, {
      user: user,
      handleLogin: handleLogin,
      handleLogout: handleLogout,
      setUser: setUser,
      rentedHuts: rentedHuts,
      setRentedHuts: setRentedHuts,
      avatar: avatar,
      setAvatar: setAvatar
    })
  );
}

export default App;