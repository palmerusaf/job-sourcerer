import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { createTbleSqlRaw } from './createTbleSqlRaw';

// use separate database namespaces for production and development
const databaseName = import.meta.env.DEV ? 'dev-db' : 'prod-db';
const client = new PGlite(`idb://${databaseName}`);

// run each sql creation statement one by one ignore table already exists errors
for (const sqlStm of createTbleSqlRaw.split(';')) {
  client.exec(sqlStm + ';').catch((error) => {
    if (!error.message.includes('already exists')) console.error(error);
  });
}
export const db = drizzle({ client });
