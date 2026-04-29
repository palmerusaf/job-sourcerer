<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/palmerusaf/job-sourcerer">
    <img src="./public/wxt.svg" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Job Sourcerer</h3>

  <p align="center">
A centralized job application platform.
    <br />
    <a href="https://github.com/palmerusaf/job-sourcerer"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#usage">Usage</a>
    &middot;
    <a href="https://github.com/palmerusaf/job-sourcerer/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/palmerusaf/job-sourcerer/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#quick-overview">Quick Overview</a></li>
        <li><a href="#adding-comments-to-jobs">Adding Comments To Jobs</a></li>
        <li><a href="#archiving-jobs">Archiving Jobs</a></li>
        <li><a href="#deleting-jobs">Deleting Jobs</a></li>
        <li><a href="#deleting-resumes">Deleting Resumes</a></li>
        <li><a href="#linking-resumes">Linking Resumes</a></li>
        <li><a href="#sidebar">Sidebar</a></li>
        <li><a href="#job-tracker">Job Tracker</a></li>
        <li><a href="#multi-select-menu">Multi-Select Menu</a></li>
        <li><a href="#updating-job-status">Updating Job Status</a></li>
        <li><a href="#uploading-resumes">Uploading Resumes</a></li>
        <li><a href="#keyword-matching-strategy">Keyword Matching Strategy</a></li>
        <li><a href="#semantic-text-matching-sbert">Semantic Text Matching (SBERT)</a></li>
        <li><a href="#viewing-previous-applications">Viewing Previous Applications</a></li>
        <li><a href="#viewing-stats">Viewing Stats</a></li>
      </ul>
    </li>
  </ol>
</details>

<!-- USAGE EXAMPLES -->

## Usage

### Quick Overview

1. Install the extension via Chrome or Firefox.
2. Sign in to Handshake.
3. Use the extension popup to add jobs from handshake.
4. Use the extension popup to navigate to your job dashboard to track/manage your jobs/resumes.

### Adding Comments To Jobs

Comments can be added to jobs through the action drop down menu attached to each job on the job tracker page.

### Archiving Jobs

Jobs can be archived through the action menu. Additionally, multiple jobs can be archived at the same time by using the checkboxes on the left-hand side of the job. Clicking the checkboxes brings up the multi-select menu. Once archived, jobs will become read only and can only be viewed from the archive page. Jobs can be unarchived from this page.

### Deleting Jobs

Jobs can be deleted from the action menu on the job tracker page, the action menu on the archive page, or from the multi-select menu on the job tracker/archive page.

### Deleting Resumes

Resumes can be deleted on the delete resumes page. Once a resume is deleted it is also unlinked to all jobs it was linked to. Stats for this resume will also be deleted.

### Linking Resumes

Resumes can be linked to a job by clicking the link button under the resume column on the job tracker. Resume can also be updated by clicking on the resume match score.

### Sidebar

You can navigate to different pages through the sidebar on the left-hand side of the dashboard. This sidebar can also be folded. Pages are organized into different categories. These categories can be expanded to access individual pages.

### Job Tracker

The job tracker displays all non-archived jobs currently being tracked. You can filter jobs by status through the status tab at the top. Additionally, you can view a jobs details under the job's action sub-menu.

### Multi-Select Menu

While on the job tracker page you can click on a job's checkbox to activate the multi-select menu. Actions taken in this menu will affect all selected jobs.

### Updating Job Status

You can update a job's status by clicking on the status and selecting a new status from the drop-down menu. You can also update the status of multiple jobs through the multi-select menu.

### Uploading Resumes

There are two ways get a resume into the dashboard. You can create a new resume through the resume builder, or you can upload the raw resume text from an existing external resume. Once a resume is uploaded a keyword matching algorithm is used to score the resume against a job.

### Keyword Matching Strategy

The keyword matching strategy can be configured in the Matching Settings page. You can choose between:
- **IDF-TF**: Uses statistical term weighting with TF-IDF scoring
- **Hardcoded Keywords**: Uses predefined important keywords with boosted weights
- **Hybrid**: Uses a weighted combination of SBERT, TF-IDF, and keyword matching

This setting is stored in the database and applies to all resume matching calculations.

### Semantic Text Matching (SBERT)

Job Sourcerer now uses SBERT (Sentence-BERT) for semantic text similarity matching. This allows for more accurate matching of resumes to job descriptions by understanding the semantic meaning of the text rather than just keyword matching. The SBERT model is loaded from Hugging Face Hub and runs locally in your browser.

### Viewing Previous Applications

You can view previous applied jobs on the previous apps page. This will include all jobs that have the status of applied, interview scheduled, rejected, ghosted, or received offer regardless of if the job is archived. This list is grouped by company name. You can filter by company with the search bar.

### Viewing Stats

Once you have used the application you can view stats for jobs and resumes. These stats are calculated on the fly based on each job/resume. This means if a job or resume is deleted the underlying stats for that item won't be retained.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/palmerusaf/job-sourcerer.svg?style=for-the-badge
[contributors-url]: https://github.com/palmerusaf/job-sourcerer/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/palmerusaf/job-sourcerer.svg?style=for-the-badge
[forks-url]: https://github.com/palmerusaf/job-sourcerer/network/members
[stars-shield]: https://img.shields.io/github/stars/palmerusaf/job-sourcerer.svg?style=for-the-badge
[stars-url]: https://github.com/palmerusaf/job-sourcerer/stargazers
[issues-shield]: https://img.shields.io/github/issues/palmerusaf/job-sourcerer.svg?style=for-the-badge
[issues-url]: https://github.com/palmerusaf/job-sourcerer/issues
[license-shield]: https://img.shields.io/github/license/palmerusaf/job-sourcerer.svg?style=for-the-badge
[license-url]: https://github.com/palmerusaf/job-sourcerer/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: ./screen-shots/job-tracker.webp

