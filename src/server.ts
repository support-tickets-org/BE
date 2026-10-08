import { app } from './app';
import { config } from './config';
import { migrate } from './db/migrate';

async function main() {
  await migrate();

  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
