import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import pool, { initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// ─── Database helpers ─────────────────────────────────────────────────────────────

async function getClients(accountId) {
  const result = await pool.query('SELECT * FROM clients WHERE account_id = $1', [accountId]);
  const clients = result.rows.map(row => ({
    ...row,
    totalPayment: Number(row.total_payment), // Convert to camelCase and Number
    value: Number(row.value) // Convert to Number
  }));

  for (const client of clients) {
    // Get appointments
    const aptResult = await pool.query('SELECT * FROM appointments WHERE client_id = $1', [client.id]);
    client.appointments = aptResult.rows;

    // Get payments, convert amount to Number
    const payResult = await pool.query('SELECT * FROM payments WHERE client_id = $1', [client.id]);
    client.payments = payResult.rows.map(row => ({
      ...row,
      amount: Number(row.amount),
      receiptNumber: row.receipt_number // add camelCase receiptNumber
    }));

    // Get timeline
    const tlResult = await pool.query('SELECT * FROM timeline WHERE client_id = $1', [client.id]);
    client.timeline = tlResult.rows;
  }

  return clients;
}

async function getClient(accountId, clientId) {
  const clients = await getClients(accountId);
  return clients.find((c) => c.id === clientId);
}

async function getAccounts() {
  const result = await pool.query('SELECT * FROM accounts');
  return result.rows;
}

async function getAccountById(id) {
  const result = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
  return result.rows[0];
}

async function getAccountByEmail(email) {
  const result = await pool.query('SELECT * FROM accounts WHERE email = $1', [email.toLowerCase()]);
  return result.rows[0];
}

async function createAccount(account) {
  await pool.query(
    'INSERT INTO accounts (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [account.id, account.name, account.email, account.password, account.role, account.createdAt]
  );
}

async function getNetwork() {
  const result = await pool.query('SELECT * FROM network');
  return result.rows.map((row) => ({
    id: row.id,
    adminId: row.admin_id,
    adminName: row.admin_name,
    coworkerId: row.coworker_id,
    coworkerName: row.coworker_name,
    status: row.status,
    createdAt: row.created_at,
    respondedAt: row.responded_at
  }));
}

async function updateNetwork(id, status, respondedAt) {
  await pool.query(
    'UPDATE network SET status = $1, responded_at = $2 WHERE id = $3',
    [status, respondedAt, id]
  );
}

async function createNetworkEntry(entry) {
  await pool.query(
    'INSERT INTO network (id, admin_id, admin_name, coworker_id, coworker_name, status, created_at, responded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [entry.id, entry.adminId, entry.adminName, entry.coworkerId, entry.coworkerName, entry.status, entry.createdAt, entry.respondedAt]
  );
}

async function getAdminIncomeData(adminId) {
  const result = await pool.query('SELECT * FROM admin_income WHERE admin_id = $1', [adminId]);
  const incomeData = {};

  for (const row of result.rows) {
    const paymentsResult = await pool.query('SELECT * FROM admin_income_payments WHERE admin_income_id = $1', [row.id]);
    incomeData[row.coworker_id] = {
      coworkerName: row.coworker_name,
      coworkerEmail: row.coworker_email,
      totalIncome: Number(row.total_income),
      payments: paymentsResult.rows.map((p) => ({
        id: p.id,
        date: p.date,
        amount: Number(p.amount),
        clientId: p.client_id,
        clientName: p.client_name,
        receiptNumber: p.receipt_number,
        paymentId: p.payment_id,
        recordedAt: p.recorded_at
      }))
    };
  }

  return incomeData;
}

async function ensureAdminIncomeEntry(adminId, coworkerAccount) {
  const adminIncomeId = `ai_${adminId}_${coworkerAccount.id}`;
  const result = await pool.query('SELECT * FROM admin_income WHERE id = $1', [adminIncomeId]);
  if (result.rows.length === 0) {
    await pool.query(
      'INSERT INTO admin_income (id, admin_id, coworker_id, coworker_name, coworker_email, total_income) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminIncomeId, adminId, coworkerAccount.id, coworkerAccount.name, coworkerAccount.email, 0]
    );
  }
  return adminIncomeId;
}

async function addAdminIncomePayment(adminId, coworkerAccount, payment, client) {
  const adminIncomeId = await ensureAdminIncomeEntry(adminId, coworkerAccount);

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

  await pool.query(
    'INSERT INTO admin_income_payments (id, admin_income_id, date, amount, client_id, client_name, receipt_number, payment_id, recorded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [entry.id, adminIncomeId, entry.date, entry.amount, entry.clientId, entry.clientName, entry.receiptNumber, entry.paymentId, entry.recordedAt]
  );

  if (payment.status === 'Paid') {
    await pool.query(
      'UPDATE admin_income SET total_income = total_income + $1 WHERE id = $2',
      [payment.amount, adminIncomeId]
    );
  }
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
  const account = await getAccountById(accountId);
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
  const network = await getNetwork();
  const adminIds = [
    ...new Set(
      network
        .filter((n) => n.coworkerId === coworkerAccount.id && n.status === 'accepted')
        .map((n) => n.adminId)
    ),
  ];

  if (adminIds.length === 0) return;

  for (const adminId of adminIds) {
    await addAdminIncomePayment(adminId, coworkerAccount, payment, client);
  }
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

    const existingAccount = await getAccountByEmail(email);
    if (existingAccount) {
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

    await createAccount(newAccount);

    res.status(201).json(sanitizeAccount(newAccount));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const account = await getAccountByEmail(email);
    if (!account || account.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(sanitizeAccount(account));
  } catch (error) {
    console.error(error);
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
    const accounts = await getAccounts();
    const network = await getNetwork();

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
    console.error(error);
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

    const coworker = await getAccountById(coworkerId);
    if (!coworker || coworker.role !== 'coworker') {
      return res.status(404).json({ error: 'Coworker account not found' });
    }

    const network = await getNetwork();
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

    await createNetworkEntry(invite);
    res.status(201).json(invite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
});

app.get('/api/network', requireAuth, requireAdmin, async (req, res) => {
  try {
    const network = await getNetwork();
    const connected = network.filter(
      (n) => n.adminId === req.account.id && n.status === 'accepted'
    );
    res.json(connected);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch network' });
  }
});

app.get('/api/network/invites', requireAuth, async (req, res) => {
  try {
    const network = await getNetwork();
    const invites = network.filter(
      (n) => n.coworkerId === req.account.id && n.status === 'pending'
    );
    res.json(invites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

app.post('/api/network/invites/:id/respond', requireAuth, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be accept or reject' });
    }

    const network = await getNetwork();
    const invite = network.find(
      (n) => n.id === req.params.id && n.coworkerId === req.account.id && n.status === 'pending'
    );
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const respondedAt = new Date().toISOString();
    await updateNetwork(invite.id, newStatus, respondedAt);

    if (action === 'accept') {
      await ensureAdminIncomeEntry(invite.adminId, req.account);
    }

    res.json({ ...invite, status: newStatus, respondedAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to respond to invite' });
  }
});

// ─── Admin income routes ──────────────────────────────────────────────────────

app.get('/api/admin/income', requireAuth, requireAdmin, async (req, res) => {
  try {
    const incomeData = await getAdminIncomeData(req.account.id);
    res.json(incomeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch income data' });
  }
});

app.get('/api/admin/income/:coworkerId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const incomeData = await getAdminIncomeData(req.account.id);
    const coworkerIncome = incomeData[req.params.coworkerId];
    if (!coworkerIncome) {
      return res.status(404).json({ error: 'Coworker income not found' });
    }
    res.json(coworkerIncome);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch coworker income' });
  }
});

// ─── Client routes (scoped per account) ─────────────────────────────────────

app.get('/api/clients', requireAuth, async (req, res) => {
  try {
    const clients = await getClients(req.account.id);
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read clients' });
  }
});

app.get('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read client details' });
  }
});

app.post('/api/clients', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, company, status, value, totalPayment } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newClientId = `c_${Date.now()}`;
    const newTimelineId = `t_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO clients (id, account_id, name, email, phone, company, status, value, total_payment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newClientId, req.account.id, name, email || '', phone || '', company || '', status || 'Active', Number(value) || 0, Number(totalPayment) || 0]
    );

    await pool.query(
      'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
      [newTimelineId, newClientId, today, 'system', 'Patient file created.']
    );

    const newClient = await getClient(req.account.id, newClientId);
    res.status(201).json(newClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create patient profile' });
  }
});

app.put('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { name, email, phone, company, status, value, totalPayment } = req.body;

    // If status changed, add a timeline entry
    if (status && status !== client.status) {
      const newTimelineId = `t_${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      await pool.query(
        'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
        [newTimelineId, req.params.id, today, 'system', `Status changed from ${client.status} to ${status}.`]
      );
    }

    await pool.query(
      'UPDATE clients SET name = $1, email = $2, phone = $3, company = $4, status = $5, value = $6, total_payment = $7 WHERE id = $8',
      [
        name || client.name, 
        email || client.email, 
        phone || client.phone, 
        company || client.company, 
        status || client.status, 
        Number(value) !== undefined ? Number(value) : client.value, 
        Number(totalPayment) !== undefined ? Number(totalPayment) : client.totalPayment, 
        req.params.id
      ]
    );

    const updatedClient = await getClient(req.account.id, req.params.id);
    res.json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// Add timeline entry
app.post('/api/clients/:id/timeline', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const { type, description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const newTimelineId = `t_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
      [newTimelineId, req.params.id, today, type || 'note', description]
    );

    const updatedClient = await getClient(req.account.id, req.params.id);
    res.status(201).json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add timeline entry' });
  }
});

app.delete('/api/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ message: 'Patient profile deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete patient profile' });
  }
});

app.post('/api/clients/:id/appointments', requireAuth, async (req, res) => {
  try {
    const { date, time, treatment, status } = req.body;
    if (!date || !treatment) {
      return res.status(400).json({ error: 'Date and Treatment description are required' });
    }

    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newAppointmentId = `apt_${Date.now()}`;
    const newTimelineId = `t_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO appointments (id, client_id, date, time, treatment, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [newAppointmentId, req.params.id, date, time || 'Flexible', treatment, status || 'Scheduled']
    );

    await pool.query(
      'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
      [newTimelineId, req.params.id, today, 'system', `Appointment scheduled for ${date} at ${time || 'Flexible'} (${treatment}).`]
    );

    const updatedClient = await getClient(req.account.id, req.params.id);
    res.status(201).json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

app.post('/api/clients/:id/payments', requireAuth, async (req, res) => {
  try {
    const { amount, date, status } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Payment amount is required' });
    }

    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newPaymentId = `pay_${Date.now()}`;
    const newTimelineId = `t_${Date.now()}`;
    const paymentDate = date || new Date().toISOString().split('T')[0];
    const receiptNumber = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

    await pool.query(
      'INSERT INTO payments (id, client_id, receipt_number, amount, date, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [newPaymentId, req.params.id, receiptNumber, Number(amount), paymentDate, status || 'Paid']
    );

    if (status === 'Paid' || !status) {
      await pool.query(
        'UPDATE clients SET value = value + $1 WHERE id = $2',
        [Number(amount), req.params.id]
      );
    }

    await pool.query(
      'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
      [newTimelineId, req.params.id, new Date().toISOString().split('T')[0], 'system', `Payment of ${amount} DA added (${status || 'Paid'}).`]
    );

    const newPayment = {
      id: newPaymentId,
      receiptNumber,
      amount: Number(amount),
      date: paymentDate,
      status: status || 'Paid'
    };

    if (req.account.role === 'coworker' && newPayment.status === 'Paid') {
      await reportPaymentToAdmins(req.account, newPayment, client);
    }

    const updatedClient = await getClient(req.account.id, req.params.id);
    res.status(201).json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

app.delete('/api/clients/:id/payments/:paymentId', requireAuth, async (req, res) => {
  try {
    const client = await getClient(req.account.id, req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1 AND client_id = $2', [req.params.paymentId, req.params.id]);
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const removedPayment = paymentResult.rows[0];
    await pool.query('DELETE FROM payments WHERE id = $1', [req.params.paymentId]);

    if (removedPayment.status === 'Paid') {
      await pool.query(
        'UPDATE clients SET value = GREATEST(0, value - $1) WHERE id = $2',
        [Number(removedPayment.amount), req.params.id]
      );
    }

    const newTimelineId = `t_${Date.now()}`;
    await pool.query(
      'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5)',
      [newTimelineId, req.params.id, new Date().toISOString().split('T')[0], 'system', `Payment receipt ${removedPayment.receipt_number} for ${removedPayment.amount} DA was deleted.`]
    );

    const updatedClient = await getClient(req.account.id, req.params.id);
    res.json(updatedClient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const clients = await getClients(req.account.id);

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
    console.error(error);
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

// Initialize database on server start
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Express API running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
