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
  Languages,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import DashboardView from './pages/DashboardView';
import DirectoryView from './pages/DirectoryView';
import PatientDetailView from './pages/PatientDetailView';
import AddAppointmentModal from './components/AddAppointmentModal';
import AddPatientModal from './components/AddPatientModal';
import TRANSLATIONS from './components/Translation';
import AddPaymentModal from './components/AddPaimentModel';
import FinanceView from './pages/FinanceView';
import AuthPage from './pages/AuthPage';
import AdminNetworkView from './pages/AdminNetworkView';
import AdminIncomeView from './pages/AdminIncomeView';
import InvitesPanel from './components/InvitesPanel';
import { getStoredAccount, clearAccount, apiFetch } from './api';

const DEFAULT_CLIENTS = [];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('en');
  const [account, setAccount] = useState(() => getStoredAccount());
  const [currentView, setCurrentView] = useState('clients');
  const finance = currentView === 'finance'; // boolean switch for Finance section
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
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    value: '',
    totalPayment: '',
  });
  const [newProjectData, setNewProjectData] = useState({
    date: '',
    time: '',
    treatment: 'Cleaning & Checkup',
    status: 'Scheduled',
  });
  const [newInvoiceData, setNewInvoiceData] = useState({
    amount: '',
    date: '',
    method: 'Card',
    status: 'Paid',
  });
  const [newLogData, setNewLogData] = useState({ type: 'note', description: '' });

  // Detail View Active Tab
  const [detailTab, setDetailTab] = useState('appointments'); // 'appointments' | 'payments' | 'timeline'

  // Shortcut to current translations
  const t = TRANSLATIONS[lang];

  // Initialize theme
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Load clients data when authenticated
  useEffect(() => {
    if (account) fetchClients();
  }, [account]);

  const handleAuthSuccess = (loggedInAccount) => {
    setAccount(loggedInAccount);
  };

  const handleLogout = () => {
    clearAccount();
    setAccount(null);
    setClients([]);
    setSelectedClient(null);
    setCurrentView('clients');
  };

  const fetchClients = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const response = await apiFetch('/clients', {}, account);
      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();
      setClients(data);
      setUseLocalFallback(false);
    } catch (error) {
      console.warn('Backend API not reachable. Falling back to LocalStorage.', error);
      setUseLocalFallback(true);
      const localKey = `aura_clients_${account.id}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setClients(JSON.parse(localData));
      } else {
        localStorage.setItem(localKey, JSON.stringify(DEFAULT_CLIENTS));
        setClients(DEFAULT_CLIENTS);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateClientsState = (newClients) => {
    setClients(newClients);
    if (useLocalFallback && account) {
      localStorage.setItem(`aura_clients_${account.id}`, JSON.stringify(newClients));
    }
    if (selectedClient) {
      const updatedSelect = newClients.find((c) => c.id === selectedClient.id);
      setSelectedClient(updatedSelect || null);
    }
  };
const [loadingCreateClient, setLoadingCreateClient] = useState(false);
  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientData.name) return;

    setLoadingCreateClient(true);

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
            description: 'Patient file created.',
          },
        ],
        totalPayment: Number(newClientData.value) || 0,
      };
      if (newClient.value > 0) {
        newClient.payments.push({
          id: `pay_${Date.now()}`,
          receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
          amount: newClient.value,
          date: new Date().toISOString().split('T')[0],
          method: 'Cash',
          status: 'Paid',
        });
        newClient.timeline.unshift({
          id: `t_dep_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'system',
          description: `Initial payment deposit of ${newClient.value} DA logged.`,
        });
      }
      updateClientsState([...clients, newClient]);
      setShowAddClient(false);
      setNewClientData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'Active',
        value: '',
      });
    } else {
      try {
        const response = await apiFetch('/clients', {
          method: 'POST',
          body: JSON.stringify(newClientData),
        }, account);
        if (response.ok) {
          const created = await response.json();
          setLoadingCreateClient(false);
          if (Number(newClientData.value) > 0) {
            await apiFetch(`/clients/${created.id}/payments`, {
              method: 'POST',
              body: JSON.stringify({
                amount: newClientData.value,
                date: new Date().toISOString().split('T')[0],
                method: 'Cash',
                status: 'Paid',
              }),
            }, account);
          }
          fetchClients();
          setShowAddClient(false);
          setNewClientData({
            name: '',
            email: '',
            phone: '',
            company: '',
            status: 'Active',
            value: '',
          });
        }
      } catch (err) {
        console.error('Failed to create patient on server', err);
      }
    }
  };

  const handleUpdateStatus = async (clientId, newStatus) => {
    if (useLocalFallback) {
      const updated = clients.map((c) => {
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
                description: `Status changed from ${originalStatus} to ${newStatus}.`,
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      });
      updateClientsState(updated);
    } else {
      try {
        const response = await apiFetch(`/clients/${clientId}`, {
          method: 'PUT',
          body: JSON.stringify({
            status: newStatus,
          }),
        }, account);
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map((c) => (c.id === clientId ? updatedClient : c)));
        }
      } catch (err) {
        console.error('Failed to update status', err);
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
        status: newProjectData.status,
      };

      const updated = clients.map((c) => {
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
                description: `Appointment scheduled: ${newProjectData.treatment} on ${newProjectData.date} at ${newProjectData.time || 'Flexible'}.`,
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      });
      updateClientsState(updated);
      setShowAddProject(false);
      setNewProjectData({
        date: '',
        time: '',
        treatment: 'Cleaning & Checkup',
        status: 'Scheduled',
      });
    } else {
      try {
        const response = await apiFetch(`/clients/${selectedClient.id}/appointments`, {
          method: 'POST',
          body: JSON.stringify(newProjectData),
        }, account);
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
          setShowAddProject(false);
          setNewProjectData({
            date: '',
            time: '',
            treatment: 'Cleaning & Checkup',
            status: 'Scheduled',
          });
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
        status: newInvoiceData.status,
      };

      const updated = clients.map((c) => {
        if (c.id === selectedClient.id) {
          const originalPayments = c.payments || [];
          const newTotalValue = newPay.status === 'Paid' ? c.value + newPay.amount : c.value;
          return {
            ...c,
            value: newTotalValue,
            payments: [...originalPayments, newPay],
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Payment receipt ${newPay.receiptNumber} recorded for ${newPay.amount} DA (${newPay.status}) via ${newPay.method}.`,
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      });
      updateClientsState(updated);
      setShowAddInvoice(false);
      setNewInvoiceData({ amount: '', date: '', method: 'Card', status: 'Paid' });
    } else {
      try {
        const response = await apiFetch(`/clients/${selectedClient.id}/payments`, {
          method: 'POST',
          body: JSON.stringify(newInvoiceData),
        }, account);
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
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
      const updated = clients.map((c) => {
        if (c.id === selectedClient.id) {
          const targetPayment = c.payments.find((p) => p.id === paymentId);
          if (!targetPayment) return c;
          const filteredPayments = c.payments.filter((p) => p.id !== paymentId);
          const newTotalValue =
            targetPayment.status === 'Paid' ? Math.max(0, c.value - targetPayment.amount) : c.value;
          return {
            ...c,
            value: newTotalValue,
            payments: filteredPayments,
            timeline: [
              {
                id: `t_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'system',
                description: `Payment receipt ${targetPayment.receiptNumber} for ${targetPayment.amount} DA was deleted.`,
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      });
      updateClientsState(updated);
    } else {
      try {
        const response = await apiFetch(
          `/clients/${selectedClient.id}/payments/${paymentId}`,
          { method: 'DELETE' },
          account
        );
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
        }
      } catch (err) {
        console.error('Failed to delete payment from server', err);
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
        description: newLogData.description,
      };

      const updated = clients.map((c) => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            timeline: [newEvent, ...c.timeline],
          };
        }
        return c;
      });
      updateClientsState(updated);
      setNewLogData({ type: 'note', description: '' });
    } else {
      try {
        const response = await apiFetch(`/clients/${selectedClient.id}/timeline`, {
          method: 'POST',
          body: JSON.stringify(newLogData),
        }, account);
        if (response.ok) {
          const updatedClient = await response.json();
          updateClientsState(clients.map((c) => (c.id === selectedClient.id ? updatedClient : c)));
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
      const filtered = clients.filter((c) => c.id !== clientId);
      updateClientsState(filtered);
      setCurrentView('clients');
      setSelectedClient(null);
    } else {
      try {
        const response = await apiFetch(`/clients/${clientId}`, {
          method: 'DELETE',
        }, account);
        if (response.ok) {
          setClients(clients.filter((c) => c.id !== clientId));
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

    clients.forEach((client) => {
      const appointmentsList = client.appointments || [];
      const paymentsList = client.payments || [];

      activeAppointments += appointmentsList.filter((a) => a.status === 'Scheduled').length;
      paymentsList.forEach((pay) => {
        if (pay.status === 'Paid') totalRevenue += pay.amount;
        else if (pay.status === 'Pending') pendingRevenue += pay.amount;
      });
    });

    return {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === 'Active').length,
      inactiveClients: clients.filter((c) => c.status === 'Inactive').length,
      totalRevenue,
      pendingRevenue,
      activeAppointments,
    };
  };

  const stats = computeStats();

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  
  if (!account) {
    return (
      <AuthPage
        theme={theme}
        lang={lang}
        t={t}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

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
        account={account}
        onLogout={handleLogout}
      />

      {/* Main Panel */}
      <main className="main-content">
        {account.role === 'coworker' && (
          <InvitesPanel account={account} t={t} />
        )}
        {/* Status Indicator */}
        {useLocalFallback && (
          <div
            style={{
              background: 'var(--warning-bg)',
              color: 'var(--warning)',
              padding: '10px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
            }}
          >
            <AlertCircle size={16} />
            {t.fallbackWarning}
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <DashboardView
            stats={stats}
            clients={clients}
            setShowAddClient={setShowAddClient}
            setSelectedClient={setSelectedClient}
            setCurrentView={setCurrentView}
            t={t}
          />
        )}

        {/* Directory View */}
        {currentView === 'clients' && (
          <div>
            <DirectoryView
              filteredClients={filteredClients}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              setShowAddClient={setShowAddClient}
              setSelectedClient={setSelectedClient}
              setCurrentView={setCurrentView}
              handleDeleteClient={handleDeleteClient}
              t={t}
            />

            {showAddClient && (
              <AddPatientModal
                loading={loadingCreateClient}
                show={showAddClient}
                onClose={() => setShowAddClient(false)}
                newClientData={newClientData}
                setNewClientData={setNewClientData}
                handleCreateClient={handleCreateClient}
                t={t}
              />
            )}
          </div>
        )}
        {/* Modal: Add Payment */}
        {showAddInvoice && (
          <AddPaymentModal
            onClose={setShowAddInvoice}
            onAddPayment={handleAddPayment}
            setNewInvoiceData={setNewInvoiceData}
            setShowAddInvoice={setShowAddInvoice}
            t={t}
            handleAddPayment={handleAddPayment}
            newInvoiceData={newInvoiceData}
            showAddInvoice={showAddInvoice}
          />
        )}
        {showAddProject && (
          <AddAppointmentModal
            show={showAddProject}
            onClose={setShowAddProject}
            newProjectData={newProjectData}
            setNewProjectData={setNewProjectData}
            handleAddAppointment={handleAddAppointment}
            t={t}
           
          />
        )}
        {currentView == 'details' && (
          <PatientDetailView
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            setCurrentView={setCurrentView}
            handleUpdateStatus={handleUpdateStatus}
            handleDeleteClient={handleDeleteClient}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            setShowAddProject={setShowAddProject}
            setShowAddInvoice={setShowAddInvoice}
            handleDeletePayment={handleDeletePayment}
            handleAddLog={handleAddLog}
            newLogData={newLogData}
            setNewLogData={setNewLogData}
            t={t}
            lang={lang}
          />
        )}
        {/* Finance View */}
        {finance && <FinanceView clients={clients} t={t} />}

        {/* Admin: Network View */}
        {currentView === 'network' && account.role === 'admin' && (
          <AdminNetworkView account={account} t={t} />
        )}

        {/* Admin: Income View */}
        {currentView === 'admin-income' && account.role === 'admin' && (
          <AdminIncomeView account={account} t={t} />
        )}
      </main>
    </div>
  );
}
