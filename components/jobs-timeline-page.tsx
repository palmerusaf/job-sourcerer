import { getStreamgraphData } from '@/utils/db/jobStatusHistory';
import { jobStatus, statusColors } from '@/utils/db/schema';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StreamGraphData {
  date: string;
  [key: string]: string | number;
}

interface JobStatusStreamGraphProps {
  data: StreamGraphData[];
}

const JobStatusStreamGraph: React.FC<JobStatusStreamGraphProps> = ({
  data,
}) => {
  return (
    <div className='w-full h-full p-8 pb-20'>
      <div className='mb-8'>
        <h1 className='text-4xl text-center font-bold text-slate-500 mb-2'>
          Job Application Status Timeline
        </h1>
        <p className='text-slate-500'></p>
      </div>

      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          stackOffset='wiggle'
        >
          <XAxis
            dataKey='date'
            stroke='#797d85'
            style={{ fontSize: '12px' }}
            tickFormatter={(v) => new Date(v).toLocaleDateString()}
          />
          <Tooltip
            labelFormatter={(v) => new Date(v).toLocaleDateString()}
            labelStyle={{ color: 'black' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #797d85',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType='circle' />

          {jobStatus.map((status) => (
            <Area
              key={status}
              type='monotone'
              dataKey={status}
              stackId='1'
              stroke={statusColors[status]}
              fill={statusColors[status]}
              fillOpacity={0.8}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function JobsTimelinePage() {
  const [data, setData] = useState<
    Array<{ date: string; [key: string]: string | number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const streamData = await getStreamgraphData();
        setData(streamData);
      } catch (err) {
        console.error('Failed to load streamgraph data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-slate-500'>Loading streamgraph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-red-600'>{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-xl text-slate-500'>No data available</div>
      </div>
    );
  }

  return <JobStatusStreamGraph data={data} />;
}
