import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data', 'clients.json');

app.use(cors());
app.use(express.json());

// Helper function to read clients from the file
async function readClients() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, start with empty array
      await fs.writeFile(DATA_FILE, JSON.stringify([]));
      return [];
    }
    throw error;
  }
}

// Helper function to write clients to the file
async function writeClients(clients) {
  await fs.writeFile(DATA_FILE, JSON.stringify(clients, null, 2));
}

// GET all clients
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await readClients();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read clients' });
  }
});

// GET single client
app.get('/api/clients/:id', async (req, res) => {
  try {
    const clients = await readClients();
    const client = clients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read client details' });
  }
});

// POST create client (patient)
app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, phone, company, status, value, totalPayment } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const clients = await readClients();
    const newClient = {
      id: `c_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      company: company || '', // e.g. Insurance Provider
      status: status || 'Active',
      value: Number(value) || 0,
      appointments: [],
      payments: [],
      timeline: [
        {
          id: `t_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'system',
          description: 'Patient file created.'
        }
      ],
      totalPayment: Number(totalPayment) || 0,
    };

    clients.push(newClient);
    await writeClients(clients);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient profile' });
  }
});

// PUT update client (patient)
app.put('/api/clients/:id', async (req, res) => {
  try {
    const clients = await readClients();
    const index = clients.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const original = clients[index];
    const updated = {
      ...original,
      ...req.body,
      // Ensure complex structures are preserved
      appointments: req.body.appointments || original.appointments || [],
      payments: req.body.payments || original.payments || [],
      timeline: req.body.timeline || original.timeline || [],
      id: original.id
    };

    clients[index] = updated;
    await writeClients(clients);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
});

// DELETE client (patient)
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const clients = await readClients();
    const filtered = clients.filter(c => c.id !== req.params.id);
    
    if (filtered.length === clients.length) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    await writeClients(filtered);
    res.json({ message: 'Patient profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient profile' });
  }
});

// POST add patient appointment
app.post('/api/clients/:id/appointments', async (req, res) => {
  try {
    const { date, time, treatment, status } = req.body;
    if (!date || !treatment) {
      return res.status(400).json({ error: 'Date and Treatment description are required' });
    }

    const clients = await readClients();
    const client = clients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newAppointment = {
      id: `apt_${Date.now()}`,
      date,
      time: time || 'Flexible',
      treatment,
      status: status || 'Scheduled'
    };

    if (!client.appointments) client.appointments = [];
    client.appointments.push(newAppointment);
    
    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Appointment scheduled for ${date} at ${time} (${treatment}).`
    });

    await writeClients(clients);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

// POST add payment
app.post('/api/clients/:id/payments', async (req, res) => {
  try {
    const { amount, date,  status } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Payment amount is required' });
    }

    const clients = await readClients();
    const client = clients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const newPayment = {
      id: `pay_${Date.now()}`,
      receiptNumber: `RCPT-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      
      status: status || 'Paid'
    };

    if (!client.payments) client.payments = [];
    client.payments.push(newPayment);
    
    // Increment the client's total payments value
    if (newPayment.status === 'Paid') {
      client.value = (Number(client.value) || 0) + Number(amount);
    }

    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Payment of $${amount} added (${newPayment.status}).`
    });

    await writeClients(clients);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

// DELETE remove payment
app.delete('/api/clients/:id/payments/:paymentId', async (req, res) => {
  try {
    const clients = await readClients();
    const client = clients.find(c => c.id === req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (!client.payments) client.payments = [];
    const paymentIndex = client.payments.findIndex(p => p.id === req.params.paymentId);
    if (paymentIndex === -1) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const removedPayment = client.payments[paymentIndex];
    client.payments.splice(paymentIndex, 1);

    // Subtract from patient billing value if it was paid
    if (removedPayment.status === 'Paid') {
      client.value = Math.max(0, (Number(client.value) || 0) - Number(removedPayment.amount));
    }

    if (!client.timeline) client.timeline = [];
    client.timeline.unshift({
      id: `t_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'system',
      description: `Payment receipt ${removedPayment.receiptNumber} for $${removedPayment.amount} was deleted.`
    });

    await writeClients(clients);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// GET aggregated statistics
app.get('/api/stats', async (req, res) => {
  try {
    const clients = await readClients();
    
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let activeAppointments = 0;
    
    clients.forEach(client => {
      // Calculate active appointments (Scheduled)
      if (client.appointments) {
        activeAppointments += client.appointments.filter(a => a.status === 'Scheduled').length;
      }
      
      // Calculate revenue stats from payments
      if (client.payments) {
        client.payments.forEach(pay => {
          if (pay.status === 'Paid') {
            totalRevenue += pay.amount;
          } else if (pay.status === 'Pending') {
            pendingRevenue += pay.amount;
          }
        });
      }
    });

    const activeClientsCount = clients.filter(c => c.status === 'Active').length;
    const inactiveClientsCount = clients.filter(c => c.status === 'Inactive').length;

    res.json({
      totalClients: clients.length,
      activeClients: activeClientsCount,
      leads: inactiveClientsCount,
      totalRevenue,
      pendingRevenue,
      activeProjects: activeAppointments
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute stats' });
  }
});

app.listen(PORT, () => {
  console.log(`Express API running on port ${PORT}`);
});
