import React from 'react';
import { X } from 'lucide-react';

import React from 'react';

import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { colourOptions } from '../data';

const animatedComponents = makeAnimated();


export default function AddAppointmentModal({
  show,
  onClose,
  newProjectData,
  setNewProjectData,
  handleAddAppointment,
  t
}) {
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
                <option value="Cleaning & Checkup">Cleaning & Checkup / Nettoyage & Contrôle</option>
                <option value="Root Canal Therapy">Root Canal Therapy / Traitement de Canal</option>
                <option value="Tooth Filling">Tooth Filling / Plombage</option>
                <option value="Tooth Extraction">Tooth Extraction / Extraction Dentaire</option>
                <option value="Dental Crown / Bridge">Dental Crown / Couronne Dentaire</option>
                <option value="Dental Implant Consultation">Dental Implant / Consultation Implant</option>
                <option value="Teeth Whitening">Teeth Whitening / Blanchiment</option>
                <option value="Invisalign Adjustments">Invisalign / Ajustement Invisalign</option>
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
