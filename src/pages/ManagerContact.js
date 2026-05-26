import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/managers')
      .then(res => res.json())
      .then(data => {
        setManagers(data.managers || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load managers:', err);
        setLoading(false);
      });
  }, []);

  const handleWhatsApp = (number) => {
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const handleTelegram = (username) => {
    if (!username) return;
    const cleanUsername = username.replace('@', '');
    window.open(`https://t.me/${cleanUsername}`, "_blank");
  };

  if (loading) {
    return React.createElement('div', {
      style: { 
        padding: "20px", 
        background: "#f5f5f5", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, 'Loading...');
  }

  return React.createElement('div', { 
    style: { padding: "20px", background: "#f5f5f5", minHeight: "100vh" } 
  },
    React.createElement('button', {
      onClick: () => navigate('/dashboard'),
      style: { 
        marginBottom: '20px', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        border: 'none', 
        background: '#333', 
        color: '#fff', 
        fontWeight: '600', 
        cursor: 'pointer' 
      }
    }, '← Back'),
    React.createElement('h2', { 
      style: { textAlign: "center", marginBottom: "10px" } 
    }, 'Contact Manager'),
    React.createElement('p', { 
      style: { textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "25px" } 
    }, 'Get help from our support team 24/7'),
    
    managers.length === 0 
      ? React.createElement('div', {
          style: { 
            textAlign: "center", 
            padding: "40px 20px", 
            color: "#666",
            background: "#fff",
            borderRadius: "12px"
          }
        }, 'No managers available right now. Please try again later.')
      : managers.map(manager => 
          React.createElement('div', {
            key: manager.id,
            style: { 
              background: "#fff", 
              padding: "20px", 
              borderRadius: "12px", 
              marginBottom: "15px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }
          },
            React.createElement('div', { 
              style: { display: "flex", alignItems: "center", marginBottom: "15px" } 
            },
              React.createElement('img', {
                src: manager.avatar || '/images/default-avatar.png',
                alt: manager.name,
                onError: (e) => e.target.src = '/images/default-avatar.png',
                style: { 
                  width: "50px", 
                  height: "50px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  marginRight: "15px"
                }
              }),
              React.createElement('div', null,
                React.createElement('h4', { style: { margin: "0 0 4px" } }, manager.name),
                React.createElement('p', { style: { margin: 0, fontSize: "13px", color: "#666" } }, manager.role)
              )
            ),
            React.createElement('div', { style: { display: "flex", gap: "10px" } },
              React.createElement('button', {
                onClick: () => handleWhatsApp(manager.whatsapp),
                disabled: !manager.whatsapp,
                style: { 
                  flex: 1,
                  padding: "12px", 
                  background: manager.whatsapp ? "#25D366" : "#ccc", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontWeight: "bold",
                  cursor: manager.whatsapp ? "pointer" : "not-allowed",
                  fontSize: "14px"
                }
              }, 'WhatsApp'),
              React.createElement('button', {
                onClick: () => handleTelegram(manager.telegram),
                disabled: !manager.telegram,
                style: { 
                  flex: 1,
                  padding: "12px", 
                  background: manager.telegram ? "#0088cc" : "#ccc", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontWeight: "bold",
                  cursor: manager.telegram ? "pointer" : "not-allowed",
                  fontSize: "14px"
                }
              }, 'Telegram')
            )
          )
        ),
    
    React.createElement('div', {
      style: { 
        marginTop: "25px", 
        padding: "15px", 
        background: "#fff8f0", 
        borderRadius: "8px",
        fontSize: "13px",
        textAlign: "center"
      }
    },
      React.createElement('p', { style: { margin: 0 } },
        'Average response time: ',
        React.createElement('strong', null, '5 minutes'),
        React.createElement('br', null),
        'Available 24/7'
      )
    )
  );
}