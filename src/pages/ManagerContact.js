import React from "react";
import { useNavigate } from 'react-router-dom';

const managers = [
  {
    id: 1,
    name: "Support Manager",
    role: "24/7 Customer Support",
    whatsapp: "+1234567890",
    telegram: "@hutvilla_support",
    avatar: "/images/default-avatar.png"
  },
  {
    id: 2,
    name: "VIP Manager",
    role: "VIP & Investment Support",
    whatsapp: "+1234567891",
    telegram: "@hutvilla_vip",
    avatar: "/images/default-avatar.png"
  },
  {
    id: 3,
    name: "Technical Support",
    role: "Account & Technical Issues",
    whatsapp: "+1234567892",
    telegram: "@hutvilla_tech",
    avatar: "/images/default-avatar.png"
  }
];

export default function Contact() {
  const navigate = useNavigate();

  const handleWhatsApp = (number) => {
    window.open(`https://wa.me/${number.replace(/\+/g, '')}`, "_blank");
  };

  const handleTelegram = (username) => {
    window.open(`https://t.me/${username.replace('@', '')}`, "_blank");
  };

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ 
          marginBottom: '20px', 
          padding: '10px 20px', 
          borderRadius: '8px', 
          border: 'none', 
          background: '#333', 
          color: '#fff', 
          fontWeight: '600', 
          cursor: 'pointer' 
        }}
      >
        ← Back
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Contact Manager</h2>
      <p style={{ textAlign: "center", color: "#666", fontSize: "14px", marginBottom: "25px" }}>
        Get help from our support team 24/7
      </p>

      {managers.map(manager => (
        <div 
          key={manager.id}
          style={{ 
            background: "#fff", 
            padding: "20px", 
            borderRadius: "12px", 
            marginBottom: "15px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
            <img 
              src={manager.avatar} 
              alt={manager.name}
              style={{ 
                width: "50px", 
                height: "50px", 
                borderRadius: "50%", 
                objectFit: "cover",
                marginRight: "15px"
              }} 
            />
            <div>
              <h4 style={{ margin: "0 0 4px" }}>{manager.name}</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{manager.role}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleWhatsApp(manager.whatsapp)}
              style={{ 
                flex: 1,
                padding: "12px", 
                background: "#25D366", 
                color: "#fff", 
                border: "none", 
                borderRadius: "8px", 
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleTelegram(manager.telegram)}
              style={{ 
                flex: 1,
                padding: "12px", 
                background: "#0088cc", 
                color: "#fff", 
                border: "none", 
                borderRadius: "8px", 
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Telegram
            </button>
          </div>
        </div>
      ))}

      <div style={{ 
        marginTop: "25px", 
        padding: "15px", 
        background: "#fff8f0", 
        borderRadius: "8px",
        fontSize: "13px",
        textAlign: "center"
      }}>
        <p style={{ margin: 0 }}>
          Average response time: <strong>5 minutes</strong><br/>
          Available 24/7
        </p>
      </div>
    </div>
  );
}