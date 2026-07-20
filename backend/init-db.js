import 'dotenv/config';
import { initDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('Database initialized!');

    console.log('\nSeeding database...');
    // Dynamically import seed.js to run it
    const seedModule = await import(path.join(__dirname, 'seed.js'));
    await seedModule.seedDatabase();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

main();
