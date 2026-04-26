import { db } from '@/utils/db/db';
import {
  appliedJobsTable,
  JobStatusType,
  jobTable,
  statusColors,
} from '@/utils/db/schema';
import { useQuery } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import Plot from 'react-plotly.js';

export default function CurrentJobsStatsPage() {
  const { data } = useQuery({
    queryKey: ['totJobs'],
    queryFn: getSanKeyJobData,
  });

  if (!data) return null;

  const { numJobs, numApps, numUnApps, appBreakout, unAppBreakout } = data;

  // Build Sankey nodes
  const nodes: string[] = ['Total Jobs', 'Applied Jobs', 'Unapplied Jobs'];
  const links: {
    source: number;
    target: number;
    value: number;
    color?: string;
  }[] = [];

  // Applied Jobs breakdown
  for (const [s, count] of Object.entries(appBreakout)) {
    const status = s as JobStatusType;
    if (!nodes.includes(status)) nodes.push(status);
    links.push({
      source: nodes.indexOf('Applied Jobs'),
      target: nodes.indexOf(status),
      value: count,
      color: statusColors[status] ?? '#9ca3af',
    });
  }

  // Unapplied Jobs breakdown
  for (const [s, count] of Object.entries(unAppBreakout)) {
    const status = s as JobStatusType;
    if (!nodes.includes(status)) nodes.push(status);
    links.push({
      source: nodes.indexOf('Unapplied Jobs'),
      target: nodes.indexOf(status),
      value: count,
      color: statusColors[status] ?? '#9ca3af',
    });
  }

  // Link root node to applied/unapplied
  links.unshift(
    {
      source: nodes.indexOf('Total Jobs'),
      target: nodes.indexOf('Applied Jobs'),
      value: numApps,
      color: '#a78bfa', // applied purple
    },
    {
      source: nodes.indexOf('Total Jobs'),
      target: nodes.indexOf('Unapplied Jobs'),
      value: numUnApps,
      color: '#94a3b8', // neutral gray for unapplied
    }
  );

  // Assign node colors based on status or category
  const nodeColors = nodes.map((s) => {
    const status = s as
      | JobStatusType
      | 'Total Jobs'
      | 'Applied Jobs'
      | 'Unapplied Jobs';
    if (status === 'Total Jobs') return '#0ea5e9';
    if (status === 'Applied Jobs') return '#a78bfa';
    if (status === 'Unapplied Jobs') return '#94a3b8';
    return statusColors[status] ?? '#9ca3af';
  });

  return (
    <>
      <h1 className='text-4xl text-center font-bold text-slate-500'>
        Current Status for All Jobs
      </h1>
      <Plot
        data={[
          {
            type: 'sankey',
            orientation: 'h',
            node: {
              pad: 15,
              thickness: 20,
              line: { color: 'gray', width: 0.5 },
              label: nodes,
              color: nodeColors,
            },
            link: {
              source: links.map((l) => l.source),
              target: links.map((l) => l.target),
              value: links.map((l) => l.value),
              color: links.map((l) => l.color ?? '#9ca3af'),
            },
          },
        ]}
        layout={{
          title: {
            text: `Job Tracker Overview (${numJobs} total jobs)`,
          },
          font: { size: 14 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          autosize: true,
        }}
        config={{ displayModeBar: false, responsive: true }}
        className='h-full'
      />
    </>
  );
}

async function getSanKeyJobData() {
  const appliedJobs = await db
    .select()
    .from(jobTable)
    .innerJoin(appliedJobsTable, eq(appliedJobsTable.jobId, jobTable.id));

  const allJobs = await db.select().from(jobTable);

  const unappliedJobs = allJobs.filter(({ id }) => {
    for (const { jobs } of appliedJobs) {
      if (jobs.id === id) return false;
    }
    return true;
  });

  const numJobs = allJobs.length;
  const numApps = appliedJobs.length;
  const numUnApps = unappliedJobs.length;

  // Break down by status
  const appBreakout = appliedJobs.reduce(
    (res, { jobs: { status } }) => {
      res[status] = (res[status] ?? 0) + 1;
      return res;
    },
    {} as Record<string, number>
  );

  const unAppBreakout = unappliedJobs.reduce(
    (res, { status }) => {
      res[status] = (res[status] ?? 0) + 1;
      return res;
    },
    {} as Record<string, number>
  );

  return { numJobs, numApps, numUnApps, appBreakout, unAppBreakout };
}
