import { AddJobPage } from '@/components/add-job-Page/page';
import { DisplaySettings } from '@/components/display-settings';
import { JobArchivePage } from '@/components/job-archive-Page/page';
import { JobTrackerPage } from '@/components/job-tracker-Page/page';
import { QueryProvider } from '@/components/query-provider';
import { ResumeDisplay } from '@/components/resume-display';
import { ResumeUpload } from '@/components/resume-upload.tsx';
import * as icon from 'lucide-react';
import { Toaster } from 'sonner';
import { devMenu } from '../../components/dev-menu';
import { PrevAppsPage } from '@/components/prev-apps-page';
import JobsTimelinePage from '@/components/jobs-timeline-page';
import { useDarkMode } from '@/components/display-settings';
import { ResumeStatusGraph } from '@/components/ResumeStatusGraph.tsx';
import { DeleteResumePage } from '@/components/delete-resume-page';
import { lazy, Suspense } from 'react';

// lazy loaded comp that are big
const CurrentJobsStatsPage = lazy(
  () => import('@/components/current-jobs-stats-page')
);

export default function App() {
  useDarkMode();
  return (
    <QueryProvider>
      <Toaster richColors position='top-center' />
      <SideBar
        menuData={[
          {
            menu: 'Manage Applications',
            icon: icon.Briefcase,
            items: [
              {
                subMenu: 'Job Tracker',
                content: <JobTrackerPage />,
              },
              {
                subMenu: 'Add Job',
                content: <AddJobPage />,
              },
              {
                subMenu: 'Archived Jobs',
                content: <JobArchivePage />,
              },
              {
                subMenu: 'Previous Apps',
                content: <PrevAppsPage />,
              },
            ],
          },
          {
            menu: 'Manage Resumes',
            icon: icon.Pencil,
            items: [
              {
                subMenu: 'Upload Resume',
                content: <ResumeUpload />,
              },
              {
                subMenu: 'Display Resume',
                content: <ResumeDisplay />,
              },
              {
                subMenu: 'Delete Resumes',
                content: <DeleteResumePage />,
              },
            ],
          },
          {
            menu: 'Stats',
            icon: icon.LineChart,
            items: [
              {
                subMenu: 'Current Jobs',
                content: (
                  <Suspense fallback={<Loading />}>
                    <CurrentJobsStatsPage />
                  </Suspense>
                ),
              },
              {
                subMenu: 'Jobs Timeline',
                content: <JobsTimelinePage />,
              },
              {
                subMenu: 'Resume Status',
                content: <ResumeStatusGraph />,
              },
            ],
          },
          {
            menu: 'Settings',
            icon: icon.Settings2,
            items: [
              {
                subMenu: 'Display',
                content: <DisplaySettings />,
              },
            ],
          },
          ...devMenu,
        ]}
      />
    </QueryProvider>
  );
}

function NotImplemented() {
  return (
    <div className='flex justify-center items-center w-full h-full'>
      Not Implemented
    </div>
  );
}

function Loading() {
  return (
    <div className='flex items-center justify-center h-full'>
      <div className='text-xl text-slate-500 animate-pulse'>Loading...</div>
    </div>
  );
}
