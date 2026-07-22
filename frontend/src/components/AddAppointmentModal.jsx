import React from 'react';
import { X } from 'lucide-react';


export default function AddAppointmentModal({
  show,
  onClose,
  newProjectData,
  setNewProjectData,
  handleAddAppointment,
  t,
  
}) {
  console.log('New Project Data:', t.cleaning);
  const options = [
  
  { id: 1, label: t.cleaning },
  { id: 2, label: t.filling },
  { id: 3, label: t.rootCanal },
  { id: 4, label: t.extraction },
  { id: 5, label: t.implant },
  { id: 6, label: t.crown },
  { id: 7, label: t.bridge },
  { id: 8, label: t.veneer },
  { id: 9, label: t.whitening },
  { id: 10, label: t.orthodontics },
  { id: 11, label: t.denture },
  { id: 12, label: t.gumTreatment },
  { id: 13, label: t.oralSurgery },
  { id: 14, label: t.pediatricDentistry },
  { id: 15, label: t.consultation },
  { id: 16, label: t.xray },
  { id: 17, label: t.emergencyCare },
  { id: 18, label: t.scaling },
  { id: 19, label: t.wisdomToothRemoval },
  { id: 20, label: t.sealants }
  
]
  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="glass-card modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.scheduleVisit}</h3>
          <button className="btn-close" onClick={() => onClose(false)}><X size={18} /></button>
        </div>
        <form onSubmit={handleAddAppointment}>
          <div className="modal-body">
            <div className="form-group">
              <label>{t.procedureSelect}</label>
              <select
                className="form-control bg-black"
                value={newProjectData.treatment}
                onChange={(e) => setNewProjectData({ ...newProjectData, treatment: e.target.value })}
              >
                {
                  options.map((option, index) => (
                    <option key={index} value={option.id}>{option.label}</option>
                  ))
                }
                
              </select>
            </div>
            <div className="form-group">
              <label>{t.appointmentDate}</label>
              <input
                type="date"
                className="form-control"
                required
                value={newProjectData.date}
                onChange={(e) => setNewProjectData({ ...newProjectData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.timeSlot}</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 09:30 AM"
                value={newProjectData.time}
                onChange={(e) => setNewProjectData({ ...newProjectData, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t.status}</label>
              <select
                className="form-control"
                value={newProjectData.status}
                onChange={(e) => setNewProjectData({ ...newProjectData, status: e.target.value })}
              >
                <option value="Scheduled">{t.scheduled}</option>
                <option value="Completed">{t.completed}</option>
                <option value="Cancelled">{t.cancelled}</option>
              </select>
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => onClose(false)} >{t.cancel}</button>
            <button type="submit" className="btn btn-primary">{t.scheduleVisit}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
