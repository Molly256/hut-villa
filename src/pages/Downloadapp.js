import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  downloadSection: {
    display: 'flex',
    justifyContent: 'center',
    padding: '50px 20px',
    background: 'linear-gradient(135deg, #fff5f8 0%, #ffe6f0 100%)',
    minHeight: '100vh'
  },
  downloadContent: {
    textAlign: 'center',
    maxWidth: '500px',
    background: 'white',
    padding: '40px 30px',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(255, 194, 209, 0.3)'
  },
  h2: {
    color: '#d63384',
    marginBottom: '12px',
    fontSize: '28px'
  },
  p: {
    color: '#555',
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  installBtn: {
    background: '#d63384',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s'
  },
  installedBox: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '12px'
  },
  installSteps: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#666'
  },
  installStepsP: {
    margin: '5px 0'
  },
  backBtn: {
    marginBottom: '15px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#333',
    color: '#fff',
    cursor: 'pointer'
  }
};

const Downloadapp = () => {
  const navigate = useNavigate();
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const installed = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    setIsInstalled(installed);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return React.createElement('div', { style: styles.downloadSection },
    React.createElement('div', { style: styles.downloadContent },
      React.createElement('button', {
        onClick: () => navigate('/dashboard'),
        style: styles.backBtn
      }, '← Back'),
      
      React.createElement('h2', { style: styles.h2 }, 'Get the Hut Villa App'),
      React.createElement('p', { style: styles.p }, 
        'Install our app for faster access, offline browsing, and a better experience.'
      ),
      
      isInstalled 
        ? React.createElement('div', { style: styles.installedBox }, '✅ Already installed')
        : deferredPrompt 
          ? React.createElement('button', {
              style: styles.installBtn,
              onClick: handleInstallClick,
              onMouseOver: (e) => {
                e.target.style.background = '#b0256a';
                e.target.style.transform = 'translateY(-2px)';
              },
              onMouseOut: (e) => {
                e.target.style.background = '#d63384';
                e.target.style.transform = 'translateY(0)';
              }
            }, 'Install App')
          : null,
      
      React.createElement('div', { style: styles.installSteps },
        React.createElement('p', { style: styles.installStepsP },
          React.createElement('strong', null, 'Manual install:')
        ),
        React.createElement('p', { style: styles.installStepsP },
          'Android: Chrome → Menu ⋮ → Install app'
        ),
        React.createElement('p', { style: styles.installStepsP },
          'iPhone: Safari → Share → Add to Home Screen'
        )
      )
    )
  );
};

export default Downloadapp;