import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InstallApp() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
        ← Back
      </button>

      <div style={styles.card}>
        <div style={styles.icon}>📱</div>
        <h2 style={styles.title}>Install Hut Villa App</h2>
        <p style={styles.subtitle}>Get faster access and work offline</p>

        {isInstalled && (
          <div style={styles.successBox}>
            ✅ App is already installed on your device
          </div>
        )}

        {!isInstalled && deferredPrompt && (
          <>
            <button onClick={handleInstallClick} style={styles.installBtn}>
              Install Now
            </button>
            <p style={styles.note}>Tap "Install" and confirm to add to your home screen</p>
          </>
        )}

        {!isInstalled && !deferredPrompt && !isIOS && (
          <div style={styles.instructions}>
            <h3>How to Install:</h3>
            <ol>
              <li>Open Chrome browser menu ⋮</li>
              <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong></li>
              <li>Confirm and the app will appear on your home screen</li>
            </ol>
          </div>
        )}

        {isIOS && (
          <div style={styles.instructions}>
            <h3>How to Install on iPhone/iPad:</h3>
            <ol>
              <li>Tap the <span style={styles.shareIcon}>⎋</span> Share button</li>
              <li>Scroll and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> to confirm</li>
            </ol>
            <p style={styles.note}>Safari only. Chrome on iOS doesn’t support PWA install.</p>
          </div>
        )}
      </div>
    </div>
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
  instructionsH3: {
    marginTop: 0,
    fontSize: '16px',
    marginBottom: '10px',
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
