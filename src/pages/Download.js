import { useNavigate } from 'react-router-dom';

export default function Download() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '40px 20px', 
      background: '#000', 
      minHeight: '100vh', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <button 
        onClick={() => navigate('/dashboard')} 
        style={{ 
          position: 'absolute',
          top: '20px',
          left: '20px',
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

      <div style={{ fontSize: '60px', marginBottom: '20px' }}>📱</div>
      
      <h2 style={{ fontSize: '28px', marginBottom: '10px', color: '#ff4f7a' }}>
        App Download
      </h2>
      
      <h3 style={{ fontSize: '22px', marginBottom: '15px' }}>
        Coming Soon
      </h3>
      
      <p style={{ fontSize: '16px', color: '#999', maxWidth: '300px', lineHeight: '1.5' }}>
        We’re working on the PWA app right now. 
        It’ll be available here once it’s ready.
      </p>
    </div>
  );
} // <- only this, no 's'