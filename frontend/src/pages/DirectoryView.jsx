import React from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function DirectoryView({ 
  filteredClients, 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  setShowAddClient, 
  setSelectedClient, 
  setCurrentView, 
  handleDeleteClient, 
  t 
}) {
  return (
    <div>
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{t.patientPortfolioTitle}</h1>
          <p>{t.patientPortfolioSubtitle}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddClient(true)}>
          <Plus size={18} /> {t.registerPatient}
        </button>
      </div>

      {/* Filter toolbar */}
      <SearchBar 
        t={t} 
        Icon={Search} 
        setSearchQuery={setSearchQuery} 
        options={[
          { value: 'All', label: 'allStatuses' },
          { value: 'Active', label: 'active' },
          { value: 'Inactive', label: 'inactive' }
        ]}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
      

      {/* Patients Table */}
      <div className="glass-card" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.patient}</th>
                <th>{t.totalBilled}</th>
                <th>{t.status}</th>
                <th>{t.appointments}</th>
                <th style={{ textAlign: 'right' }}>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedClient(client); setCurrentView('details'); }}>
                  <td style={{ fontWeight: '600' }}>
                    <div>{client.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>{client.email}</div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{client.value.toLocaleString()} DA</td>
                  <td>
                    <span className={`badge badge-${client.status === 'Active' ? 'active' : 'inactive'}`}>
                      {client.status === 'Active' ? t.active : t.inactive}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="var(--text-muted)" />
                      <span>{(client.appointments || []).filter(a => a.status === 'Scheduled').length} {t.scheduled}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', marginRight: '8px' }}
                      onClick={() => { setSelectedClient(client); setCurrentView('details'); }}
                    >
                      {t.viewDetails}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                    {t.noPatientsFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
