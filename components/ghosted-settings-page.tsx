import * as Card from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { db } from '@/utils/db/db';
import { ghostedSettingsTable, jobTable } from '@/utils/db/schema';
import { and, eq, lt } from 'drizzle-orm';
export function GhostedSettings() {
  return (
    <Card.Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className='text-xl'>Ghosted Settings</div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent className='flex gap-2'>
        <Switch id='airplane-mode' />
        <label htmlFor='airplane-mode'>Dark Mode</label>
      </Card.CardContent>
    </Card.Card>
  );
}

export async function autoGhostJobs() {
  const gs = await getGhostedSettings();
  if (!gs.enabled) return;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - gs.daysTilGhosted);

  await db
    .update(jobTable)
    .set({ status: 'ghosted' })
    .where(
      and(
        eq(jobTable.status, 'applied'),
        lt(jobTable.statusChangeDate, targetDate)
      )
    );
}

export async function getGhostedSettings() {
  //init ghosted settings
  await db
    .insert(ghostedSettingsTable)
    .values({ id: 1, enabled: false, daysTilGhosted: 14 })
    .onConflictDoNothing();

  const res = await db.select().from(ghostedSettingsTable);
  return res[0];
}
