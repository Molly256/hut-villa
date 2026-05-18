import React, { useEffect, useState } from 'react';
import './Downloadapp.css';

const Downloadapp = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Detect if user is on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    // Listen for the PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
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

  return (
    <div className="download-section">
      <div className="download-content">
        <h2>Get the Hut Villa App</h2>
        <p>Install our app for faster access, offline browsing, and a better experience.</p>
        
        <button className="install-btn" onClick={handleInstallClick}>
          Install App
        </button>
        
        <div className="install-steps">
          <p><strong>Manual install:</strong></p>
          <p>Android: Chrome → Menu ⋮ → Install app</p>
          <p>iPhone: Safari → Share → Add to Home Screen</p>
        </div>
      </div>
    </div>
  );
};

export default Downloadapp;