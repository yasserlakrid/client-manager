import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Clock, 
  Sun, 
  Moon, 
  Receipt, 
  Activity, 
  AlertCircle,
  Calendar,
  Sparkles,
  Shield,
  Trash2,
  HeartPulse,
  Languages
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import DirectoryView from './components/DirectoryView';
import PatientDetailView from './components/PatientDetailView';
import AddAppointmentModal from './components/AddAppointmentModal';
import AddPatientModal from './components/AddPatientModal';
  
const API_BASE = '/api';

const DEFAULT_CLIENTS = [];

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    registeredPatients: "Registered Patients",
    activePatients: "Active Patients",
    scheduledVisits: "Scheduled Visits",
    totalBilled: "Total Billed",
    registerPatient: "Register Patient",
    recentPayments: "Recent Payments",
    upcomingVisits: "Upcoming Scheduled Visits",
    receiptNo: "Receipt No",
    patient: "Patient",
    amount: "Amount",
    method: "Method",
    treatment: "Treatment",
    schedule: "Schedule",
    actions: "Actions",
    viewDetails: "View details",
    delete: "Delete",
    searchPlaceholder: "Search by name or email...",
    allStatuses: "All Statuses",
    active: "Active",
    inactive: "Inactive",
    patientFile: "Patient File",
    clinicalSubtitle: "Clinical card, appointment schedules, and billing ledger.",
    activePatientLabel: "🟢 Active Patient",
    inactivePatientLabel: "🔴 Inactive Patient",
    deletePatientRecord: "Delete Patient Record",
    appointments: "Appointments",
    billingPayments: "Billing & Payments",
    clinicalLog: "Clinical Log & History",
    scheduleVisit: "Schedule Dentist Visit",
    addPaymentLabel: "Add Payment",
    recordPayment: "Record Payment",
    addEntry: "Add Entry",
    clinicalLogPlaceholder: "Log diagnostic details, treatment progress, or clinic follow-ups...",
    patientFullName: "Patient Full Name *",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    insuranceProvider: "Insurance Provider",
    status: "Status",
    initialBilled: "Initial Billed Amount / Paid (DA)",
    cancel: "Cancel",
    createProfile: "Create Profile",
    procedureSelect: "Treatment / Procedure *",
    appointmentDate: "Appointment Date *",
    timeSlot: "Time Slot",
    logPayment: "Log Payment",
    paymentAmount: "Payment Amount (DA) *",
    transactionDate: "Transaction Date",
    paymentStatus: "Payment Status",
    paidCompleted: "Paid (Completed)",
    pendingReview: "Pending (Insurance Review)",
    noPayments: "No payments processed yet.",
    noScheduled: "No scheduled appointments.",
    noPatientsFound: "No patients found matching your criteria.",
    noAppointmentsRecord: "No appointments recorded for this patient.",
    noPaymentsBilled: "No payments billed.",
    patientNotes: "Private Patient",
    confirmDeletePatient: "Are you sure you want to permanently delete this patient record?",
    confirmDeletePayment: "Are you sure you want to remove this payment entry?",
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    cash: "Cash",
    card: "Credit/Debit Card",
    insuranceClaim: "Insurance Claim",
    bankTransfer: "Bank Transfer",
    notes: "Note",
    callLog: "Call Log",
    emailSent: "Email sent",
    treatmentLog: "Treatment",
    fallbackWarning: "Running in Local Sandbox Mode (Express Server not detected. Changes will save to local storage).",
    privateCash: "Private/Cash",
    overviewTitle: "Dentist Dashboard",
    overviewSubtitle: "Welcome to Aura Dental CRM. Monitor patient files, schedules, and billings.",
    patientPortfolioTitle: "Patients Portfolio",
    patientPortfolioSubtitle: "Register new patients and manage clinical information.",
    patientFileSubtitle: "Clinical card, appointment schedules, and billing ledger.",
    billingLedger: "Payment Transactions",
    appointmentSchedules: "Appointment Schedules",
    clinicalRecordHeader: "Patient Clinical Record",
    newPaymentBtn: "Record Payment",
    newAppointmentBtn: "Schedule Appointment",
    languageLabel: "Language / Langue"
  },
  fr: {
    dashboard: "Tableau de Bord",
    patients: "Patients",
    registeredPatients: "Patients Enregistrés",
    activePatients: "Patients Actifs",
    scheduledVisits: "Visites Planifiées",
    totalBilled: "Total Facturé",
    registerPatient: "Enregistrer un Patient",
    recentPayments: "Paiements Récents",
    upcomingVisits: "Prochaines Visites Planifiées",
    receiptNo: "N° de Reçu",
    patient: "Patient",
    amount: "Montant",
    method: "Méthode",
    treatment: "Traitement",
    schedule: "Horaire",
    actions: "Actions",
    viewDetails: "Voir détails",
    delete: "Supprimer",
    searchPlaceholder: "Rechercher par nom ou email...",
    allStatuses: "Tous les Statuts",
    active: "Actif",
    inactive: "Inactif",
    patientFile: "Dossier Patient",
    clinicalSubtitle: "Fiche clinique, calendrier des rendez-vous et historique des paiements.",
    activePatientLabel: "🟢 Patient Actif",
    inactivePatientLabel: "🔴 Patient Inactif",
    deletePatientRecord: "Supprimer le Dossier",
    appointments: "Rendez-vous",
    billingPayments: "Factures & Paiements",
    clinicalLog: "Notes Cliniques & Historique",
    scheduleVisit: "Planifier une Visite",
    addPaymentLabel: "Enregistrer un Paiement",
    recordPayment: "Enregistrer un Paiement",
    addEntry: "Ajouter la Note",
    clinicalLogPlaceholder: "Saisir les détails de diagnostic, traitements ou suivis...",
    patientFullName: "Nom Complet du Patient *",
    emailAddress: "Adresse Email",
    phoneNumber: "Numéro de Téléphone",
    insuranceProvider: "Assurance / Mutuelle",
    status: "Statut",
    initialBilled: "Montant Facturé / Payé Initial (DA)",
    cancel: "Annuler",
    createProfile: "Créer le Profil",
    procedureSelect: "Traitement / Procédure *",
    appointmentDate: "Date du Rendez-vous *",
    timeSlot: "Plage Horaire",
    logPayment: "Enregistrer",
    paymentAmount: "Montant du Paiement (DA) *",
    transactionDate: "Date de Transaction",
    paymentStatus: "Statut de Paiement",
    paidCompleted: "Payé (Complété)",
    pendingReview: "En attente (Examen Assurance)",
    noPayments: "Aucun paiement enregistré pour le moment.",
    noScheduled: "Aucun rendez-vous planifié.",
    noPatientsFound: "Aucun patient ne correspond à vos critères.",
    noAppointmentsRecord: "Aucun rendez-vous enregistré pour ce patient.",
    noPaymentsBilled: "Aucun paiement facturé.",
    patientNotes: "Patient Privé",
    confirmDeletePatient: "Êtes-vous sûr de vouloir supprimer définitivement ce dossier patient ?",
    confirmDeletePayment: "Êtes-vous sûr de vouloir supprimer ce paiement ?",
    scheduled: "Planifié",
    completed: "Terminé",
    cancelled: "Annulé",
    cash: "Espèces",
    card: "Carte Bancaire",
    insuranceClaim: "Prise en charge Assurance",
    bankTransfer: "Virement Bancaire",
    notes: "Note",
    callLog: "Appel Téléphonique",
    emailSent: "Email Envoyé",
    treatmentLog: "Traitement",
    fallbackWarning: "Mode Hors-ligne (Serveur Express non détecté. Les modifications sont enregistrées localement).",
    privateCash: "Privé/Espèces",
    overviewTitle: "Tableau de Bord Dentiste",
    overviewSubtitle: "Bienvenue sur Aura Dental CRM. Gérez les dossiers, plannings et facturations.",
    patientPortfolioTitle: "Portefeuille Patients",
    patientPortfolioSubtitle: "Enregistrez de nouveaux patients et gérez les dossiers cliniques.",
    patientFileSubtitle: "Fiche clinique, calendrier des visites et historique financier.",
    billingLedger: "Historique des Transactions",
    appointmentSchedules: "Calendrier des Rendez-vous",
    clinicalRecordHeader: "Dossier Clinique du Patient",
    newPaymentBtn: "Ajouter un Paiement",
    newAppointmentBtn: "Nouveau Rendez-vous",
    languageLabel: "Langue / Language"
  }
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'clients' | 'details'
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [useLocalFallback, setUseLocalFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false); // Appointment Modal
  const [showAddInvoice, setShowAddInvoice] = useState(false); // Payment Modal

  // Form states
  const [newClientData, setNewClientData] = useState({ name: '', email: '', phone: '', company: '', status: 'Active', value: '' });
  const [newProjectData, setNewProjectData] = useState({ date: '', time: '', treatment: 'Cleaning & Checkup', status: 'Scheduled' });
  const [newInvoiceData, setNewInvoiceData] = useState({ amount: '', date: '', method: 'Card', status: 'Paid' });
  const [newLogData, setNewLogData] = useState({ type: 'note', description: '' });

  // Detail View Active Tab
  const [detailTab, setDetailTab] = useState('appointments'); // 'appointments' | 'payments' | 'timeline'

  // Shortcut to current translations
  const t = TRANSLATIONS[lang];

  // Initialize theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Load clients data on startup
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/clients`);
      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();
      setClients(data);
      setUseLocalFallback(false);
    } catch (error) {
      console.warn("Backend API not reachable. Falling back to LocalStorage.", error);
      setUseLocalFallback(true);
      const localData = localStorage.getItem('aura_clients');
      if (localData) {
        setClients(JSON.parse(localData));
      } else {
        localStorage.setItem('aura_clients', JSON.stringify(DEFAULT_CLIENTS));
        setClients(DEFAULT_CLIENTS);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateClientsState = (newClients) => {
    setClients(newClients);
    if (useLocalFallback) {
      localStorage.setItem('aura_clients', JSON.stringify(newClients));
    }
    if (selectedClient) {
      const updatedSelect = newClients.find(c => c.id === selectedClient.id);
      setSelectedClient(updatedSelect || null);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientData.name) return;

    if (useLocalFallback) {
      const newClient = {
        id: `c_${Date.now()}`,
        name: newClientData.name,
        email: newClientData.email,
        phone: newClientData.phone,
        company: newClientData.company, // Insurance
        status: newClientData.status,
        value: Number(newClientData.value) || 0,
        appointments: [],
        payments: [],
        timeline: [
          {
            id: `t_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'system',
            description: 'Patient file created.'
          }
        ]
      };
      if (newClient.value > 0) {
        newClient.payments.push({
          id: `pay_${Date.now()}`,
          receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: newClient.value,
          date: new Date().toISOString().split('T')[0],
          method: 'Cash',
          status: 'Paid'
        });
        newClient.timeline.unshift({
          id: `t_dep_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'system',
          description: `Initial payment deposit of ${newClient.value} DA logged.`
        });
      }
      updateClientsState([...clients, newClient]);
      setShowAddClient(false);
      setNewClientData({ name: '', email: '', phone: '', company: '', status: 'Active', value: '' });
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newClientData)
        });
        if (response.ok) {
          const created = await response.json();
          if (Number(newClientData.value) > 0) {
            await fetch(`${API_BASE}/clients/${created.id}/payments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: newClientData.value, date: new Date().toISOString().split('T')[0], method: 'Cash', status: 'Paid' })
            });
          }
          fetchClients();
          setShowAddClient(false);
          setNewClientData({ name: '', email: '', phone: '', company: '', status: 'Active', value: '' });
        }
      } catch (err) {
        console.error("Failed to create patient on server", err);
      }
    }
  };

  const handleUpdateStatus = async (clientId, newStatus) => {
    if (useLocalFallback) {
      const updated = clients.map(c => {
        if (c.id === clientId) {
          const originalStatus = c.status;
          return {
            ...c,
            status: newStatus,
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Status changed from ${originalStatus} to ${newStatus}.`
              },
              ...c.timeline
            ]
          };
        }
        return c;
      });
      updateClientsState(updated);
    } else {
      try {
        const client = clients.find(c => c.id === clientId);
        const response = await fetch(`${API_BASE}/clients/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Status changed from ${client.status} to ${newStatus}.`
              },
              ...client.timeline
            ]
          })
        });
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map(c => c.id === clientId ? updatedClient : c));
        }
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    if (!newProjectData.date || !newProjectData.treatment) return;

    if (useLocalFallback) {
      const newApt = {
        id: `apt_${Date.now()}`,
        date: newProjectData.date,
        time: newProjectData.time || 'Flexible',
        treatment: newProjectData.treatment,
        status: newProjectData.status
      };

      const updated = clients.map(c => {
        if (c.id === selectedClient.id) {
          const originalApts = c.appointments || [];
          return {
            ...c,
            appointments: [...originalApts, newApt],
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Appointment scheduled: ${newProjectData.treatment} on ${newProjectData.date} at ${newProjectData.time || 'Flexible'}.`
              },
              ...c.timeline
            ]
          };
        }
        return c;
      });
      updateClientsState(updated);
      setShowAddProject(false);
      setNewProjectData({ date: '', time: '', treatment: 'Cleaning & Checkup', status: 'Scheduled' });
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients/${selectedClient.id}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProjectData)
        });
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
          setShowAddProject(false);
          setNewProjectData({ date: '', time: '', treatment: 'Cleaning & Checkup', status: 'Scheduled' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!newInvoiceData.amount) return;

    if (useLocalFallback) {
      const newPay = {
        id: `pay_${Date.now()}`,
        receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: Number(newInvoiceData.amount),
        date: newInvoiceData.date || new Date().toISOString().split('T')[0],
        method: newInvoiceData.method,
        status: newInvoiceData.status
      };

      const updated = clients.map(c => {
        if (c.id === selectedClient.id) {
          const originalPayments = c.payments || [];
          const newTotalValue = newPay.status === 'Paid' ? (c.value + newPay.amount) : c.value;
          return {
            ...c,
            value: newTotalValue,
            payments: [...originalPayments, newPay],
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Payment receipt ${newPay.receiptNumber} recorded for ${newPay.amount} DA (${newPay.status}) via ${newPay.method}.`
              },
              ...c.timeline
            ]
          };
        }
        return c;
      });
      updateClientsState(updated);
      setShowAddInvoice(false);
      setNewInvoiceData({ amount: '', date: '', method: 'Card', status: 'Paid' });
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients/${selectedClient.id}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInvoiceData)
        });
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
          setShowAddInvoice(false);
          setNewInvoiceData({ amount: '', date: '', method: 'Card', status: 'Paid' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm(t.confirmDeletePayment)) return;

    if (useLocalFallback) {
      const updated = clients.map(c => {
        if (c.id === selectedClient.id) {
          const targetPayment = c.payments.find(p => p.id === paymentId);
          if (!targetPayment) return c;
          const filteredPayments = c.payments.filter(p => p.id !== paymentId);
          const newTotalValue = targetPayment.status === 'Paid' ? Math.max(0, c.value - targetPayment.amount) : c.value;
          return {
            ...c,
            value: newTotalValue,
            payments: filteredPayments,
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Payment receipt ${targetPayment.receiptNumber} for ${targetPayment.amount} DA was deleted.`
              },
              ...c.timeline
            ]
          };
        }
        return c;
      });
      updateClientsState(updated);
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients/${selectedClient.id}/payments/${paymentId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
        }
      } catch (err) {
        console.error("Failed to delete payment from server", err);
      }
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!newLogData.description) return;

    if (useLocalFallback) {
      const newEvent = {
        id: `t_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: newLogData.type,
        description: newLogData.description
      };
      
      const updated = clients.map(c => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            timeline: [newEvent, ...c.timeline]
          };
        }
        return c;
      });
      updateClientsState(updated);
      setNewLogData({ type: 'note', description: '' });
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients/${selectedClient.id}/timeline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLogData)
        });
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
          setNewLogData({ type: 'note', description: '' });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm(t.confirmDeletePatient)) return;

    if (useLocalFallback) {
      const filtered = clients.filter(c => c.id !== clientId);
      updateClientsState(filtered);
      setCurrentView('clients');
      setSelectedClient(null);
    } else {
      try {
        const response = await fetch(`${API_BASE}/clients/${clientId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setClients(clients.filter(c => c.id !== clientId));
          setCurrentView('clients');
          setSelectedClient(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const computeStats = () => {
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let activeAppointments = 0;

    clients.forEach(client => {
      const appointmentsList = client.appointments || [];
      const paymentsList = client.payments || [];
      
      activeAppointments += appointmentsList.filter(a => a.status === 'Scheduled').length;
      paymentsList.forEach(pay => {
        if (pay.status === 'Paid') totalRevenue += pay.amount;
        else if (pay.status === 'Pending') pendingRevenue += pay.amount;
      });
    });

    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'Active').length,
      inactiveClients: clients.filter(c => c.status === 'Inactive').length,
      totalRevenue,
      pendingRevenue,
      activeAppointments
    };
  };

  const stats = computeStats();

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-container">

    <Sidebar 
      currentView={currentView} 
      setCurrentView={setCurrentView} 
      setSelectedClient={setSelectedClient} 
      theme={theme} 
      setTheme={setTheme} 
      lang={lang} 
      setLang={setLang} 
      t={t} 
    />

      {/* Main Panel */}
      <main className="main-content">
        
        {/* Status Indicator */}
        {useLocalFallback && (
          <div style={{
            background: 'var(--warning-bg)', 
            color: 'var(--warning)', 
            padding: '10px 16px', 
            borderRadius: '10px', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            <AlertCircle size={16} />
            {t.fallbackWarning}
          </div>
        )}
        

          {/* Dashboard View */}
  {currentView === "dashboard" && 
     <div>
            <div className="dashboard-header">
              <div className="header-title">
                <h1>{t.overviewTitle}</h1>
                <p>{t.overviewSubtitle}</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddClient(true)}>
                <Plus size={18} /> {t.registerPatient}
              </button>
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
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="metric-info">
                  <span className="metric-label">{t.activePatients}</span>
                  <span className="metric-value">{stats.activeClients}</span>
                </div>
              </div>
              <div className="glass-card metric-card">
                <div className="metric-icon-wrapper" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info)' }}>
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
  }       
       

        {/* Directory View */}
{
  currentView === "clients" && <div>
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
            <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
              <div className="search-filter-row">
                <div className="search-input-wrapper">
                  <Search size={20} />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select 
                  className="select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">{t.allStatuses}</option>
                  <option value="Active">{t.active}</option>
                  <option value="Inactive">{t.inactive}</option>
                </select>
              </div>
            </div>

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
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
                          {t.noPatientsFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>{selectedClient && (
          <div>
            {/* Header back navigation */}
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
          </div>
        )}


        
      

      {showAddClient && (
        <div className="modal-overlay" onClick={() => setShowAddClient(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>{t.registerPatient}</h2>
            <form onSubmit={handleCreateClient}>
              <div className="form-group">
                <label>{t.patientFullName}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  placeholder="e.g. Clark Kent"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.emailAddress}</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="clark@dailyplanet.com"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.phoneNumber}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="+1 (555) 304-2094"
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
                    placeholder="e.g. 150"
                    value={newClientData.value}
                    onChange={(e) => setNewClientData({ ...newClientData, value: e.target.value })}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddClient(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.createProfile}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Appointment */}
      {showAddProject && (
        <div className="modal-overlay" onClick={() => setShowAddProject(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>{t.scheduleVisit}</h2>
            <form onSubmit={handleAddAppointment}>
              <div className="form-group">
                <label>{t.procedureSelect}</label>
                <select 
                  className="form-control"
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddProject(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.scheduleVisit}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Payment */}
      {showAddInvoice && (
        <div className="modal-overlay" onClick={() => setShowAddInvoice(false)}>
          <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>{t.recordPayment}</h2>
            <form onSubmit={handleAddPayment}>
              <div className="form-group">
                <label>{t.paymentAmount}</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  placeholder="e.g. 150"
                  value={newInvoiceData.amount}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.transactionDate}</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={newInvoiceData.date}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t.method}</label>
                <select 
                  className="form-control"
                  value={newInvoiceData.method}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, method: e.target.value })}
                >
                  <option value="Card">{t.card}</option>
                  <option value="Cash">{t.cash}</option>
                  <option value="Insurance Claim">{t.insuranceClaim}</option>
                  <option value="Bank Transfer">{t.bankTransfer}</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t.paymentStatus}</label>
                <select 
                  className="form-control"
                  value={newInvoiceData.status}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, status: e.target.value })}
                >
                  <option value="Paid">{t.paidCompleted}</option>
                  <option value="Pending">{t.pendingReview}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddInvoice(false)}>{t.cancel}</button>
                <button type="submit" className="btn btn-primary">{t.logPayment}</button>
              </div>
            </form>
          </div>
        </div>
      )}
  </div>
}
          
   </main> 
    </div>
   
  );
};