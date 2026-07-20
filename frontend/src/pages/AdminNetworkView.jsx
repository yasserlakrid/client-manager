import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Mail } from 'lucide-react';
import { apiFetch } from '../api';
import SearchBar from '../components/SearchBar';
export default function AdminNetworkView({ account, t }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [network, setNetwork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    try {
      const res = await apiFetch('/network', {}, account);
      if (res.ok) setNetwork(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await apiFetch(`/accounts/search?q=${encodeURIComponent(query)}`, {}, account);
      if (res.ok) setResults(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (coworkerId) => {
    setMessage('');
    try {
      const res = await apiFetch('/network/invite', {
        method: 'POST',
        body: JSON.stringify({ coworkerId }),
      }, account);
      const data = await res.json();
      if (res.ok) {
        setMessage(t.inviteSent);
        setResults((prev) => prev.filter((r) => r.id !== coworkerId));
      } else {
        setMessage(data.error || t.inviteFailed);
      }
    } catch (err) {
      setMessage(t.inviteFailed);
    }
  };
  const [filtredResults, setFilteredResults] = useState([]);

useEffect(() => {
  handleSearch();
  setFilteredResults(results.filter((user) => !network.some((conn) => conn.coworkerId === user.id)));
} , [query] )

  return (
    <div>
      <div className="page-header">
        <h1>{t.networkTitle}</h1>
        <p>{t.networkSubtitle}</p>
      </div>

      {message && (
        <div className="info-banner" style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>{t.searchCoworkers}</h3>
        
 <SearchBar
            t={t}
            Icon={Search}
            setSearchQuery={setQuery}
            options={[
              { value: 'All', label: 'allStatuses' },
              { value: 'Active', label: 'active' },
              { value: 'Inactive', label: 'inactive' }
            ]}
            
            searchQuery={query}
          />
        {filtredResults.length > 0 &&  query !== '' && (
          <div style={{ marginTop: '20px' }}>
            {filtredResults.map((user) => (
              <div key={user.id} className="network-result-row">
                <div>
                  <strong>{user.name}</strong>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
                    <Mail size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {user.email}
                  </span>
                </div>
                <button className="btn-secondary" onClick={() => handleInvite(user.id)}>
                  <UserPlus size={16} />
                  {t.sendInvite}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{t.noAccountsFound}</p>
        )}
      </div>
       
        <div style={{ display: 'flex', gap: '12px' }}></div>
      <div className="card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} />
          {t.connectedCoworkers} ({network.length})
        </h3>
        {network.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>{t.noConnectedCoworkers}</p>
        ) : (
          network.map((conn) => (
            
            <div key={conn.id} className="network-result-row">
              <div>
                <strong>{conn.coworkerName}</strong>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.85rem' }}>
                  {t.connectedSince} {new Date(conn.respondedAt || conn.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span className="status-badge active">{t.connected}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
