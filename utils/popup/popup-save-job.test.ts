import { onsiteData, remoteData } from './handshake-test-data.ts';
import { JSDOM } from 'jsdom';
import {
  getHandshakeJobId,
  getJobSiteName,
  linkedInPayParser,
  parseHandshakeJob,
  parseLinkedinJob,
} from './popup-utils.ts';
import { describe, expect, test } from 'vitest';
import { linkedinTestHtmlString as linkedinTest1Data } from './linkedin-test1-data.ts';
import { data as linkedinYearTestData } from './linkedin-test2-data.ts';
import { data as linkedinSinglePayData } from './linkedin-test3-data.ts';
import { data as linkedinNoPayRate } from './linkedin-test4-data.ts';
import { data as linkedinData5 } from './linkedin-test5-data.ts';

describe('getJobSiteName Tests', () => {
  test('handshake', () => {
    expect(
      getJobSiteName(
        'https://app.joinhandshake.com/job-search/10119675?page=1&per_page=25'
      )
    ).toBe('handshake');
  });
  test('linkedin', () => {
    expect(
      getJobSiteName(
        'https://www.linkedin.com/jobs/view/4325252246/?alternateChannel=search&eBP=CwEAAAGbdWOV8yO2WrYcm3q7ZQuLOmNTcJfACh64cmZYzf8VzvP0zjKfgPw-o7fJDoBmFibZrcP36UFxSCHrJMqp4XlytR3vZP-OSff47KczgUoKQa5jyYsfgr0tkIi3OIjdm-_g1azGpvvohNqgitHPkNVpKjB2LlOg4CklEed__rNwv2F49AAe1ijXl3Nv06FQ90hKUcMyBvGT57AyLUMV-M8jNvRqrQfL6KWY4bC5FXvLuyH_MbPdzmJiyInusjpuXuQKEzDx52LODlEHniRRPi8PZNhalBPxaMk1VYy_X-_Y8fJ6lbNTV85akmFFFC5jJdVh0ssJSV4YTz4FlqBTFYz5ofuY2ootxRNh9xFy_reMRImGZeIUdjpbGM7v_BWJJXBuvEZ9r9lJ1ZW5a2hMFTNp1Z2fGjUYQcRSj80F5tcWoeaQDaGiISWFKjmKInm3pXF9dslyNa_JlrsXwSLcNR8GdJLoWj_cy3-7R7L0OLniYXGjCuQBkf9jRqqxIE8&trk=d_flagship3_preload&refId=NmBoMI46s%2FOnckjXa242Ag%3D%3D&trackingId=VX0B128wC8nmdNbUjmr0qg%3D%3D'
      )
    ).toBe('linkedin');
  });

  test('null', () => {
    expect(getJobSiteName('https://google.com/')).toBeNull();
  });
});

describe('getHandshakeJobId Tests', () => {
  test('returns null when job id not in url', () => {
    expect(
      getHandshakeJobId('https://app.joinhandshake.com/inbox?filter=all')
    ).toBeNull();
  });
  test('returns job id when job id in url', () => {
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/job-search/10119675?page=1&per_page=25'
      )
    ).toBe(10119675);
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/job-search/9966672?page=1&per_page=25'
      )
    ).toBe(9966672);
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/jobs/10119675?searchId=f5b81e40-03c4-4062-940d-ff23ea45e145'
      )
    ).toBe(10119675);
  });
  test("returns null when a number other than a job id is in url aka doesn't return false positives", () => {
    // https://app.joinhandshake.com/stu/events/1428880
    expect(
      getHandshakeJobId('https://app.joinhandshake.com/stu/events/1428880')
    ).toBeNull();
    expect(
      getHandshakeJobId(
        'https://app.joinhandshake.com/stu/career_fairs/60565/jobs?page=1&per_page=12'
      )
    ).toBeNull();
  });
});

describe('parse handshake fetch', () => {
  test('parses data', () => {
    [remoteData, onsiteData].forEach((el) => {
      const pd = parseHandshakeJob(el);
      expect(pd).not.toBeNull();
      if (pd === null) return;

      expect(pd.closeOutDate).toStrictEqual(new Date(el.expirationDate));
      expect(pd.companyLogoUrl).toBe(el.employer.logo?.url ?? null);
      expect(pd.companyName).toBe(el.employer.name);
      expect(pd.datePosted).toStrictEqual(new Date(el.createdAt));
      expect(pd.description).toBe(el.description);
      expect(pd.employmentType).toBe(el.employmentType.name);
      expect(pd.intern).toBe(false);
      expect(pd.jobIdFromSite).toBe(`handshake-${el.id}`);
      expect(pd.link).toBe(`https://app.joinhandshake.com/jobs/${el.id}`);
      expect(pd.location).toBe(el.locations?.[0]?.name ?? 'remote');
      expect(pd.remote).toBe(el.remote);
      expect(pd.title).toBe(el.title);
      const testRate = Math.floor(
        (el.salaryRange.max + el.salaryRange.min) / 2
      );
      expect(pd.payrate).toBe(testRate);
      expect(pd.payType).toBe(el.salaryRange.paySchedule.name);
    });
  });

  test('invalid data throws error', () => {
    expect(() => parseHandshakeJob({})).toThrowError();
    expect(() => parseHandshakeJob('')).toThrowError();
    expect(() => parseHandshakeJob(1)).toThrowError();
    expect(() => parseHandshakeJob(1.4)).toThrowError();
  });
});

describe('parse linkedin jobs', () => {
  test('test 1', () => {
    const dom = new JSDOM(linkedinTest1Data);
    const doc = dom.window.document;
    const jobData = parseLinkedinJob(doc, '4348896576');

    expect(jobData?.closeOutDate).toBe(undefined);
    expect(jobData.companyLogoUrl).toBe(
      'https://media.licdn.com/dms/image/v2/C560BAQHDGjY1IZJuog/company-logo_100_100/company-logo_100_100/0/1631309406468?e=1769040000&v=beta&t=hDdKIPPgcU_oUP7zsPDj09K_ifvAx4XnYiu3Pefdg2I'
    );
    expect(jobData.companyName.includes('Varsity Tutors, a Nerdy Company'))
      .true;
    expect(jobData?.datePosted).toBe(undefined);
    expect(
      jobData.description.includes(
        'The Varsity Tutors Live Learning Platform has thousands of students looking for remote online AP Computer Science A tutors. As a tutor on the Varsity Tutors Platform, you’ll have the flexibility to set your own schedule, earn competitive rates, and make a real impact on students’ learning journeys—all from the comfort of your home.'
      )
    ).true;
    expect(jobData.employmentType).toBe('Full-Time');
    expect(jobData.intern).false;
    expect(jobData.jobIdFromSite).toBe('linkedin-4348896576');
    expect(jobData.link).toBe('https://www.linkedin.com/jobs/view/4348896576');
    expect(jobData.location.includes('Michigan, United States')).true;
    expect(jobData.payType).toBe('Hourly Wage');
    expect(jobData.payrate).toBe(2900);
    expect(jobData.remote).true;
    expect(jobData.title.includes('AP Computer Science A Tutor')).true;
  });
  test('year pay rate test', () => {
    const dom = new JSDOM(linkedinYearTestData);
    const doc = dom.window.document;
    const jobData = parseLinkedinJob(doc, '0');
    expect(jobData.payrate).toBe(150_000_00);
  });
  test('single pay rate', () => {
    const dom = new JSDOM(linkedinSinglePayData);
    const doc = dom.window.document;
    const jobData = parseLinkedinJob(doc, '0');
    expect(jobData.payrate).toBe(15_00);
  });
  test('no pay rate', () => {
    const dom = new JSDOM(linkedinNoPayRate);
    const doc = dom.window.document;
    const jobData = parseLinkedinJob(doc, '0');
    expect(jobData.payrate).toBe(null);
  });
  test('test 5', () => {
    const dom = new JSDOM(linkedinData5);
    const doc = dom.window.document;
    const jobData = parseLinkedinJob(doc, '0');
    expect(jobData.payrate).toBe(62_50);
  });
  test('payParser tests', () => {
    expect(linkedInPayParser('$18/hr - $40/hr')).toBe(29_00);
    expect(linkedInPayParser('$95.2K/yr - $130.9K/yr')).toBe(113_050_00);
    expect(linkedInPayParser('$95.2/yr - $130.9K/yr')).toBe(113_050_00);
    expect(linkedInPayParser('$130.9K/yr')).toBe(130_900_00);
    expect(linkedInPayParser('$130.9/yr')).toBe(130_90);
  });
});
