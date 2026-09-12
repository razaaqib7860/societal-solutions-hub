# Societal Solutions Hub

Build a production-quality MVP web platform for a Smart India Hackathon problem titled:

“Societal Innovation Collaboration Platform ”

The platform connects four stakeholders:

Citizens / Community Organizations

Government / Platform Administrators

Higher Education Institutions (Universities)

Industry / Startups / MSMEs / CSR Organizations

The purpose is to transform real-world societal problems into validated, prioritized, research-ready challenges and connect them with universities and industry partners until solutions are developed, piloted, deployed, and their social impact is measured.

TECH STACK — STRICT

Use:

Frontend: React.js

Styling: Tailwind CSS

Backend: Node.js + Express.js

Database: MongoDB + Mongoose

Authentication: JWT

Authorization: Role-Based Access Control (RBAC)

REST APIs

JavaScript / TypeScript where appropriate

Do NOT replace the stack with Supabase, Firebase, Django, Next.js backend, or another backend framework.

Structure the project cleanly so the frontend and Express backend are separated.

Recommended structure:

/client
/server

Backend:

/controllers
/routes
/models
/middleware
/services
/utils
/config

Frontend:

/components
/pages
/layouts
/hooks
/services
/context
/utils

Use environment variables for secrets and API URLs.

CORE PRODUCT IDEA

This is NOT a normal complaint-management website.

The platform should represent this complete ecosystem:

Citizen
→ Problem Submission
→ AI Analysis
→ Admin Validation
→ Prioritization & Deduplication
→ University Matching
→ University Team Formation
→ Solution Proposal
→ Industry Collaboration
→ Prototype
→ Testing
→ Pilot
→ Deployment
→ Impact Measurement

For the MVP, simulate AI functionality through clean service abstractions and realistic results if a real AI API is not configured.

The architecture must make it easy to connect a real AI/ML service later.

FOUR ROLE-BASED PORTALS

Create one React application with role-based dashboards rather than four separate websites.

Roles:

CITIZEN
ADMIN
UNIVERSITY
INDUSTRY

After JWT authentication, redirect users to the appropriate dashboard.

Implement protected routes and RBAC.

Example:

/citizen/*
/admin/*
/university/*
/industry/*

Users must never access another role's protected pages.

DESIGN DIRECTION

IMPORTANT:

DO NOT make this look like a generic AI SaaS website.

Avoid:

Purple/blue AI gradients

Neon colors

Excessive glassmorphism

Glowing cards

Futuristic robot graphics

Huge gradient text

Generic “AI-powered” visual clichés

Excessive rounded cards

Random decorative illustrations

The visual identity should feel like:

Government infrastructure + modern civic technology + university innovation ecosystem.

Think:

Editorial

Institutional

Trustworthy

Clean

Data-driven

Modern Indian public infrastructure

Premium but practical

Use a restrained color palette:

Primary:
Deep forest green / dark green

Secondary:
Warm off-white / ivory

Accent:
Terracotta / muted orange

Neutral:
Charcoal
Slate
Light gray

Use colors intentionally rather than everywhere.

Typography should feel professional and highly readable.

Use strong hierarchy.

Use subtle borders, shadows, dividers and whitespace.

Cards should not all have huge rounded corners.

Use a mixture of:

rectangular information panels

subtle 8–12px radius cards

tables

timeline components

map sections

status badges

editorial-style headings

The UI should look credible enough that a government officer could imagine using it.

GLOBAL NAVIGATION

Desktop:

Left sidebar navigation for dashboards.

Top navigation:

Platform logo

Search

Notifications

User profile

Role indicator

Responsive mobile navigation.

Use consistent sidebar structure across all four portals while changing navigation items according to role.

LANDING PAGE

Create a highly polished landing page.

Hero heading:

From Community Problems to Real-World Solutions.

Supporting text:

“An intelligent collaboration platform connecting citizens, universities, industry and government to solve Jharkhand’s most pressing societal challenges.”

Primary CTA:

Report a Challenge

Secondary CTA:

Explore Challenges

Hero visual should NOT be a generic AI illustration.

Instead create a sophisticated visual representation of the ecosystem:

Citizen
→ Challenge
→ University
→ Industry
→ Impact

Use a clean flow visualization with subtle motion.

Below hero:

Impact Snapshot

Show:

Challenges Reported

Challenges Validated

Universities Connected

Industry Partners

Solutions Deployed

Citizens Impacted

Use realistic demo numbers.

CITIZEN PORTAL

Citizen dashboard should be extremely simple.

Main CTA:

+ Report a Problem

Dashboard sections:

My Challenges

Recently Reported

Nearby Challenges

Challenge Status

Notifications

Citizen submission form:

Basic Information

Title

Description

Category

Subcategory

Evidence

Upload:

Photos

Video

Documents

Location

Use:

District

Block

Village/Area

Latitude/Longitude

Include a map selector.

Community Impact

Ask:

Approximate people affected

How long has the issue existed?

How frequently does it occur?

Urgency

Allow optional voice description as a future-ready UI element, but do not let it block the MVP.

After submission show:

Challenge submitted successfully.

Then display:

“AI analysis in progress…”

And show an analysis result:

Category:
Water Management

Severity:
High

Priority:
91/100

Innovation Potential:
87/100

Similar Challenges:
23

This can use mock AI output for the MVP.

CITIZEN CHALLENGE DETAIL

Create a beautiful challenge detail page.

Show:

Title

Description

Location

Submitted date

Category

Priority

Evidence gallery

Affected population

Current status

Timeline:

Submitted
↓
Under Review
↓
Validated
↓
Matched
↓
Project Created
↓
In Progress
↓
Resolved

Citizen should be able to follow the journey.

ADMIN / GOVERNMENT PORTAL

This should be the most powerful dashboard.

Header:

Jharkhand Societal Innovation Dashboard

Top metrics:

Total Challenges
Pending Validation
Validated Challenges
Active Projects
Solutions Deployed
Universities
Industry Partners

Main sections:

Challenge Intelligence

Show:

District-wise challenge map

Domain distribution

Severity distribution

Challenge trends

Duplicate clusters

Pending validations

Challenge Review

Create a professional table:

Challenge
Location
Domain
Severity
AI Priority
Reports
Status
Actions

Actions:

View
Validate
Reject
Merge
Assign

ADMIN CHALLENGE REVIEW

When admin opens a challenge, show:

Problem Summary

Title
Description
Evidence
Location
Affected Population

AI Analysis

Category
Subcategory
Severity
Priority Score
Innovation Potential

Similar Challenges

Example:

“23 similar submissions detected within 5 km.”

Show them grouped into one master challenge.

Allow:

Merge Reports

Classification

Allow admin to override AI classification.

Routing

Show recommended universities with matching scores.

Example:

IIIT Ranchi — 94%
BIT Mesra — 89%
University X — 81%

Explain the matching:

Relevant departments
Faculty expertise
Research areas
Laboratories
Previous projects

Then:

Assign Challenge

UNIVERSITY PORTAL

University dashboard:

Header:

Innovation Workspace

Metrics:

Recommended Challenges
Active Projects
Faculty Mentors
Student Teams
Completed Projects

Main section:

Recommended Challenges

Each challenge should show:

Title
Domain
Location
Priority
AI University Match

Example:

Water Quality Monitoring
Match: 94%

Reasons:

✓ IoT expertise
✓ Environmental research
✓ Relevant faculty
✓ Suitable laboratory facilities

Actions:

View Challenge
Express Interest

UNIVERSITY CHALLENGE WORKSPACE

University can:

Accept challenge

Assign faculty mentor

Create project team

Add students

Define required skills

Submit solution proposal

Team creation:

Faculty Mentor

Students:

CSE
ECE
Environmental Science
Management

Show multidisciplinary team visually.

SOLUTION PROPOSAL

Create a structured proposal form:

Problem Understanding

Proposed Solution

Technology

Innovation

Expected Impact

Implementation Plan

Estimated Budget

Timeline

Required Industry Support

Expected Community Beneficiaries

Upload supporting documents.

Button:

Submit Proposal

UNIVERSITY PROJECT WORKSPACE

Create a project management interface.

Project status:

Proposal
Approved
Prototype
Testing
Pilot
Deployment
Impact Measurement

Show a horizontal lifecycle timeline.

Milestones:

Research
Prototype
Testing
Pilot
Deployment

Each milestone contains:

Deadline
Owner
Status
Documents
Comments

INDUSTRY PORTAL

Industry dashboard:

Header:

Industry Collaboration Hub

Metrics:

Projects Seeking Support
Active Partnerships
Mentorship Requests
Funding Opportunities

Main area:

Projects Seeking Industry Support

Each project should show:

Problem
University
Domain
Required Support
Estimated Budget
Current Stage

Example:

Rural Water Quality Monitoring

University:
IIIT Ranchi

Needs:

₹2L funding
IoT hardware
Technical mentor
Pilot partner

CTA:

Express Interest

INDUSTRY PROJECT DETAIL

Industry should be able to choose contribution type:

Mentorship
Funding
Technology
Hardware
Prototyping
Testing
Deployment

Allow them to submit:

Organization
Contribution
Estimated Support
Message

Button:

Partner With Project

CROSS-PORTAL PROJECT FLOW

Create a shared project lifecycle.

Example demo:

Citizen reports:

“Drinking water contamination in village.”

↓

AI categorizes:

Water Management

↓

AI detects:

23 similar reports

↓

Admin merges them into:

MASTER CHALLENGE

↓

Admin validates challenge

↓

AI recommends:

IIIT Ranchi — 94%

↓

University accepts

↓

Faculty creates multidisciplinary team

↓

University submits solution:

IoT-based water quality monitoring

↓

Industry partner joins

↓

Funding + hardware + mentorship

↓

Prototype

↓

Testing

↓

Pilot

↓

Deployment

↓

Government records:

850 people impacted

This should be the central demo story throughout the application.

AI FEATURES

Create clean service interfaces for these features:

Problem Classification

Priority Scoring

Duplicate Detection

University Matching

Industry Matching

AI Solution Suggestions

IMPORTANT:

The UI should clearly label AI-generated insights as:

AI-assisted analysis

Do not present AI predictions as unquestionable government decisions.

Admin should always be able to review and override AI suggestions.

Create backend service abstractions such as:

aiService.classifyChallenge()
aiService.calculatePriority()
aiService.findDuplicates()
aiService.matchUniversities()
aiService.matchIndustryPartners()

For the MVP, return realistic seeded/mock responses if no AI API key is available.

DATABASE MODELS

Create MongoDB/Mongoose models for:

User

Challenge

ChallengeEvidence

ChallengeCluster

University

Faculty

Student

IndustryPartner

Project

Milestone

Proposal

CollaborationRequest

Notification

ImpactMetric

AuditLog

Important relationships should be represented properly.

Challenge:

submittedBy

title

description

category

subcategory

location

affectedPopulation

severity

priorityScore

innovationScore

status

evidence

similarChallenges

recommendedUniversities

assignedUniversity

Project:

challenge

university

facultyMentor

students

industryPartners

proposal

milestones

status

impactMetrics

AUTHENTICATION

Implement:

JWT authentication

Password hashing

Role-based authorization

Protected routes

Session persistence

Logout

User profile

Roles:

CITIZEN
ADMIN
UNIVERSITY
INDUSTRY

Create demo accounts for each role so the entire system can be demonstrated easily.

NOTIFICATIONS

Create notification center.

Examples:

Citizen:

“Your challenge has been validated.”

University:

“New challenge matched your institution.”

Industry:

“University X is seeking industry support.”

Admin:

“23 similar challenges detected.”

Use notification badges.

MAP

Use a map component for:

Challenge locations

District distribution

Nearby challenges

Project impact

Use realistic Jharkhand locations in demo data.

Do not make the map visually dominant.

ANALYTICS

Admin analytics:

Challenges by district

Challenges by domain

Severity distribution

Challenge status

University participation

Industry participation

Project pipeline

Solutions deployed

Impact metrics

Use clean charts, not overly colorful dashboards.

DEMO DATA

Seed the database with realistic examples from Jharkhand.

Examples:

Rural drinking water contamination

Crop disease identification

Rural healthcare access

School attendance / education issue

Waste management

Rural solar energy

Accessibility infrastructure

Flood/waterlogging

Public transport issue

Agricultural irrigation

Create realistic universities, faculty, student teams and industry partners as fictional/demo entities where necessary.

MVP PRIORITY

Because this is an SIH internal-round prototype, prioritize:

Authentication

Citizen challenge submission

Admin validation

AI analysis UI

Duplicate challenge visualization

University matching

University team/project creation

Industry collaboration

Project lifecycle

Government analytics

Do NOT spend excessive time building low-value features.

The complete end-to-end workflow is more important than having hundreds of screens.

UI QUALITY

The application must feel like one coherent product.

Use:

consistent spacing

strong typography

clean tables

meaningful empty states

useful hover states

polished forms

clear status badges

responsive layouts

subtle transitions

accessible contrast

realistic data

Avoid:

excessive animations

excessive rounded containers

generic dashboard templates

random gradients

fake 3D graphics

AI robot imagery

unnecessary decorative elements

Make the product look like a serious Jharkhand public innovation infrastructure platform.

FINAL DEMO REQUIREMENT

The most important demo path must work:

LOGIN AS CITIZEN
→ REPORT WATER PROBLEM
→ AI ANALYSIS
→ ADMIN LOGIN
→ VALIDATE + MERGE SIMILAR REPORTS
→ UNIVERSITY MATCH
→ UNIVERSITY LOGIN
→ ACCEPT CHALLENGE
→ CREATE TEAM
→ SUBMIT PROPOSAL
→ INDUSTRY LOGIN
→ OFFER FUNDING / MENTORSHIP
→ PROJECT CREATED
→ MILESTONES
→ ADMIN DASHBOARD
→ SHOW IMPACT

Make this flow extremely polished.

Do not optimize for the amount of code generated.

Optimize for:

clarity + working workflow + credibility + visual quality + SIH judging impact.

The final product should communicate one clear message:

“We don't just collect societal problems. We turn them into collaborative innovation projects and track them until measurable impact is created.”

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3fc5dde-14f1-415a-9b37-92541cd32c92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
