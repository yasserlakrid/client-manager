import React from 'react';
import { Users, TrendingUp, Calendar, DollarSign, Plus, Receipt, Clock } from 'lucide-react';

export default function DashboardView({ stats, clients, setShowAddClient, setSelectedClient, setCurrentView, t }) {
  return (
    <div>
      <div className="dashboard-header">
        <div className="header-title">
          <h1>{t.overviewTitle}</h1>
          <p>{t.overviewSubtitle}</p>
        </div>
        
      </div>

      {/* Metrics cards grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">{t.registeredPatients}</span>
            <span className="metric-value">{stats.totalClients}</span>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">{t.activePatients}</span>
            <span className="metric-value">{stats.activeClients}</span>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Calendar size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">{t.scheduledVisits}</span>
            <span className="metric-value">{stats.activeAppointments}</span>
          </div>
        </div>
        <div className="glass-card metric-card">
          <div className="metric-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <DollarSign size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">{t.totalBilled}</span>
            <span className="metric-value">{stats.totalRevenue.toLocaleString()} DA</span>
          </div>
        </div>
      </div>

      {/* Second row cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
        
        {/* Recent Transactions Card */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={20} color="var(--primary)" /> {t.recentPayments}
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t.receiptNo}</th>
                  <th>{t.patient}</th>
                  <th>{t.amount}</th>
                  <th>{t.method}</th>
                </tr>
              </thead>
              <tbody>
                {clients.flatMap(c => (c.payments || []).map(pay => ({ ...pay, patientName: c.name }))).slice(0, 5).map(pay => (
                  <tr key={pay.id}>
                    <td style={{ fontWeight: '500' }}>
                      <div>{pay.receiptNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{pay.date}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{pay.patientName}</td>
                    <td>{pay.amount.toLocaleString()} DA</td>
                    <td>
                      <span className="badge badge-active">
                        {pay.method === 'Card' ? t.card : pay.method === 'Cash' ? t.cash : pay.method === 'Insurance Claim' ? t.insuranceClaim : t.bankTransfer}
                      </span>
                    </td>
                  </tr>
                ))}
                {clients.flatMap(c => c.payments || []).length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                      {t.noPayments}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheduled Dentist appointments card */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--info)" /> {t.upcomingVisits}
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t.treatment}</th>
                  <th>{t.patient}</th>
                  <th>{t.schedule}</th>
                </tr>
              </thead>
              <tbody>
                {clients.flatMap(c => (c.appointments || []).map(apt => ({ ...apt, patientName: c.name }))).filter(a => a.status === 'Scheduled').slice(0, 5).map(apt => (
                  <tr key={apt.id}>
                    <td style={{ fontWeight: '500' }}>{apt.treatment}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{apt.patientName}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        {apt.date} • {apt.time}
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.flatMap(c => c.appointments || []).filter(a => a.status === 'Scheduled').length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                      {t.noScheduled}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
