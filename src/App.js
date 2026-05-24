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
  return React.createElement(Dashboard, { ...props, onNavigate: navigate });
}

function AppContent({ user, handleLogin, handleLogout, setUser, rentedHuts, setRentedHuts, avatar, setAvatar }) {
  const location = useLocation();
  
  // hide bottom bar on auth + admin pages
  const hideBottomBar = !user || ['/', '/login', '/register', '/admin', '/admin/transactions'].includes(location.pathname);

  return React.createElement('div', 
    { style: { paddingBottom: hideBottomBar ? 0 : '70px' } },
    React.createElement(Routes, null,
      React.createElement(Route, { 
        path: "/", 
        element: !user ? React.createElement(Login, { onLogin: handleLogin }) : React.createElement(Navigate, { to: "/dashboard" })
      }),
      React.createElement(Route, { 
        path: "/login", 
        element: !user ? React.createElement(Login, { onLogin: handleLogin }) : React.createElement(Navigate, { to: "/dashboard" })
      }),
      React.createElement(Route, { 
        path: "/register", 
        element: !user ? React.createElement(Register, { onRegister: handleLogin }) : React.createElement(Navigate, { to: "/dashboard" })
      }),
      React.createElement(Route, { 
        path: "/dashboard", 
        element: user ? React.createElement(DashboardWrapper, { user, handleLogout }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/team", 
        element: user ? React.createElement(MyTeam, { user }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/contact", 
        element: user ? React.createElement(ManagerContact, null) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/invite", 
        element: user ? React.createElement(Invite, { user }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/download", 
        element: user ? React.createElement(Downloadapp, null) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/deposit", 
        element: user ? React.createElement(Deposit, { user, setUser }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/withdraw", 
        element: user ? React.createElement(Withdraw, { user, setUser }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/vip-task", 
        element: user ? React.createElement(VipTask, { user, setUser, rentedHuts, setRentedHuts }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/bill", 
        element: user ? React.createElement(Bill, null) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/settings", 
        element: user ? React.createElement(Settings, { user, setUser, rentedHuts, setAvatar, avatar }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { 
        path: "/modifypassword", 
        element: user ? React.createElement(ModifyPassword, { user, setUser }) : React.createElement(Navigate, { to: "/login" })
      }),
      React.createElement(Route, { path: "/admin", element: React.createElement(Admin, null) }),
      React.createElement(Route, { path: "/admin/transactions", element: React.createElement(AdminTransactions, null) }),
      React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/" }) })
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
    return React.createElement('div', 
      { style: { background: '#000', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      'Loading...'
    );
  }

  return React.createElement(Router, null,
    React.createElement(AppContent, { 
      user, 
      handleLogin,
      handleLogout, 
      setUser,
      rentedHuts,
      setRentedHuts,
      avatar,
      setAvatar
    })
  );
}

export default App;