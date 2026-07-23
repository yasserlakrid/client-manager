import React from 'react';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Languages,
  Sun,
  Moon,
  TrendingUp,
  Network,
  DollarSign,
  LogOut,
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  setSelectedClient,
  theme,
  setTheme,
  lang,
  setLang,
  t,
  account,
  onLogout,
}) {
  const isAdmin = account?.role === 'admin';
function toggleTheme() {
  setTheme(theme === 'dark' ? 'light' : 'dark')
  localStorage.setItem('theme', theme === 'dark' ? 'light' : 'dark');
}
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <HeartPulse size={28} color="#800f2f" />
        <span className="logo-text">Lakrid Dental</span>
      </div>

      {account && (
        <div className="user-info">
          <span className="user-name">{account.name}</span>
          <span className={`role-badge ${account.role}`}>{account.role}</span>
        </div>
      )}

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
        <div
          className={`nav-item ${currentView === 'finance' ? 'active' : ''}`}
          onClick={() => { setCurrentView('finance'); setSelectedClient(null); }}
        >
          <TrendingUp size={20} />
          <span>{t.financeNav}</span>
        </div>

        {isAdmin && (
          <>
            <div
              className={`nav-item ${currentView === 'network' ? 'active' : ''}`}
              onClick={() => { setCurrentView('network'); setSelectedClient(null); }}
            >
              <Network size={20} />
              <span>{t.teamNetwork}</span>
            </div>
            <div
              className={`nav-item ${currentView === 'admin-income' ? 'active' : ''}`}
              onClick={() => { setCurrentView('admin-income'); setSelectedClient(null); }}
            >
              <DollarSign size={20} />
              <span>{t.networkIncome}</span>
            </div>
          </>
        )}
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
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>
            {theme === 'dark'
              ? (lang === 'en' ? 'Light Mode' : 'Mode Clair')
              : (lang === 'en' ? 'Dark Mode' : 'Mode Sombre')
            }
          </span>
        </div>

        <div className="nav-item logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          <span>{t.logout}</span>
        </div>
      </div>
    </aside>
  );
}
