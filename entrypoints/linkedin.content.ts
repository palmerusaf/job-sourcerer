import { insertTrackedIcon } from '@/utils/insertTrackedIcon';
import { observeUrlChanges } from '@/utils/observeUrlChanges';
import { parseLinkedinJob } from '@/utils/popup/popup-utils';

// Finds and returns the selected job posting url in users active (https://asu.joinhandshake.com/stu/postings) window.
export const getLinkedJobDataMsg = 'da12a831-e7c9-410c-bb2f-b64e634662cf';
export default defineContentScript({
  allFrames: false,
  matches: ['*://*.linkedin.com/*'],
  main() {
    document;
    browser.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if (request.message === 'get-job-site') {
          if (location.hostname.includes('linkedin.com'))
            sendResponse('linkedin');
          return sendResponse(null);
        }

        if (request.message === 'getLinkedJobId') {
          // example
          // https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4349002432
          const jobId = new URLSearchParams(window.location.search).get(
            'currentJobId'
          );
          sendResponse(jobId);
        }
        if (request.message === getLinkedJobDataMsg) {
          debugger;
          const jobId = new URLSearchParams(window.location.search).get(
            'currentJobId'
          );
          const jobData = parseLinkedinJob(document, jobId ?? '');
          sendResponse(jobData);
        }
      }
    );

    observeUrlChanges(async () => {
      const jobId = new URLSearchParams(window.location.search).get(
        'currentJobId'
      );
      if (!jobId) return;

      console.log('Found job ID:', jobId);

      const res = await browser.runtime.sendMessage({
        type: 'check_job_exists',
        jobId,
        site: 'linkedin',
      });

      if (res?.tracked) {
        insertTrackedIcon(jobId);
      } else {
        removeTrackedIcon();
      }
    });
  },
});
