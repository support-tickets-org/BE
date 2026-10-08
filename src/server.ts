import { createApp } from './app';
import { config } from './config';
import { migrate } from './db/migrate';
import { createPool } from './db/pool';

async function main() {
  const pool = createPool(config.databaseUrl);
  await migrate(pool);

  const app = createApp({ db: pool });
  const server = app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });

  const shutdown = () => {
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
