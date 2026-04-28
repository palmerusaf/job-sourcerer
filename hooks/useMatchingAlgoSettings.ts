import { useEffect, useState } from 'react';
import { db } from '@/utils/db/db';
import { matchingAlgoSettingsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export function useMatchingAlgoSettings() {
  const [settings, setSettings] = useState<
    null | typeof matchingAlgoSettingsTable.$inferInsert
  >(null);

  useEffect(() => {
    _getMatchingAlgoSettings().then(setSettings);
  }, []);

  async function updateSettings({
    enableSbert,
    keywordStrategy,
  }: typeof matchingAlgoSettingsTable.$inferInsert) {
    setSettings(() => ({ enableSbert, keywordStrategy }));
    await db
      .update(matchingAlgoSettingsTable)
      .set({ enableSbert, keywordStrategy })
      .where(eq(matchingAlgoSettingsTable.id, 1));
  }

  return { settings, updateSettings };
}

async function _getMatchingAlgoSettings() {
  // Initialize matching algo settings
  await db
    .insert(matchingAlgoSettingsTable)
    .values({ id: 1, enableSbert: true, keywordStrategy: 'idf-tf' })
    .onConflictDoNothing();

  const res = await db.select().from(matchingAlgoSettingsTable);
  return res[0];
}
