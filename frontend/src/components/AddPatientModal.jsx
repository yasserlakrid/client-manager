import React from 'react';
import { X } from 'lucide-react';

export default function AddPatientModal({
  show,
  onClose,
  newClientData,
  setNewClientData,
  handleCreateClient,
  t
}) {
  if (!show) return null;

  return (
        <div className="modal-overlay">

    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-card modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.registerPatient}</h3>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleCreateClient}>
          <div className="modal-body">
            <div className="form-group">
              <label>{t.patientFullName}</label>
              <input 
                type="text" 
                className="form-control" 
                required
                placeholder="Yasser lakrid"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
                <label>{t.totalPayment}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  placeholder="e.g. 5000"
                  value={newClientData.totalPayment}
                  onChange={(e) => setNewClientData({ ...newClientData, totalPayment: e.target.value })}
                />
              </div>
            <div className="form-group">
              <label>{t.emailAddress}</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="py_lakrid@esi.dz"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.phoneNumber}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="+213 (555) 304-2094"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>{t.status}</label>
                <select 
                  className="form-control"
                  value={newClientData.status}
                  onChange={(e) => setNewClientData({ ...newClientData, status: e.target.value })}
                >
                  <option value="Active">{t.active}</option>
                  <option value="Inactive">{t.inactive}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.initialBilled}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 5000"
                  value={newClientData.value}
                  onChange={(e) => setNewClientData({ ...newClientData, value: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t.cancel}</button>
            <button type="submit" className="btn btn-primary">{t.createProfile}</button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}
