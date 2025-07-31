// src/components/Loader.js
import React from 'react';

const Loader = () => (
    <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
    }}>
        <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F29F67',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <span style={{
            color: '#6c757d',
            fontSize: '1rem',
            fontWeight: '500'
        }}>Loading...</span>
        <style jsx>{`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export default Loader;