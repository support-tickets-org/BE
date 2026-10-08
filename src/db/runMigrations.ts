import { migrate } from './migrate';
import { pool } from './pool';

migrate()
  .then(() => console.log('Migrations up to date'))
  .catch((err) => {
    console.error('Migration failed', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
