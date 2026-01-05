import '@/assets/tailwind.css';
import { useState, useEffect } from 'react';
import logo from '/wxt.svg';
import { PublicPath } from 'wxt/browser';
import {
  getJobSiteName,
  getLinkedInJobId,
  parseHandshakeJob,
} from '@/utils/popup/popup-utils';
import { alreadySaved, saveJobData } from '@/utils/db/saveJobData';
import { useDarkMode } from '@/components/display-settings';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLinkedJobDataMsg } from '../linkedin.content';

function App() {
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);
  useDarkMode();
  useEffect(() => {
    browser.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(([t]) => setActiveTab(t));
  }, []);
  const isSupportedSite =
    activeTab?.url !== undefined && getJobSiteName(activeTab.url) !== null;

  async function openSPA() {
    await browser.tabs.create({
      url: browser.runtime.getURL('/spa.html' as PublicPath),
      active: true,
    });
  }

  async function saveJob() {
    if (!activeTab?.id || !activeTab?.url)
      return setStatus('No active tab found.');

    const jobSite = getJobSiteName(activeTab.url);
    if (jobSite === null) return setStatus('Unsupported Job Site');

    let jobData = null;

    if (jobSite === 'handshake') {
      const jobId = await browser.tabs.sendMessage(activeTab.id, {
        message: 'Handshake-getJobId',
      });
      if (jobId === null) return setStatus('No job ID found.');

      if (await alreadySaved({ jobSite, jobId }))
        return setStatus('Job Already Saved');

      const token = await browser.tabs.sendMessage(activeTab.id, {
        message: 'Handshake-getToken',
      });
      if (token === null) return setStatus('Failed to get token.');

      const fetchedJob = await browser.runtime.sendMessage({
        type: 'Handshake-fetchJobData',
        data: { jobId, token },
      });
      if (!fetchedJob) return setStatus('Fetch failed.');

      try {
        jobData = parseHandshakeJob(fetchedJob);
      } catch (e) {
        if (!(e instanceof Error)) return setStatus(`Job Parsing Error`);
        console.error(e?.stack ?? e.message);
        return setStatus(`Job Parsing Error:<${e.message}>`);
      }
    }

    if (jobSite === 'linkedin') {
      const jobId = getLinkedInJobId(activeTab.url);
      if (jobId === null) return setStatus('No job ID found.');

      if (await alreadySaved({ jobSite, jobId }))
        return setStatus('Job Already Saved');

      jobData = await browser.tabs.sendMessage(activeTab.id, {
        message: getLinkedJobDataMsg,
      });
    }

    if (jobData === null) return;
    try {
      await saveJobData(jobData);
    } catch (e) {
      if (e instanceof Error) setStatus(`Failed to Save Job: ${e.message}`);
      else setStatus('Failed to Save Job');
      return;
    }
    setStatus('Job Saved');

    browser.runtime.sendMessage({
      type: 'close-spa',
    });
  }

  return (
    <Card className='w-xs h-64 p-6 px-12 gap-2 flex flex-col'>
      <CardHeader>
        <CardTitle className='text-xl items-center flex gap-2'>
          <img src={logo} className='size-9' />
          Job Sourcerer
        </CardTitle>
      </CardHeader>
      {(isSupportedSite && (
        <AsyncButton loadingText='Saving Job...' onClickAsync={saveJob}>
          Save Job
        </AsyncButton>
      )) || <Button disabled>Unable to Save</Button>}
      <p id='status' className='text-center'>
        {status}
      </p>
      <Button variant={'secondary'} onClick={openSPA}>
        Dashboard
      </Button>
    </Card>
  );
}

export default App;
