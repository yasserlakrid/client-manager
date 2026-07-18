import React from 'react';
import { HeartPulse, LayoutDashboard, Users, Languages, Sun, Moon } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, setSelectedClient, theme, setTheme, lang, setLang, t }) {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <HeartPulse size={28} color="#6366f1" />
        <span className="logo-text">Aura Dental</span>
      </div>

      <nav className="nav-links">
        <div 
          className={`nav-item ${currentView === 'clients' ? 'active' : ''}`}
          onClick={() => { setCurrentView('clients'); setSelectedClient(null); }}
        >
          <Users size={20} />
          <span>{t.patients}</span>
        </div>
        <div 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setCurrentView('dashboard'); setSelectedClient(null); }}
        >
          <LayoutDashboard size={20} />
          <span>{t.dashboard}</span>
        </div>
        
      </nav>

      <div className="theme-toggle-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div 
          className="nav-item"
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        >
          <Languages size={20} />
          <span>{lang === 'en' ? 'Français' : 'English'}</span>
        </div>
        
        <div 
          className="nav-item"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>
            {theme === 'dark' 
              ? (lang === 'en' ? 'Light Mode' : 'Mode Clair') 
              : (lang === 'en' ? 'Dark Mode' : 'Mode Sombre')
            }
          </span>
        </div>
      </div>
    </aside>
  );
}
