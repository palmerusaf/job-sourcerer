import {
  JobInsertType,
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

export function parseFetchedJob(data: unknown): JobInsertType | null {
  // First check that it's an object
  if (!data || typeof data !== 'object') return null;

  const d = data as any; // Narrow down for now

  const invalid = !(
    d?.description ||
    d?.title ||
    d?.id ||
    d?.employer?.name ||
    d?.locations?.[0]?.name
  );

  if (invalid) return null;

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

  res.payType = d.salaryRange.paySchedule.name ?? '';

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
