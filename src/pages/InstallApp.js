import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InstallApp() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    // Capture install prompt for Android/Chrome
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Clear prompt after install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
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

  return React.createElement('div', { style: styles.page },
    React.createElement('button', { 
      onClick: () => navigate('/dashboard'), 
      style: styles.backBtn 
    }, '← Back'),
    React.createElement('div', { style: styles.card },
      React.createElement('div', { style: styles.icon }, '📱'),
      React.createElement('h2', { style: styles.title }, 'Install Hut Villa App'),
      React.createElement('p', { style: styles.subtitle }, 'Get faster access and work offline'),
      
      isInstalled && React.createElement('div', { style: styles.successBox },
        '✅ App is already installed on your device'
      ),
      
      !isInstalled && deferredPrompt && React.createElement(React.Fragment, null,
        React.createElement('button', { 
          onClick: handleInstallClick, 
          style: styles.installBtn 
        }, 'Install Now'),
        React.createElement('p', { style: styles.note },
          'Tap "Install" and confirm to add to your home screen'
        )
      ),
      
      !isInstalled && !deferredPrompt && !isIOS && React.createElement('div', { style: styles.instructions },
        React.createElement('h3', { style: { marginTop: 0, fontSize: '16px', marginBottom: '10px' } }, 'How to Install:'),
        React.createElement('ol', { style: { paddingLeft: '20px', margin: 0 } },
          React.createElement('li', null, 'Open this page in Chrome'),
          React.createElement('li', null, 
            'Tap menu ⋮ and select ', 
            React.createElement('strong', null, '"Install App"'), ' or ', 
            React.createElement('strong', null, '"Add to Home Screen"')
          ),
          React.createElement('li', null, 'Confirm and the app will appear on your home screen')
        )
      ),
      
      isIOS && React.createElement('div', { style: styles.instructions },
        React.createElement('h3', { style: { marginTop: 0, fontSize: '16px', marginBottom: '10px' } }, 
          'How to Install on iPhone/iPad:'
        ),
        React.createElement('ol', { style: { paddingLeft: '20px', margin: 0 } },
          React.createElement('li', null, 
            'Open this page in Safari'
          ),
          React.createElement('li', null, 
            'Tap the ', React.createElement('span', { style: styles.shareIcon }, '⎋'), ' Share button'
          ),
          React.createElement('li', null, 
            'Scroll and tap ', React.createElement('strong', null, '"Add to Home Screen"')
          ),
          React.createElement('li', null, 'Tap ', React.createElement('strong', null, '"Add"'), ' to confirm')
        ),
        React.createElement('p', { style: styles.note },
          'Safari only. Chrome on iOS doesn’t support PWA install.'
        )
      )
    )
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f5',
    padding: '20px 16px',
  },
  backBtn: {
    marginBottom: '20px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    background: '#333',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    margin: '0 auto',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '15px',
    color: '#666',
    marginBottom: '24px',
  },
  installBtn: {
    width: '100%',
    padding: '14px',
    background: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
  },
  successBox: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
  },
  instructions: {
    textAlign: 'left',
    background: '#f9f9f9',
    padding: '16px',
    borderRadius: '12px',
  },
  note: {
    fontSize: '13px',
    color: '#666',
    marginTop: '10px',
  },
  shareIcon: {
    fontSize: '18px',
    display: 'inline-block',
    transform: 'rotate(-45deg)',
  },
};

export default InstallApp;