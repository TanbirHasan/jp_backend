import 'dotenv/config';
import app from './app';
import { pool } from './config/db';

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', (error as Error).message);
    process.exit(1);
  }
}

startServer();
