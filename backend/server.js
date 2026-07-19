import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_DIR = path.join(__dirname, 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const NETWORK_FILE = path.join(DATA_DIR, 'network.json');
const ADMIN_INCOME_FILE = path.join(DATA_DIR, 'admin_income.json');

app.use(cors());
app.use(express.json());

// ─── File helpers ─────────────────────────────────────────────────────────────

async function readJson(filePath, defaultValue) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    throw error;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function clientsFileFor(accountId) {
  return path.join(DATA_DIR, 'users', accountId, 'clients.json');
}

async function readClients(accountId) {
  return readJson(clientsFileFor(accountId), []);
}

async function writeClients(accountId, clients) {
  await writeJson(clientsFileFor(accountId), clients);
}

async function readAccounts() {
  return readJson(ACCOUNTS_FILE, []);
}

async function writeAccounts(accounts) {
  await writeJson(ACCOUNTS_FILE, accounts);
}

async function readNetwork() {
  return readJson(NETWORK_FILE, []);
}

async function writeNetwork(network) {
  await writeJson(NETWORK_FILE, network);
}

async function readAdminIncome() {
  return readJson(ADMIN_INCOME_FILE, {});
}

async function writeAdminIncome(data) {
  await writeJson(ADMIN_INCOME_FILE, data);
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function sanitizeAccount(account) {
  const { password, ...safe } = account;
  return safe;
}

// ─── Auth middleware ────────────────────────────────────────────────────────

async function requireAuth(req, res, next) {
  const accountId = req.headers['x-account-id'];
  if (!accountId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const accounts = await readAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (!account) {
    return res.status(401).json({ error: 'Invalid account' });
  }
  req.account = account;
  next();
}

function requireAdmin(req, res, next) {
  if (req.account.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── Admin income reporting ─────────────────────────────────────────────────

async function reportPaymentToAdmins(coworkerAccount, payment, client) {
  const network = await readNetwork();
  const adminIds = [
    ...new Set(
      network
        .filter((n) => n.coworkerId === coworkerAccount.id && n.status === 'accepted')
        .map((n) => n.adminId)
    ),
  ];

  if (adminIds.length === 0) return;

  const incomeData = await readAdminIncome();
  const entry = {
    id: `inc_${Date.now()}`,
    date: payment.date,
    amount: payment.amount,
    clientId: client.id,
    clientName: client.name,
    receiptNumber: payment.receiptNumber,
    paymentId: payment.id,
    recordedAt: new Date().toISOString(),
  };

  for (const adminId of adminIds) {
    if (!incomeData[adminId]) incomeData[adminId] = {};
    if (!incomeData[adminId][coworkerAccount.id]) {
      incomeData[adminId][coworkerAccount.id] = {
        coworkerName: coworkerAccount.name,
        coworkerEmail: coworkerAccount.email,
        totalIncome: 0,
        payments: [],
      };
    }
    const record = incomeData[adminId][coworkerAccount.id];
    record.coworkerName = coworkerAccount.name;
    record.coworkerEmail = coworkerAccount.email;
    record.payments.unshift(entry);
    if (payment.status === 'Paid') {
      record.totalIncome = (Number(record.totalIncome) || 0) + Number(payment.amount);
    }
  }

  await writeAdminIncome(incomeData);
}

// ─── Auth routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (role && !['admin', 'coworker'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or coworker' });
    }

    const accounts = await readAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const newAccount = {
      id: `acc_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashPassword(password),
      role: role || 'coworker',
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAccount);
    await writeAccounts(accounts);
    await writeClients(newAccount.id, []);

    res.status(201).json(sanitizeAccount(newAccount));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const accounts = await readAccounts();
    const account = accounts.find((a) => a.email === email.toLowerCase());
    if (!account || account.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(sanitizeAccount(account));
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(sanitizeAccount(req.account));
});

// ─── Account search (admin) ───────────────────────────────────────────────────

app.get('/api/accounts/search', requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = (req.query.q || '').toLowerCase().trim();
    const accounts = await readAccounts();
    const network = await readNetwork();

    const connectedOrPending = new Set(
      network
        .filter((n) => n.adminId === req.account.id && n.status !== 'rejected')
        .map((n) => n.coworkerId)
    );

    let results = accounts.filter(
      (a) =>
        a.id !== req.account.id &&
        a.role === 'coworker' &&
        !connectedOrPending.has(a.id)
    );

    if (query) {
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
    }

    res.json(results.map(sanitizeAccount));
  } catch (error) {
    res.status(500).json({ error: 'Failed to search accounts' });
  }
});

// ─── Network routes ───────────────────────────────────────────────────────────

app.post('/api/network/invite', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { coworkerId } = req.body;
    if (!coworkerId) {
      return res.status(400).json({ error: 'Coworker ID is required' });
    }

    const accounts = await readAccounts();
    const coworker = accounts.find((a) => a.id === coworkerId && a.role === 'coworker');
    if (!coworker) {
      return res.status(404).json({ error: 'Coworker account not found' });
    }

    const network = await readNetwork();
    const existing = network.find(
      (n) =>
        n.adminId === req.account.id &&
        n.coworkerId === coworkerId &&
        n.status !== 'rejected'
    );
    if (existing) {
      return res.status(409).json({ error: 'Invite already sent or coworker already in network' });
    }

    const invite = {
      id: `net_${Date.now()}`,
      adminId: req.account.id,
      adminName: req.account.name,
      coworkerId,
      coworkerName: coworker.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
      respondedAt: null,
    };

    network.push(invite);
    await writeNetwork(network);
    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

app.get('/api/network', requireAuth, requireAdmin, async (req, res) => {
  try {
    const network = await readNetwork();
    const connected = network.filter(
      (n) => n.adminId === req.account.id && n.status === 'accepted'
    );
    res.json(connected);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network' });
  }
});

app.get('/api/network/invites', requireAuth, async (req, res) => {
  try {
    const network = await readNetwork();
    const invites = network.filter(
      (n) => n.coworkerId === req.account.id && n.status === 'pending'
    );
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

app.post('/api/network/invites/:id/respond', requireAuth, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or reject' });
    }

    const network = await readNetwork();
    const index = network.findIndex(
      (n) => n.id === req.params.id && n.coworkerId === req.account.id && n.status === 'pending'
    );
    if (index === -1) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    network[index].status = action === 'accept' ? 'accepted' : 'rejected';
    network[index].respondedAt = new Date().toISOString();

    if (action === 'accept') {
      const incomeData = await readAdminIncome();
      const adminId = network[index].adminId;
      if (!incomeData[adminId]) incomeData[adminId] = {};
      if (!incomeData[adminId][req.account.id]) {
        incomeData[adminId][req.account.id] = {
          coworkerName: req.account.name,
          coworkerEmail: req.account.email,
          totalIncome: 0,
          payments: [],
        };
      }
      await writeAdminIncome(incomeData);
    }

    await writeNetwork(network);
    res.json(network[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to invite' });
  }
});

// ─── Admin income routes ──────────────────────────────────────────────────────

app.get('/api/admin/income', requireAuth, requireAdmin, async (req, res) => {
  try {
    const incomeData = await readAdminIncome();
    const adminIncome = incomeData[req.account.id] || {};
    res.json(adminIncome);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch income data' });
  }
});

app.get('/api/admin/income/:coworkerId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const incomeData = await readAdminIncome();
    const adminIncome = incomeData[req.account.id] || {};
    const coworkerIncome = adminIncome[req.params.coworkerId];
    if (!coworkerIncome) {
      return res.status(404).json({ error: 'Coworker income not found' });
    }
    res.json(coworkerIncome);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coworker income' });
  }
});

// ─── Client routes (scoped per account) ─────────────────────────────────────

app.get('/api/clients', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read clients' });
  }
});

app.get('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);
    const client = clients.find((c) => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read client details' });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, company, status, value, totalPayment } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const clients = await readClients(req.account.id);
    const newClient = {
      id: `c_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      company: company || '',
      status: status || 'Active',
      value: Number(value) || 0,
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
      totalPayment: Number(totalPayment) || 0,
    };

    clients.push(newClient);
    await writeClients(req.account.id, clients);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient profile' });
  }
});

app.put('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);
    const index = clients.findIndex((c) => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const original = clients[index];
    const updated = {
      ...original,
      ...req.body,
      appointments: req.body.appointments || original.appointments || [],
      payments: req.body.payments || original.payments || [],
      timeline: req.body.timeline || original.timeline || [],
      id: original.id,
    };

    clients[index] = updated;
    await writeClients(req.account.id, clients);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

app.delete('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);
    const filtered = clients.filter((c) => c.id !== req.params.id);

    if (filtered.length === clients.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await writeClients(req.account.id, filtered);
    res.json({ message: 'Patient profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient profile' });
  }
});

app.post('/api/clients/:id/appointments', requireAuth, async (req, res) => {
  try {
    const { date, time, treatment, status } = req.body;
    if (!date || !treatment) {
      return res.status(400).json({ error: 'Date and Treatment description are required' });
    }

    const clients = await readClients(req.account.id);
    const client = clients.find((c) => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newAppointment = {
      id: `apt_${Date.now()}`,
      date,
      time: time || 'Flexible',
      treatment,
      status: status || 'Scheduled',
    };

    if (!client.appointments) client.appointments = [];
    client.appointments.push(newAppointment);

    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Appointment scheduled for ${date} at ${time} (${treatment}).`,
    });

    await writeClients(req.account.id, clients);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

app.post('/api/clients/:id/payments', requireAuth, async (req, res) => {
  try {
    const { amount, date, status } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Payment amount is required' });
    }

    const clients = await readClients(req.account.id);
    const client = clients.find((c) => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Paid',
    };

    if (!client.payments) client.payments = [];
    client.payments.push(newPayment);

    if (newPayment.status === 'Paid') {
      client.value = (Number(client.value) || 0) + Number(amount);
    }

    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Payment of ${amount} DA added (${newPayment.status}).`,
    });

    await writeClients(req.account.id, clients);

    if (req.account.role === 'coworker' && newPayment.status === 'Paid') {
      await reportPaymentToAdmins(req.account, newPayment, client);
    }

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

app.delete('/api/clients/:id/payments/:paymentId', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);
    const client = clients.find((c) => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!client.payments) client.payments = [];
    const paymentIndex = client.payments.findIndex((p) => p.id === req.params.paymentId);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const removedPayment = client.payments[paymentIndex];
    client.payments.splice(paymentIndex, 1);

    if (removedPayment.status === 'Paid') {
      client.value = Math.max(0, (Number(client.value) || 0) - Number(removedPayment.amount));
    }

    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Payment receipt ${removedPayment.receiptNumber} for ${removedPayment.amount} DA was deleted.`,
    });

    await writeClients(req.account.id, clients);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const clients = await readClients(req.account.id);

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let activeAppointments = 0;

    clients.forEach((client) => {
      if (client.appointments) {
        activeAppointments += client.appointments.filter((a) => a.status === 'Scheduled').length;
      }
      if (client.payments) {
        client.payments.forEach((pay) => {
          if (pay.status === 'Paid') totalRevenue += pay.amount;
          else if (pay.status === 'Pending') pendingRevenue += pay.amount;
        });
      }
    });

    res.json({
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === 'Active').length,
      leads: clients.filter((c) => c.status === 'Inactive').length,
      totalRevenue,
      pendingRevenue,
      activeProjects: activeAppointments,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API running on port ${PORT}`);
});
