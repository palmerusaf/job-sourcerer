import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { eq } from 'drizzle-orm';

import {
  JobSelectType,
  jobStatus,
  jobStatusEmojis,
  JobStatusType,
  jobTable,
} from '@/utils/db/schema';
import { db } from '@/utils/db/db';
import { ArchiveButton, columns, DeleteButton, EditStatus } from './columns';
import { DataTable } from './data-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '../ui/button';
import { getSavedJobs } from '@/utils/db/getSavedJobs';
import { Input } from '../ui/input';

export function JobTrackerPage() {
  const { data } = useQuery<JobSelectType[]>({
    queryKey: ['savedJobs'],
    queryFn: getSavedJobs,
  });

  const [tabValue, setTabValue] = useState<
    typeof jobTable.$inferInsert.status | 'all'
  >('all');
  const [selRowState, setSelRowState] = useState({});
  const [selRowData, setSelRowData] = useState<JobSelectType[]>([]);
  const [companySearchParam, setCompanySearchParam] = useState('');
  const [filteredData, setFilteredData] = useState(data ?? []);
  useEffect(() => {
    setFilteredData(() => {
      if (!data) return [];
      const tabValFilterCB = ({ status }: { status: JobStatusType }): boolean =>
        tabValue === 'all' || status === tabValue;
      return data
        .filter(tabValFilterCB)
        .filter(
          ({ companyName }) =>
            !companySearchParam.length ||
            companyName.toLowerCase().includes(companySearchParam.toLowerCase())
        );
    });
  }, [data, tabValue, companySearchParam]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection: selRowState },
    onRowSelectionChange: setSelRowState,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  useEffect(() => {
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);
    setSelRowData(selectedData);
  }, [selRowState, table]);

  //clear checkboxes when data is updated
  useEffect(() => {
    setSelRowState({});
  }, [data]);

  if (!data)
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-slate-500 animate-pulse'>Loading...</div>
      </div>
    );

  return (
    <div className='grid gap-2 content-center pb-12 px-12'>
      <StatusTabs />
      <Input
        className='w-md mx-auto'
        onChange={({ target: { value } }) => setCompanySearchParam(() => value)}
        placeholder='🔍︎ Filter by company name.'
      />
      <MultiSelectMenu rows={selRowData} />
      <DataTable table={table} />
    </div>
  );

  function StatusTabs() {
    return (
      <Tabs
        value={tabValue}
        className='flex justify-center'
        onValueChange={(val) => setTabValue(val as typeof tabValue)}
      >
        <TabsList>
          <TabsTrigger className='cursor-pointer' value='all'>
            All
          </TabsTrigger>
          {jobStatus.map((el) => (
            <TabsTrigger key={el} className='cursor-pointer' value={el}>
              {jobStatusEmojis[el]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    );
  }
}

function MultiSelectMenu({ rows }: { rows: JobSelectType[] }) {
  if (!rows.length) return <></>;
  const ids = rows.map(({ id }) => id);
  return (
    <div className='flex justify-center gap-4 animate-in fade-in zoom-in duration-500'>
      <EditStatus ids={ids} label={<Button>Update Status</Button>} />
      <ArchiveButton ids={ids} />
      <DeleteButton ids={ids} />
    </div>
  );
}
