import React, { useState } from 'react';
import { HeartPulse, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { login, signup } from '../api';

export default function AuthPage({ theme, lang, t, onAuthSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('coworker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let account;
      if (mode === 'login') {
        account = await login(email, password);
      } else {
        if (!name.trim()) {
          setError(t.nameRequired);
          setLoading(false);
          return;
        }
        account = await signup(name.trim(), email, password, role);
      }
      onAuthSuccess(account);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" data-theme={theme}>
      <div className="auth-card">
        <div className="auth-logo">
          <HeartPulse size={36} color="#6366f1" />
          <h1>Lakrid Dental</h1>
          <p>{mode === 'login' ? t.authLoginSubtitle : t.authSignupSubtitle}</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            <LogIn size={16} />
            {t.login}
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            <UserPlus size={16} />
            {t.signup}
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label>{t.fullName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>{t.emailAddress}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
              required
            />
          </div>

          <div className="form-group">
            <label>{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={4}
            />
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>{t.accountType}</label>
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-option ${role === 'coworker' ? 'selected' : ''}`}
                  onClick={() => setRole('coworker')}
                >
                  <span className="role-label">{t.coworkerRole}</span>
                  <span className="role-desc">{t.coworkerRoleDesc}</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === 'admin' ? 'selected' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  <span className="role-label">{t.adminRole}</span>
                  <span className="role-desc">{t.adminRoleDesc}</span>
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading
              ? t.loading
              : mode === 'login'
                ? t.login
                : t.createAccount}
          </button>
        </form>
      </div>
    </div>
  );
}
