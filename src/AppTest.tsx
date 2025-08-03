import React from 'react';

const AppTest: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🎵 BondApp - Test Version</h1>
      <p>If you see this, the deployment works!</p>
      <p>Usuario: admin</p>
      <p>Contraseña: admin</p>
      <button onClick={() => alert('Button works!')}>Test Button</button>
    </div>
  );
};

export default AppTest;
