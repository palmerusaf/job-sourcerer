import * as Card from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Loading } from '@/entrypoints/spa/App';
import { db } from '@/utils/db/db';
import { ghostedSettingsTable, jobTable } from '@/utils/db/schema';
import { and, eq, lt } from 'drizzle-orm';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
export function GhostedSettings() {
  const { settings, updateSettings } = useGhostedSettings();
  return (
    <Card.Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className='text-xl'>Auto-Ghosted Settings</div>
        </Card.CardTitle>
      </Card.CardHeader>
      {(settings !== null && (
        <Card.CardContent className='w-full'>
          {' '}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const daysTilGhosted = Number(
                (e.target as any).daysTilGhosted.value
              );
              if (daysTilGhosted < 0) {
                toast.error('Days must be positive!');
                return;
              }
              const enabled =
                (e.target as any).enabled.dataset.state === 'checked';
              await updateSettings({ daysTilGhosted, enabled });
              toast.success('Settings Updated!');
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='enabled'>Enabled</FieldLabel>
                <div>
                  <Switch id='enabled' defaultChecked={settings.enabled} />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor='daysTilGhosted'>
                  Days Until Ghosted
                </FieldLabel>
                <Input
                  id='daysTilGhosted'
                  type='number'
                  defaultValue={settings.daysTilGhosted}
                />
                <FieldDescription>
                  How many days after you apply until job will automatically be
                  marked ghosted.
                </FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <Button type='submit'>Save</Button>
              </Field>
            </FieldGroup>
          </form>
        </Card.CardContent>
      )) || (
          <div className='py-4'>
            <Loading />
          </div>
        )}
    </Card.Card>
  );
}

export async function autoGhostJobs() {
  const gs = await _getGhostedSettings();
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

export function useGhostedSettings() {
  const [settings, setSettings] = useState<null | {
    enabled: boolean;
    daysTilGhosted: number;
  }>(null);

  useEffect(() => {
    _getGhostedSettings().then(setSettings);
  }, []);
  async function updateSettings({
    daysTilGhosted,
    enabled,
  }: {
    enabled: boolean;
    daysTilGhosted: number;
  }) {
    setSettings(() => ({ daysTilGhosted, enabled }));
    await db
      .update(ghostedSettingsTable)
      .set({ daysTilGhosted, enabled })
      .where(eq(ghostedSettingsTable.id, 1));
  }
  return { settings, updateSettings };
}

async function _getGhostedSettings() {
  //init ghosted settings
  await db
    .insert(ghostedSettingsTable)
    .values({ id: 1, enabled: false, daysTilGhosted: 14 })
    .onConflictDoNothing();

  const res = await db.select().from(ghostedSettingsTable);
  return res[0];
}
