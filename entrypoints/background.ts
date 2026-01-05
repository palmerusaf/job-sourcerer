import { getTrackedJobs } from '@/utils/storage/trackedJobs';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== 'install') return;

    // Open a tab on install
    await browser.tabs.create({
      url: browser.runtime.getURL('/spa.html'),
      active: true,
    });

    await browser.tabs.create({
      url: 'https://app.joinhandshake.com/login',
      active: true,
    });
  });

  // Send Handshake request to fetch data
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'Handshake-fetchJobData') {
      (async () => {
        const { jobId, token } = message.data;
        const data = await fetchJobData(jobId, token);
        sendResponse(data);
      })();
      return true;
    }
    if (message.type === 'close-spa') {
      (async () => {
        const tabs = await chrome.tabs.query({
          url: chrome.runtime.getURL('spa.html'),
        });

        for (const tab of tabs) {
          if (tab.id !== undefined) {
            await chrome.tabs.remove(tab.id);
          }
        }
      })();
      return true;
    }
    if (message.type === 'check_job_exists') {
      (async () => {
        try {
          const trackedJobs = await getTrackedJobs();
          const storedId = `${message.site}-${String(message.jobId)}`;
          const tracked = trackedJobs.includes(storedId);
          sendResponse({ tracked });
        } catch (err) {
          console.error('check_job_exists failed:', err);
          sendResponse({ tracked: false });
        }
      })();
      return true;
    }
    return false;
  });
});

async function fetchJobData(jobId: number, token: string) {
  const body = {
    operationName: 'GetBasicJobDetails',
    variables: { id: jobId },
    query: `
      query GetBasicJobDetails($id: ID!) {
        job(id: $id) {
          id
          title
          description
          createdAt
          expirationDate
          employer {
            id
            name
            logo { url }
          }
          locations {
            id
            name
            city
            state
            country
            latitude
            longitude
          }
          salaryRange {
            min
            max
            currency
            paySchedule {
              name
            }
          }
          jobType {
            id
            name
          }
          employmentType {
            id
            name
          }
          workStudy
          remote  
        }
      }
    `,
  };

  const response = await fetch('https://app.joinhandshake.com/hs/graphql', {
    method: 'POST',
    credentials: 'include', // cookies automatically included
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': token, // required for GraphQL POST
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.errors) {
    console.error('GraphQL errors:', data.errors);
    return null;
  }

  return data.data?.job;
}
