import { JSX } from 'react';
import * as Card from '@/components/ui/card';
import { db } from '@/utils/db/db';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sql } from 'drizzle-orm';
import { toast } from 'sonner';

export function ImportExportData(): JSX.Element {
  const [tables, setTables] = useState<string[]>([]);
  useEffect(() => {
    db.execute(
      sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE';
          `
    ).then(({ rows }) => setTables(rows.map((i) => i.table_name) as string[]));
  }, []);

  const [selTable, setSelTable] = useState<string>('');
  return (
    <Card.Card className='flex flex-col items-center mx-auto w-full max-w-2xl'>
      <Card.CardHeader>
        <Card.CardTitle>
          <div className='text-xl'>Data Settings</div>
        </Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent className='flex flex-col gap-2'>
        {tables.length == 0 ? (
          <div className='text-lg animate-pulse'>Loading...</div>
        ) : (
          <Select onValueChange={setSelTable}>
            <SelectTrigger>
              <SelectValue placeholder='Select a Data Table' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {tables.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {selTable.length != 0 && (
          <div className='flex gap-2'>
            <AsyncButton
              onClickAsync={() =>
                new Promise<void>((res, rej) => {
                  const input = document.createElement('input');
                  input.type = 'file';

                  input.onchange = () => {
                    const file = input.files?.[0];

                    (async () => {
                      try {
                        if (!file) return res();

                        await db.$client.query(
                          `COPY ${selTable} FROM '/dev/blob' 
                                                  DELIMITER ',' CSV HEADER; `,
                          [],
                          { blob: file }
                        );

                        res();
                      } catch (e) {
                        const message =
                          e instanceof Error
                            ? e.message
                            : typeof e === 'string'
                              ? e
                              : 'Import failed';
                        toast.error(message);
                        rej(e);
                      } finally {
                        input.remove();
                      }
                    })();
                  };

                  input.click(); // must stay synchronous
                })
              }
            >
              Import
            </AsyncButton>
            <AsyncButton
              onClickAsync={async () => {
                debugger;
                const { blob } = await db.$client.query(
                  `COPY ${selTable} TO '/dev/blob' WITH (FORMAT CSV, HEADER);`
                );
                if (blob == undefined) return;
                // 1. Create a temporary URL for the Blob
                const url = window.URL.createObjectURL(blob);

                // 2. Create a hidden anchor element
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${selTable}.csv`;

                // 3. Append to body and trigger click
                document.body.appendChild(a);
                a.click();

                // 4. Clean up: remove the link and revoke the URL
                window.URL.revokeObjectURL(url);
                a.remove();
              }}
              variant={'secondary'}
            >
              Export
            </AsyncButton>
          </div>
        )}
      </Card.CardContent>
    </Card.Card>
  );
}
