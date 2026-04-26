import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { createTbleSqlRaw } from './createTbleSqlRaw';

const databaseName = import.meta.env.DEV ? 'dev-db' : 'prod-db';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let initPromise: Promise<typeof dbInstance> | null = null;

function initDb() {
  const client = new PGlite(`idb://${databaseName}`);

  const setup = async () => {
    for (const sqlStm of createTbleSqlRaw.split(';')) {
      if (!sqlStm.trim()) continue;

      try {
        await client.exec(sqlStm + ';');
      } catch (error: any) {
        if (!error.message.includes('already exists')) {
          console.error(error);
        }
      }
    }

    return drizzle({ client });
  };

  return setup();
}

export const db: typeof drizzle extends (...args: any) => any
  ? ReturnType<typeof drizzle>
  : any = new Proxy({} as any, {
    get(_target, prop) {
      if (dbInstance) {
        return (dbInstance as any)[prop];
      }

      if (!initPromise) {
        initPromise = initDb().then((db) => {
          dbInstance = db;
          return db;
        });
      }

      // This will only hit if DB isn't ready yet
      throw initPromise;
    },
  });
