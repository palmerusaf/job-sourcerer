import { describe, expect, test } from 'vitest';
import { calculateCosineSimilarity } from './extractKeywords.ts';

const sampleJobPost = `
🚀 Hey there! We’re OrderIQ, a restaurant tech startup redefining the point-of-sale experience. Fresh off our pre-seed round, we’re building a modern, offline-first iPad POS system using React Native, and we’re looking for our next engineers to help bring it to life. If you're passionate about crafting high-performance apps for real-world use in a modern tech-stack, we’d love to talk.

 

The ideal candidate will be responsible for developing, testing, and debugging a native iPad POS application for restaurant operations. Using React Native, TypeScript, and modern architecture patterns, this candidate will build a robust tablet interface that connects to our Node.js backend APIs, handles real-time updates, and provides a reliable offline-first experience.

 

Responsibilities

Designing, developing, and testing React Native UI for iPad-based POS operations
Build reusable React Native components and libraries for API integration and local storage
Create intuitive touch interfaces optimized for fast order entry on iPad
Implement offline-first architecture with SQLite/MMKV for caching and queue management
Integrate with Node.js backend APIs for order submission, payment processing, and data sync
Develop dedicated kitchen view mode for separate iPad screen with live order updates
Implement kiosk mode functionality to lock devices to POS application only
Build background processes for queue management and data synchronization
Implement pre-configured device deployment with embedded restaurant credentials
Design local state management for cart, modifiers, and order flow
Ensure reliable offline operation with automatic sync when connection restored
Create robust error handling and user feedback for hardware/network failures

 

Qualifications

Bachelor's degree or equivalent in Computer Science
3+ years' experience in React Native development
2+ years' experience building for iOS or iPadOS tablets
Experience building offline-capable applications with SQLite or MMKV
Strong understanding of React Native architecture and state management (Redux/Zustand/Recoil)
Experience with WebSocket or real-time API clients
Familiarity using Scrum/Agile development methodologies
Understanding of iOS kiosk mode strategies, device locking, and TestFlight deployment
Experience with queue-based sync patterns and local error handling

 

Preferred Qualifications

Experience with enterprise POS systems
Experience building role-based UI (e.g. front-of-house vs. kitchen views)
Familiarity with Stripe Terminal SDK
Understanding of restaurant operations and workflows
Experience with background syncing and retry logic
Familiarity with iOS MDM, device provisioning, or single-app mode tools
Experience with WebSocket client implementation
Experience deploying production apps to iPads in field environments

 

Required Technical Skills

Languages
JavaScript / TypeScript (Expert level)
SQL (For local database queries)

Frameworks and Libraries
React Native (Core + iOS focus)
State management (Redux, Zustand, Recoil)
SQLite, MMKV, or WatermelonDB (Local caching and offline queue)
Axios or Fetch (API communication)
WebSocket libraries (socket.io-client, native WS)
Stripe Terminal SDK (optional)
iOS kiosk mode implementation techniques

Development Tools
Xcode / TestFlight / App Store Connect
Git/GitHub
iOS Debugging Tools (Console, Configurator, etc.)
CI/CD Pipelines
Charles/Proxyman (API debugging)
`;
const sampeResume = `
.
FIRST LAST
San Francisco, California 94109 | (480) 123‐5689 | sampleresume@gmail.com | linkedin.com/in/sampleresume
SUMMARY
An analytical and results‐driven software engineer with experience in application development, scripting and coding,
automation, web application design, product testing and deployment, UI testing, and requirements gathering. Proven
aptitude for implementing innovative solutions to streamline and automate processes, enhance efficiency, improve
customer satisfaction, and achieve financial savings.
EDUCATION
UNIVERSITY OF ARIZONA, Tucson, Arizona
M.S., Computer Science, 2012
B.S.B.A., Management Information Systems, 2011
TECHNICAL SKILLS
JavaScript:
Mobile:
Java:
Databases:
Build/Deploy:
ReactJS, AngularJS 1.x, ExpressJS, NodeJS, jQuery, HTML/CSS
React Native, ExponentJS
Spring, Maven
MongoDB, SQL
Docker, Tomcat, Grunt, Heroku, CircleCI
EXPERIENCE
WALMART, INC., Bentonville, Arkansas
Programmer Analyst, Call Center Engineering Team, 2011‐2016





Architected financial services hotline app for 8 countries in Central and South America.
Implemented benefits hotline app rollout every year for US and Canada serving 1.4 million employees.
Optimized manual application tuning process with Java to fetch and process data, making process 20x faster.
Connected user‐facing web applications with SQL DBs using Spring REST web services.
Integrated agent monitoring system, improving call center efficiency by 30%. [Employee of the Month ‐ Dec 2012]
SOFTWARE ENGINEERING PROJECTS
PicoShell ● Software Engineer ● Code ● App
Collaborative coding platform with a linux terminal, code editor, file browser, chat window, and video collection.
 Connected users using Socket.io to chat and see immediate changes to collaborators’ code editor and terminal.
 Used Docker to emulate a UNIX environment in browser with drag and drop file upload and file download.
 Created an API for Docker container control and NodeJS / ExpressJS server with a MySQL DB for user data.
 Incorporated YouTube API for seamless programming alongside educational videos.
 Built front‐end using ReactJS and uses states to control permissions.
TagMe ● Front‐End Engineer / DevOps ● Code ● App
Photo diary and photo organizer that uses photo‐recognition APIs to tag and caption photos.
 Expanded and refined functionality of React Native codebase.
 Implemented search, geo‐tags, and content sort using ExponentJS to improve UX.
 Configured continuous integration using CircleCI and Heroku to streamline build, test, and deployment.
 Rapidly prototyped and deployed mobile app using Exponent XDE.
Roadtrip Mood Music Generator ● Software Engineer ● Code
Spotify playlist generator based on time of day and weather forecast of any given roadtrip route.
 Integrated OAuth authentication with Spotify using PassportJS.
 Generated Spotify playlists tailored to user’s roadtrip route using Google Maps and Accuweather forecast.
`;
// from https://app.jobscan.co/
const sampleMatchRate = 47;

function expectWithinRange({
  received,
  tolerance,
}: {
  received: number;
  tolerance: number;
}) {
  expect(received).toBeGreaterThanOrEqual(sampleMatchRate - tolerance);
  expect(received).toBeLessThanOrEqual(sampleMatchRate + tolerance);
}

describe('keywordMatcher accuracy performance tests', () => {
  const score = calculateCosineSimilarity(sampleJobPost, sampeResume);
  test('score is integer', () => {
    expect(Number.isInteger(score)).toBe(true);
  });
  test('score is 0-100', () => {
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  test('score within ±20', () => {
    expectWithinRange({ received: score, tolerance: 20 });
  });

  test('score within ±10', () => {
    expectWithinRange({ received: score, tolerance: 10 });
  });
  test('score within ±5', () => {
    expectWithinRange({ received: score, tolerance: 5 });
  });
});
