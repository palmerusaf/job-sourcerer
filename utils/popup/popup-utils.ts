import {
  employmentTypeList,
  JobInsertType,
  JobSelectType,
  jobSiteNames,
  JobSiteNameType,
  jobTable,
} from '../db/schema';

export function getHandshakeJobId(url: string): number | null {
  const segments = new URL(url).pathname.split('/').filter(Boolean);
  if (
    segments.length === 2 &&
    (segments[0] === 'job-search' || segments[0] === 'jobs')
  ) {
    const id = parseInt(segments[1], 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

export function parseLinkedinJob(
  document: Document,
  jobId: string
): JobInsertType {
  const { body } = document;
  const imgs = body.querySelectorAll('img');
  let companyLogoUrl = null;
  for (const img of imgs) {
    if (img.width === 32 && img.height === 32) {
      companyLogoUrl = img.src;
      break;
    }
  }
  const description =
    body.getElementsByClassName('jobs-description__content')[0].outerHTML ??
    'N/A';
  const companyName =
    body
      .getElementsByClassName(
        'job-details-jobs-unified-top-card__company-name'
      )[0]
      .querySelector('a')?.textContent ?? 'N/A';
  const [buttons] = body.getElementsByClassName(
    'job-details-fit-level-preferences'
  );
  const payText = buttons.childNodes
    .values()
    .find((el) => el.textContent?.includes('$'))?.textContent;
  let payType: JobInsertType['payType'] = null;
  let payrate: JobInsertType['payrate'] = null;
  if (payText) {
    const payTypeMap: { [key: string]: JobSelectType['payType'] } = {
      hr: 'Hourly Wage',
      yr: 'Annual Salary',
      mo: 'Monthly Stipend',
    };
    for (const key in payTypeMap) {
      if (payText.includes(key)) {
        payType = payTypeMap[key];
        break;
      }
    }
    payrate = linkedInPayParser(payText);
  }
  const remote = buttons.textContent?.toLowerCase().includes('remote') ?? false;
  const intern = buttons.textContent?.toLowerCase().includes('intern') ?? false;
  const link = `https://www.linkedin.com/jobs/view/${jobId}`;
  const location =
    body.getElementsByClassName(
      'job-details-jobs-unified-top-card__primary-description-container'
    )[0]?.firstElementChild?.firstElementChild?.firstElementChild
      ?.textContent ?? 'N/A';
  const title =
    body.getElementsByClassName(
      'job-details-jobs-unified-top-card__job-title'
    )[0].textContent ?? 'N/A';
  let employmentType;
  for (const empType of employmentTypeList) {
    if (buttons.textContent?.toLowerCase().includes(empType.toLowerCase())) {
      employmentType = empType;
      break;
    }
  }
  return {
    jobIdFromSite: `linkedin-${jobId}`,
    payType,
    payrate,
    employmentType,
    description,
    companyName,
    companyLogoUrl,
    link,
    remote,
    location,
    title,
    archived: false,
    status: 'recently added',
    intern,
  };
}

export function linkedInPayParser(payText: string): number {
  const payRange = payText
    .split(' - ')
    .filter((el) => el.includes('$'))
    .map((el) => el.toUpperCase())
    .map((el) => el.replaceAll(/[^\d.]/g, ''))
    .map((el) => parseFloat(el));
  const [low, high] = payRange;
  let payrate = high ? (low + high) / 2 : low;
  payrate *= 100;
  payrate = Math.round(payrate);
  if (payText.toUpperCase().includes('K')) payrate *= 1000;
  return payrate;
}

/** @throws WARN: Error if parsing fails because of missing members in fetched data. */
export function parseHandshakeJob(data: unknown): JobInsertType {
  const d = data as any; // Narrow down for now

  const res: typeof jobTable.$inferInsert = {
    link: `https://app.joinhandshake.com/jobs/${d.id}`,
    intern: false,
    companyName: d.employer.name,
    description: d.description,
    remote: d.remote ?? false,
    jobIdFromSite: `handshake-${d.id}`,
    title: d.title,
    location: d.locations?.[0]?.name ?? 'remote',
    payrate: d.salaryRange
      ? Math.floor((d.salaryRange.max + d.salaryRange.min) / 2)
      : null,
    closeOutDate: d.expirationDate ? new Date(d.expirationDate) : null,
    companyLogoUrl: d.employer?.logo?.url ?? null,
    datePosted: d.createdAt ? new Date(d.createdAt) : null,
  };

  const empType = d.employmentType?.name ?? '';
  if (empType.includes('Full')) res.employmentType = 'Full-Time';
  else if (empType.includes('Part')) res.employmentType = 'Part-Time';
  else if (empType.includes('Con')) res.employmentType = 'Contractor';
  else if (empType.includes('Sea')) res.employmentType = 'Seasonal';
  else res.employmentType = 'Full-Time';

  res.payType = d?.salaryRange?.paySchedule?.name ?? '';

  return res;
}

export function getJobSiteName(url: string): JobSiteNameType | null {
  let baseUrl: null | string = null;
  try {
    baseUrl = new URL(url).origin;
  } catch (e) {
    return null;
  }
  if (baseUrl === null) return null;
  for (const n of jobSiteNames) if (baseUrl.includes(n)) return n;
  return null;
}
