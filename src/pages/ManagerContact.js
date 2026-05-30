import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleWhatsApp = (number) => {
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
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
    
    React.createElement('div', {
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
          src: '/images/default-avatar.png',
          alt: 'Manager',
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
          React.createElement('h4', { style: { margin: "0 0 4px" } }, 'Manager'),
          React.createElement('p', { style: { margin: 0, fontSize: "13px", color: "#666" } }, 'Support Team')
        )
      ),
      React.createElement('button', {
        onClick: () => handleWhatsApp('+447412283536'),
        style: { 
          width: "100%",
          padding: "12px", 
          background: "#25D366", 
          color: "#fff", 
          border: "none", 
          borderRadius: "8px", 
          fontWeight: "bold",
          cursor: "pointer",
          fontSize: "14px"
        }
      }, 'Chat on WhatsApp')
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