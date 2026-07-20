import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

async function readJson(filePath, defaultValue) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

function clientsFileFor(accountId) {
  return path.join(DATA_DIR, 'users', accountId, 'clients.json');
}

async function seedDatabase() {
  console.log('Starting database seeding...');
  const client = await pool.connect();
  try {
    // Seed accounts
    console.log('Seeding accounts...');
    const accounts = await readJson(path.join(DATA_DIR, 'accounts.json'), []);
    for (const account of accounts) {
      await client.query(
        'INSERT INTO accounts (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [account.id, account.name, account.email, account.password, account.role, account.createdAt]
      );
    }

    // Seed clients and related data
    console.log('Seeding clients...');
    for (const account of accounts) {
      const clients = await readJson(clientsFileFor(account.id), []);
      for (const client of clients) {
        // Insert client
        await client.query(
          'INSERT INTO clients (id, account_id, name, email, phone, company, status, value, total_payment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
          [client.id, account.id, client.name, client.email || '', client.phone || '', client.company || '', client.status || 'Active', Number(client.value) || 0, Number(client.totalPayment) || 0]
        );

        // Insert appointments
        if (client.appointments && client.appointments.length > 0) {
          for (const apt of client.appointments) {
            await client.query(
              'INSERT INTO appointments (id, client_id, date, time, treatment, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
              [apt.id, client.id, apt.date, apt.time || 'Flexible', apt.treatment, apt.status || 'Scheduled']
            );
          }
        }

        // Insert payments
        if (client.payments && client.payments.length > 0) {
          for (const pay of client.payments) {
            await client.query(
              'INSERT INTO payments (id, client_id, receipt_number, amount, date, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
              [pay.id, client.id, pay.receiptNumber, Number(pay.amount), pay.date, pay.status || 'Paid']
            );
          }
        }

        // Insert timeline
        if (client.timeline && client.timeline.length > 0) {
          for (const tl of client.timeline) {
            await client.query(
              'INSERT INTO timeline (id, client_id, date, type, description) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
              [tl.id, client.id, tl.date, tl.type, tl.description]
            );
          }
        }
      }
    }

    // Seed network
    console.log('Seeding network...');
    const network = await readJson(path.join(DATA_DIR, 'network.json'), []);
    for (const net of network) {
      await client.query(
        'INSERT INTO network (id, admin_id, admin_name, coworker_id, coworker_name, status, created_at, responded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [net.id, net.adminId, net.adminName, net.coworkerId, net.coworkerName, net.status, net.createdAt, net.respondedAt]
      );
    }

    // Seed admin income
    console.log('Seeding admin income...');
    const adminIncomeData = await readJson(path.join(DATA_DIR, 'admin_income.json'), {});
    for (const [adminId, coworkerData] of Object.entries(adminIncomeData)) {
      for (const [coworkerId, data] of Object.entries(coworkerData)) {
        const adminIncomeId = `ai_${adminId}_${coworkerId}`;
        await client.query(
          'INSERT INTO admin_income (id, admin_id, coworker_id, coworker_name, coworker_email, total_income) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
          [adminIncomeId, adminId, coworkerId, data.coworkerName, data.coworkerEmail, Number(data.totalIncome) || 0]
        );

        if (data.payments && data.payments.length > 0) {
          for (const pay of data.payments) {
            await client.query(
              'INSERT INTO admin_income_payments (id, admin_income_id, date, amount, client_id, client_name, receipt_number, payment_id, recorded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
              [pay.id, adminIncomeId, pay.date, Number(pay.amount), pay.clientId, pay.clientName, pay.receiptNumber, pay.paymentId, pay.recordedAt]
            );
          }
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
