import dotenv from 'dotenv';
import app from './src/app.js';
import { testConnection } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 3005;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`[server] running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  }
}

start();