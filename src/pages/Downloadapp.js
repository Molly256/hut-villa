import React, { useEffect, useState } from 'react';

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
  installSteps: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#666'
  },
  installStepsP: {
    margin: '5px 0'
  }
};

const Downloadapp = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return React.createElement('div', { style: styles.downloadSection },
    React.createElement('div', { style: styles.downloadContent },
      React.createElement('h2', { style: styles.h2 }, 'Get the Hut Villa App'),
      React.createElement('p', { style: styles.p }, 
        'Install our app for faster access, offline browsing, and a better experience.'
      ),
      React.createElement('button', {
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
      }, 'Install App'),
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