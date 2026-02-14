import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <footer style={{
                padding: 'var(--spacing-xl) 0',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: 'var(--spacing-2xl)'
            }}>
                <div className="container">
                    <p>© {new Date().getFullYear()} SunSeeker. Chase the light.</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
