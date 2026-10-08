import { createApp } from './app';
import { config } from './config';
import { migrate } from './db/migrate';
import { createPool } from './db/pool';

async function main() {
  const pool = createPool(config.databaseUrl);
  await migrate(pool);

  createApp({ db: pool }).listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
