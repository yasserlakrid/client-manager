import React from 'react';
import { ArrowLeft, Trash2, Calendar, Plus } from 'lucide-react';

export default function PatientDetailView({
  selectedClient,
  setSelectedClient,
  setCurrentView,
  handleUpdateStatus,
  handleDeleteClient,
  detailTab,
  setDetailTab,
  setShowAddProject,
  setShowAddInvoice,
  handleDeletePayment,
  handleAddLog,
  newLogData,
  setNewLogData,
  t,
  lang
}) {
  return (
    <>
    
     <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '10px' }}
                onClick={() => { setCurrentView('clients'); setSelectedClient(null); }}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{t.patientFile}</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.patientFileSubtitle}</p>
              </div>
            </div>

            <div className="details-layout">
              {/* Left Profile Sidebar */}
              <div className="glass-card profile-card">
                <div className="profile-avatar">
                  {selectedClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h2 className="profile-name">{selectedClient.name}</h2>
                
                {/* Status Picker dropdown */}
                <div style={{ width: '100%', marginBottom: '20px' }}>
                  <select
                    className="select-filter"
                    style={{ width: '100%', textAlign: 'center' }}
                    value={selectedClient.status}
                    onChange={(e) => handleUpdateStatus(selectedClient.id, e.target.value)}
                  >
                    <option value="Active">{t.activePatientLabel}</option>
                    <option value="Inactive">{t.inactivePatientLabel}</option>
                  </select>
                </div>

                <div className="profile-details-list">
                  <div className="profile-detail-item">
                    <span className="profile-detail-label">Email</span>
                    <span className="profile-detail-val">{selectedClient.email || (lang === 'en' ? 'Not recorded' : 'Non renseigné')}</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="profile-detail-label">Phone</span>
                    <span className="profile-detail-val">{selectedClient.phone || 'Not recorded'}</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="profile-detail-label">{t.totalBilled}</span>
                    <span className="profile-detail-val" style={{ fontWeight: '600', color: 'var(--success)' }}>
                      {selectedClient.value.toLocaleString()} DA
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', marginTop: '30px', justifyContent: 'center' }}
                  onClick={() => handleDeleteClient(selectedClient.id)}
                >
                  <Trash2 size={16} /> {t.deletePatientRecord}
                </button>
              </div>

              {/* Right workspace panel with tabs */}
              <div className="glass-card" style={{ minHeight: '480px' }}>
                <div className="tabs-header">
                  <button 
                    className={`tab-btn ${detailTab === 'appointments' ? 'active' : ''}`}
                    onClick={() => setDetailTab('appointments')}
                  >
                    {t.appointments} ({(selectedClient.appointments || []).length})
                  </button>
                  <button 
                    className={`tab-btn ${detailTab === 'payments' ? 'active' : ''}`}
                    onClick={() => setDetailTab('payments')}
                  >
                    {t.billingPayments} ({(selectedClient.payments || []).length})
                  </button>
                  <button 
                    className={`tab-btn ${detailTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setDetailTab('timeline')}
                  >
                    {t.clinicalLog} ({(selectedClient.timeline || []).length})
                  </button>
                </div>

                {/* Tab Content: Appointments */}
                {detailTab === 'appointments' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '1.1rem' }}>{t.appointmentSchedules}</h4>
                      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setShowAddProject(true)}>
                        <Plus size={16} /> {t.newAppointmentBtn}
                      </button>
                    </div>

                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>{t.transactionDate}</th>
                            <th>{t.timeSlot}</th>
                            <th>{t.treatment}</th>
                            <th>{t.status}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedClient.appointments || []).map(proj => (
                            <tr key={proj.id}>
                              <td style={{ fontWeight: '600' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Calendar size={14} color="var(--text-secondary)" />
                                  {proj.date}
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-secondary)' }}>{proj.time}</td>
                              <td style={{ fontWeight: '500' }}>{proj.treatment}</td>
                              <td>
                                <span className={`badge ${
                                  proj.status === 'Completed' ? 'badge-active' : 
                                  proj.status === 'Scheduled' ? 'badge-lead' : 'badge-inactive'
                                }`}>
                                  {proj.status === 'Completed' ? t.completed : proj.status === 'Scheduled' ? t.scheduled : t.cancelled}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {(selectedClient.appointments || []).length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px 0' }}>
                                {t.noAppointmentsRecord}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Content: Payments */}
                {detailTab === 'payments' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '1.1rem' }}>{t.billingLedger}</h4>
                      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setShowAddInvoice(true)}>
                        <Plus size={16} /> {t.newPaymentBtn}
                      </button>
                    </div>

                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>{t.receiptNo}</th>
                            <th>{t.transactionDate}</th>
                            <th>{t.amount}</th>
                            <th>{t.method}</th>
                            <th>{t.status}</th>
                            <th style={{ textAlign: 'right' }}>{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedClient.payments || []).map(inv => (
                            <tr key={inv.id}>
                              <td style={{ fontWeight: '600' }}>{inv.receiptNumber}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{inv.date}</td>
                              <td style={{ fontWeight: '500' }}>{inv.amount.toLocaleString()} DA</td>
                              <td>
                                {inv.method === 'Card' ? t.card : inv.method === 'Cash' ? t.cash : inv.method === 'Insurance Claim' ? t.insuranceClaim : t.bankTransfer}
                              </td>
                              <td>
                                <span className={`badge badge-${inv.status.toLowerCase()}`}>
                                  {inv.status === 'Paid' ? t.paidCompleted : t.pendingReview}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                  onClick={() => handleDeletePayment(inv.id)}
                                >
                                  <Trash2 size={12} /> {t.delete}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {(selectedClient.payments || []).length === 0 && (
                            <tr>
                              <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px 0' }}>
                                {t.noPaymentsBilled}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Content: Timeline */}
                {detailTab === 'timeline' && (
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{t.clinicalRecordHeader}</h4>

                    {/* Timeline creation input */}
                    <form onSubmit={handleAddLog} className="glass-card" style={{ padding: '16px', marginBottom: '24px', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <select 
                          className="select-filter" 
                          style={{ padding: '8px 12px', minWidth: '100px', fontSize: '0.85rem' }}
                          value={newLogData.type}
                          onChange={(e) => setNewLogData({ ...newLogData, type: e.target.value })}
                        >
                          <option value="note">📝 {t.notes}</option>
                          <option value="call">📞 {t.callLog}</option>
                          <option value="email">✉️ {t.emailSent}</option>
                          <option value="meeting">🤝 {t.treatmentLog}</option>
                        </select>
                        <input 
                          type="text" 
                          className="form-control" 
                          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                          placeholder={t.clinicalLogPlaceholder}
                          value={newLogData.description}
                          onChange={(e) => setNewLogData({ ...newLogData, description: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          {t.addEntry}
                        </button>
                      </div>
                    </form>

                    {/* List timeline */}
                    <div className="timeline-list">
                      {(selectedClient.timeline || []).map(event => (
                        <div className="timeline-item" key={event.id}>
                          <div className={`timeline-dot ${event.type}`} />
                          <div className="timeline-meta">
                            {event.date} • <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                              {event.type === 'note' ? t.notes : event.type === 'call' ? t.callLog : event.type === 'email' ? t.emailSent : event.type === 'meeting' ? t.treatmentLog : 'SYSTEM'}
                            </span>
                          </div>
                          <div className="timeline-desc">{event.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
    </>
    
  );
}
