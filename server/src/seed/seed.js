import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  User,
  University,
  Faculty,
  Student,
  IndustryPartner,
  Challenge,
  ChallengeCluster,
  Project,
  Milestone,
  ImpactMetric,
  Notification,
  CollaborationRequest,
} from '../models/index.js';
import { CHALLENGE_STATUS, PROJECT_STATUS } from '../utils/constants.js';

const DEMO_PASSWORD = 'Demo@123';

async function wipe() {
  await Promise.all([
    User.deleteMany({}),
    University.deleteMany({}),
    Faculty.deleteMany({}),
    Student.deleteMany({}),
    IndustryPartner.deleteMany({}),
    Challenge.deleteMany({}),
    ChallengeCluster.deleteMany({}),
    Project.deleteMany({}),
    Milestone.deleteMany({}),
    ImpactMetric.deleteMany({}),
    Notification.deleteMany({}),
    CollaborationRequest.deleteMany({}),
  ]);
  console.log('[seed] existing collections wiped');
}

async function seedUniversities() {
  const universities = await University.insertMany([
    {
      name: 'IIIT Ranchi',
      district: 'Ranchi',
      address: 'Namkum, Ranchi, Jharkhand',
      departments: ['CSE', 'ECE', 'Environmental Science', 'Management'],
      researchAreas: ['IoT', 'Water Management', 'Machine Learning', 'Renewable Energy', 'Public Health Informatics'],
      laboratories: ['IoT Lab', 'Signal Processing Lab', 'Environmental Testing Lab'],
      expertiseTags: ['Water Management', 'Energy', 'Healthcare', 'Accessibility'],
      contactEmail: 'contact@iiitranchi.ac.in',
      contactPhone: '0651-2200000',
      website: 'https://www.iiitranchi.ac.in',
    },
    {
      name: 'BIT Mesra',
      district: 'Ranchi',
      address: 'Mesra, Ranchi, Jharkhand',
      departments: ['CSE', 'Civil', 'Biotechnology', 'Management'],
      researchAreas: ['Agriculture', 'Waste Management', 'Structural Engineering'],
      laboratories: ['Biotech Lab', 'Materials Lab'],
      expertiseTags: ['Agriculture', 'Waste Management', 'Disaster Management'],
      contactEmail: 'contact@bitmesra.ac.in',
      contactPhone: '0651-2275444',
      website: 'https://www.bitmesra.ac.in',
    },
    {
      name: 'Ranchi University',
      district: 'Ranchi',
      address: 'Ranchi, Jharkhand',
      departments: ['Social Work', 'Public Health', 'Education'],
      researchAreas: ['Healthcare', 'Education', 'Rural Development'],
      laboratories: ['Community Health Lab'],
      expertiseTags: ['Healthcare', 'Education', 'Accessibility'],
      contactEmail: 'contact@ranchiuniversity.ac.in',
      contactPhone: '0651-2450820',
      website: 'https://ranchiuniversity.ac.in',
    },
    {
      name: 'NIT Jamshedpur',
      district: 'East Singhbhum',
      address: 'Adityapur, Jamshedpur, Jharkhand',
      departments: ['Civil', 'Mechanical', 'CSE', 'Electrical'],
      researchAreas: ['Transport', 'Energy', 'Irrigation', 'Waterlogging Management'],
      laboratories: ['Hydraulics Lab', 'Transportation Engineering Lab'],
      expertiseTags: ['Transport', 'Energy', 'Irrigation', 'Water Management'],
      contactEmail: 'contact@nitjsr.ac.in',
      contactPhone: '0657-2373400',
      website: 'https://www.nitjsr.ac.in',
    },
  ]);
  console.log(`[seed] seeded ${universities.length} universities`);
  return universities;
}

async function seedIndustryPartners() {
  const partners = await IndustryPartner.insertMany([
    {
      name: 'Tata Steel Foundation',
      sector: 'CSR / Manufacturing',
      capabilities: ['Funding', 'Rural Development', 'Water Management', 'Healthcare'],
      supportTypes: ['Funding', 'Mentorship', 'CSR'],
      csrBudget: 50000000,
      contactEmail: 'foundation@tatasteel.com',
      contactPhone: '0657-2431234',
      website: 'https://www.tatasteelfoundation.com',
    },
    {
      name: 'Jharkhand Water Tech Pvt Ltd',
      sector: 'Water Technology',
      capabilities: ['Water Management', 'IoT', 'Sensors', 'Irrigation'],
      supportTypes: ['Equipment', 'Mentorship', 'Pilot Deployment'],
      csrBudget: 8000000,
      contactEmail: 'info@jhwatertech.in',
      contactPhone: '0651-3344556',
      website: 'https://jhwatertech.in',
    },
    {
      name: 'AgriSense Labs',
      sector: 'AgriTech',
      capabilities: ['Agriculture', 'Machine Learning', 'Remote Sensing'],
      supportTypes: ['Equipment', 'Mentorship', 'Pilot Deployment'],
      csrBudget: 5000000,
      contactEmail: 'hello@agrisenselabs.in',
      contactPhone: '0651-9988776',
      website: 'https://agrisenselabs.in',
    },
    {
      name: 'Central Coalfields CSR Cell',
      sector: 'Mining / CSR',
      capabilities: ['Funding', 'Infrastructure', 'Waste Management', 'Energy'],
      supportTypes: ['Funding', 'Infrastructure', 'CSR'],
      csrBudget: 30000000,
      contactEmail: 'csr@centralcoalfields.in',
      contactPhone: '0651-2360266',
      website: 'https://www.centralcoalfields.in',
    },
  ]);
  console.log(`[seed] seeded ${partners.length} industry partners`);
  return partners;
}

async function seedUsers({ universities, partners }) {
  const iiitRanchi = universities.find((u) => u.name === 'IIIT Ranchi');

  const [citizen, admin, universityUser, industryUser] = await User.create([
    { name: 'Citizen Demo', email: 'citizen@demo.in', passwordHash: DEMO_PASSWORD, role: 'CITIZEN', district: 'Gumla', phone: '9800000001' },
    { name: 'Admin Demo', email: 'admin@demo.in', passwordHash: DEMO_PASSWORD, role: 'ADMIN', district: 'Ranchi', phone: '9800000002' },
    {
      name: 'University Demo',
      email: 'university@demo.in',
      passwordHash: DEMO_PASSWORD,
      role: 'UNIVERSITY',
      district: 'Ranchi',
      phone: '9800000003',
      organization: { kind: 'University', item: iiitRanchi._id },
    },
    {
      name: 'Industry Demo',
      email: 'industry@demo.in',
      passwordHash: DEMO_PASSWORD,
      role: 'INDUSTRY',
      district: 'East Singhbhum',
      phone: '9800000004',
      organization: { kind: 'IndustryPartner', item: partners[1]._id },
    },
  ]);

  // Faculty + students at IIIT Ranchi across departments
  const facultyDefs = [
    { name: 'Dr. Anjali Sinha', department: 'CSE', designation: 'Associate Professor', expertise: ['IoT', 'Machine Learning'] },
    { name: 'Dr. Rakesh Kumar', department: 'ECE', designation: 'Assistant Professor', expertise: ['Signal Processing', 'Embedded Systems'] },
    { name: 'Dr. Sunita Oraon', department: 'Environmental Science', designation: 'Professor', expertise: ['Water Quality', 'Environmental Monitoring'] },
    { name: 'Dr. Vivek Mahato', department: 'Management', designation: 'Assistant Professor', expertise: ['Rural Development', 'Project Management'] },
  ];

  const facultyUsers = await User.create(
    facultyDefs.map((f, i) => ({
      name: f.name,
      email: `faculty${i + 1}@iiitranchi.ac.in`,
      passwordHash: DEMO_PASSWORD,
      role: 'UNIVERSITY',
      district: 'Ranchi',
      organization: { kind: 'University', item: iiitRanchi._id },
    }))
  );

  const facultyDocs = await Faculty.insertMany(
    facultyDefs.map((f, i) => ({
      user: facultyUsers[i]._id,
      university: iiitRanchi._id,
      department: f.department,
      designation: f.designation,
      expertise: f.expertise,
    }))
  );

  const studentDefs = [
    { name: 'Ravi Mahto', department: 'CSE', year: 3, skills: ['React', 'Node.js', 'IoT'] },
    { name: 'Priya Kumari', department: 'CSE', year: 4, skills: ['Machine Learning', 'Python'] },
    { name: 'Amit Toppo', department: 'ECE', year: 3, skills: ['Embedded Systems', 'Sensors'] },
    { name: 'Sneha Kachhap', department: 'Environmental Science', year: 2, skills: ['Water Testing', 'GIS'] },
    { name: 'Manoj Soren', department: 'Management', year: 4, skills: ['Project Management', 'Community Outreach'] },
    { name: 'Neha Devi', department: 'ECE', year: 2, skills: ['PCB Design', 'IoT'] },
  ];

  const studentUsers = await User.create(
    studentDefs.map((s, i) => ({
      name: s.name,
      email: `student${i + 1}@iiitranchi.ac.in`,
      passwordHash: DEMO_PASSWORD,
      role: 'UNIVERSITY',
      district: 'Ranchi',
      organization: { kind: 'University', item: iiitRanchi._id },
    }))
  );

  const studentDocs = await Student.insertMany(
    studentDefs.map((s, i) => ({
      user: studentUsers[i]._id,
      university: iiitRanchi._id,
      department: s.department,
      year: s.year,
      skills: s.skills,
    }))
  );

  console.log('[seed] seeded 4 demo accounts, faculty and students at IIIT Ranchi');
  return { citizen, admin, universityUser, industryUser, facultyDocs, studentDocs };
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function seedChallenges({ citizen, admin }) {
  const baseChallenges = [
    {
      title: 'Rural drinking water contamination in Gumla',
      description:
        'Multiple villages around Raidih block in Gumla district report discoloured, foul-smelling drinking water from hand pumps and open wells, suspected iron and biological contamination causing waterborne illnesses.',
      category: 'Water Management',
      subcategory: 'Water Management - Contamination',
      location: { district: 'Gumla', block: 'Raidih', village: 'Raidih Village', lat: 23.0469, lng: 84.5432 },
      affectedPopulation: 4200,
      issueDuration: '8 months',
      frequency: 'Continuous',
      urgency: 'Critical',
      severity: 'Critical',
    },
    {
      title: 'Crop disease outbreak affecting paddy farmers in Hazaribagh',
      description: 'A fungal blight is spreading rapidly across paddy fields in Hazaribagh, threatening yield for the season and livelihoods of smallholder farmers.',
      category: 'Agriculture',
      subcategory: 'Agriculture - Crop Disease',
      location: { district: 'Hazaribagh', block: 'Barhi', village: 'Barhi', lat: 24.1878, lng: 85.3998 },
      affectedPopulation: 1500,
      issueDuration: '2 months',
      frequency: 'Recurring',
      urgency: 'High',
      severity: 'High',
    },
    {
      title: 'Limited healthcare access in remote Palamu villages',
      description: 'Villages in interior Palamu lack access to primary healthcare centres; nearest facility is over 20km away, causing delays in maternal and emergency care.',
      category: 'Healthcare',
      subcategory: 'Healthcare - Access',
      location: { district: 'Palamu', block: 'Chainpur', village: 'Chainpur', lat: 24.1167, lng: 83.9333 },
      affectedPopulation: 8000,
      issueDuration: '3 years',
      frequency: 'Continuous',
      urgency: 'High',
      severity: 'High',
    },
    {
      title: 'Declining school attendance in Dumka tribal blocks',
      description: 'Attendance in government schools across Dumka tribal blocks has dropped sharply due to seasonal migration of families and lack of engagement tools.',
      category: 'Education',
      subcategory: 'Education - Attendance',
      location: { district: 'Dumka', block: 'Jarmundi', village: 'Jarmundi', lat: 24.2333, lng: 87.1167 },
      affectedPopulation: 3000,
      issueDuration: '1 year',
      frequency: 'Recurring',
      urgency: 'Medium',
      severity: 'Medium',
    },
    {
      title: 'Unmanaged solid waste accumulation in Dhanbad residential areas',
      description: 'Irregular garbage collection has led to overflowing waste piles in several Dhanbad neighbourhoods, posing health and environmental hazards.',
      category: 'Waste Management',
      subcategory: 'Waste Management - Municipal',
      location: { district: 'Dhanbad', block: 'Dhanbad Sadar', village: 'Bank More', lat: 23.7957, lng: 86.4304 },
      affectedPopulation: 12000,
      issueDuration: '6 months',
      frequency: 'Continuous',
      urgency: 'Medium',
      severity: 'Medium',
    },
    {
      title: 'Lack of reliable solar energy access in Simdega hamlets',
      description: 'Remote hamlets in Simdega remain off the electricity grid; existing solar installations are poorly maintained and frequently non-functional.',
      category: 'Energy',
      subcategory: 'Energy - Solar',
      location: { district: 'Simdega', block: 'Kolebira', village: 'Kolebira', lat: 22.5167, lng: 84.5167 },
      affectedPopulation: 2200,
      issueDuration: '2 years',
      frequency: 'Continuous',
      urgency: 'Medium',
      severity: 'Medium',
    },
    {
      title: 'Poor accessibility infrastructure for persons with disabilities in Ranchi',
      description: 'Public buildings and transport hubs in Ranchi city lack ramps, tactile paths, and accessible signage, restricting mobility for persons with disabilities.',
      category: 'Accessibility',
      subcategory: 'Accessibility - Urban Infrastructure',
      location: { district: 'Ranchi', block: 'Ranchi Sadar', village: 'Main Road', lat: 23.3441, lng: 85.3096 },
      affectedPopulation: 5000,
      issueDuration: '5 years',
      frequency: 'Continuous',
      urgency: 'Medium',
      severity: 'Low',
    },
    {
      title: 'Severe waterlogging during monsoon in East Singhbhum',
      description: 'Low-lying residential areas in Jamshedpur and surrounding East Singhbhum face repeated waterlogging every monsoon due to blocked drainage.',
      category: 'Water Management',
      subcategory: 'Water Management - Drainage',
      location: { district: 'East Singhbhum', block: 'Jamshedpur', village: 'Sonari', lat: 22.7925, lng: 86.1842 },
      affectedPopulation: 9000,
      issueDuration: '4 years',
      frequency: 'Recurring',
      urgency: 'High',
      severity: 'High',
    },
    {
      title: 'Inadequate public transport connectivity in Bokaro rural pockets',
      description: 'Villages on the outskirts of Bokaro lack reliable bus connectivity, forcing residents including students to walk long distances or pay high private fares.',
      category: 'Transport',
      subcategory: 'Transport - Rural Connectivity',
      location: { district: 'Bokaro', block: 'Chandankiyari', village: 'Chandankiyari', lat: 23.7833, lng: 86.2833 },
      affectedPopulation: 3500,
      issueDuration: '3 years',
      frequency: 'Continuous',
      urgency: 'Medium',
      severity: 'Medium',
    },
    {
      title: 'Insufficient irrigation infrastructure in Giridih farmlands',
      description: 'Farmers in Giridih rely almost entirely on erratic rainfall due to absence of canal or drip irrigation systems, limiting cropping cycles.',
      category: 'Irrigation',
      subcategory: 'Irrigation - Infrastructure',
      location: { district: 'Giridih', block: 'Giridih Sadar', village: 'Giridih Sadar', lat: 24.1913, lng: 86.3000 },
      affectedPopulation: 6000,
      issueDuration: '10 years',
      frequency: 'Continuous',
      urgency: 'High',
      severity: 'High',
    },
  ];

  const created = [];
  for (const [idx, c] of baseChallenges.entries()) {
    const challenge = new Challenge({
      ...c,
      submittedBy: citizen._id,
      status: idx === 0 ? CHALLENGE_STATUS.VALIDATED : CHALLENGE_STATUS.UNDER_REVIEW,
      priorityScore: Math.round(50 + Math.random() * 45),
      innovationScore: Math.round(40 + Math.random() * 50),
      aiAnalysis: {
        category: c.category,
        subcategory: c.subcategory,
        severity: c.severity,
        priorityScore: Math.round(50 + Math.random() * 45),
        innovationScore: Math.round(40 + Math.random() * 50),
        confidence: 0.8,
        generatedAt: new Date(),
        aiAssisted: true,
      },
      createdAt: daysAgo(90 - idx * 5),
    });
    challenge.timeline.push({ status: CHALLENGE_STATUS.SUBMITTED, at: daysAgo(90 - idx * 5), by: citizen._id, note: 'Challenge submitted' });
    if (challenge.status === CHALLENGE_STATUS.VALIDATED) {
      challenge.timeline.push({ status: CHALLENGE_STATUS.VALIDATED, at: daysAgo(80), by: admin._id, note: 'Validated by admin' });
    }
    await challenge.save();
    created.push(challenge);
  }

  // Create 22 additional duplicate reports for the Gumla water contamination challenge -> cluster of 23
  const primary = created[0];
  const duplicateDocs = [];
  for (let i = 0; i < 22; i++) {
    const dup = new Challenge({
      title: `Contaminated drinking water reported near Raidih (report ${i + 2})`,
      description: 'Another resident of Raidih block reports similar discoloured and foul-smelling water from local hand pumps, matching the ongoing contamination cluster.',
      category: 'Water Management',
      subcategory: 'Water Management - Contamination',
      location: {
        district: 'Gumla',
        block: 'Raidih',
        village: `Raidih Hamlet ${i + 1}`,
        lat: 23.0469 + (Math.random() - 0.5) * 0.05,
        lng: 84.5432 + (Math.random() - 0.5) * 0.05,
      },
      affectedPopulation: 150 + Math.round(Math.random() * 300),
      issueDuration: '2-8 months',
      frequency: 'Continuous',
      urgency: 'High',
      severity: 'High',
      submittedBy: citizen._id,
      status: CHALLENGE_STATUS.SUBMITTED,
      createdAt: daysAgo(85 - i),
    });
    dup.timeline.push({ status: CHALLENGE_STATUS.SUBMITTED, at: daysAgo(85 - i), by: citizen._id, note: 'Duplicate report submitted' });
    await dup.save();
    duplicateDocs.push(dup);
  }

  const cluster = await ChallengeCluster.create({
    title: primary.title,
    category: primary.category,
    representativeChallenge: primary._id,
    members: [primary._id, ...duplicateDocs.map((d) => d._id)],
    districtSpread: ['Gumla'],
    reportCount: 23,
    aiSummary: 'AI detected 23 highly similar reports of drinking water contamination clustered around Raidih block, Gumla district.',
  });

  primary.cluster = cluster._id;
  primary.reportCount = 23;
  await primary.save();

  for (const dup of duplicateDocs) {
    dup.status = CHALLENGE_STATUS.MERGED;
    dup.cluster = cluster._id;
    dup.timeline.push({ status: CHALLENGE_STATUS.MERGED, at: daysAgo(1), note: `Merged into ${primary._id}` });
    await dup.save();
  }

  console.log(`[seed] seeded ${created.length} challenges + 22 merged duplicates forming a cluster of 23`);
  return { challenges: created, cluster };
}

async function seedProjects({ challenges, universities, partners, facultyDocs, studentDocs, admin }) {
  const iiitRanchi = universities.find((u) => u.name === 'IIIT Ranchi');
  const waterChallenge = challenges[0];
  const healthcareChallenge = challenges[2];
  const waterTechPartner = partners.find((p) => p.name === 'Jharkhand Water Tech Pvt Ltd');

  // Active project: IoT-based Rural Water Quality Monitoring
  waterChallenge.status = CHALLENGE_STATUS.IN_PROGRESS;
  waterChallenge.assignedUniversity = iiitRanchi._id;
  waterChallenge.timeline.push({ status: CHALLENGE_STATUS.MATCHED, at: daysAgo(60), by: admin._id, note: 'Assigned to IIIT Ranchi' });
  waterChallenge.timeline.push({ status: CHALLENGE_STATUS.PROJECT_CREATED, at: daysAgo(55), note: 'Project created' });
  waterChallenge.timeline.push({ status: CHALLENGE_STATUS.IN_PROGRESS, at: daysAgo(40), note: 'Project underway' });
  await waterChallenge.save();

  const activeProject = await Project.create({
    challenge: waterChallenge._id,
    university: iiitRanchi._id,
    facultyMentor: facultyDocs[0]._id,
    students: studentDocs.slice(0, 3).map((s) => s._id),
    industryPartners: [waterTechPartner._id],
    status: PROJECT_STATUS.PROTOTYPE,
    requiredSupport: ['Funding', 'Equipment', 'Field Access'],
    estimatedBudget: 1200000,
    title: 'IoT-based Rural Water Quality Monitoring',
    summary: 'A network of low-cost IoT water quality sensors deployed at hand pumps and wells around Raidih block, Gumla, streaming real-time contamination alerts to a dashboard used by district health officials.',
  });

  const milestoneNames = ['Research', 'Prototype', 'Testing', 'Pilot', 'Deployment'];
  const milestoneStatuses = ['Completed', 'Completed', 'In Progress', 'Pending', 'Pending'];
  const milestones = await Milestone.insertMany(
    milestoneNames.map((name, i) => ({
      project: activeProject._id,
      name,
      description: `${name} phase for IoT-based Rural Water Quality Monitoring`,
      deadline: daysAgo(-30 * (i + 1)),
      owner: facultyDocs[0].user,
      status: milestoneStatuses[i],
      completedAt: milestoneStatuses[i] === 'Completed' ? daysAgo(50 - i * 10) : undefined,
    }))
  );
  activeProject.milestones = milestones.map((m) => m._id);
  await activeProject.save();

  await CollaborationRequest.create({
    project: activeProject._id,
    challenge: waterChallenge._id,
    initiator: facultyDocs[0].user,
    initiatorRole: 'UNIVERSITY',
    industryPartner: waterTechPartner._id,
    university: iiitRanchi._id,
    supportOffered: ['Equipment', 'Mentorship', 'Pilot Deployment'],
    message: 'Requesting IoT sensor hardware and field deployment support for the rural water quality monitoring pilot.',
    status: 'ACCEPTED',
    respondedAt: daysAgo(45),
  });

  // Completed project with impact metric of 850 people impacted
  healthcareChallenge.status = CHALLENGE_STATUS.RESOLVED;
  healthcareChallenge.assignedUniversity = universities.find((u) => u.name === 'Ranchi University')._id;
  healthcareChallenge.timeline.push({ status: CHALLENGE_STATUS.RESOLVED, at: daysAgo(10), note: 'Solution deployed and impact verified' });
  await healthcareChallenge.save();

  const completedProject = await Project.create({
    challenge: healthcareChallenge._id,
    university: universities.find((u) => u.name === 'Ranchi University')._id,
    status: PROJECT_STATUS.COMPLETED,
    requiredSupport: ['Funding', 'Mentorship'],
    estimatedBudget: 600000,
    title: 'Mobile Telemedicine Units for Remote Palamu Villages',
    summary: 'Deployed mobile telemedicine kiosks staffed by trained health workers, connecting remote Palamu villages to doctors via video consultation.',
  });

  const impact = await ImpactMetric.create({
    project: completedProject._id,
    challenge: healthcareChallenge._id,
    metricName: 'Citizens with improved healthcare access',
    value: 850,
    unit: 'people',
    beneficiaries: 850,
    district: 'Palamu',
    recordedBy: admin._id,
    notes: 'Verified through field surveys across 6 villages after 3 months of telemedicine kiosk operation.',
  });

  completedProject.impactMetrics = [impact._id];
  await completedProject.save();

  console.log('[seed] seeded active project (5 milestones + industry collaboration) and completed project with impact metric');
  return { activeProject, completedProject };
}

async function seedNotifications({ citizen, admin, universityUser, industryUser }) {
  await Notification.insertMany([
    {
      recipient: citizen._id,
      title: 'Challenge validated',
      message: 'Your reported challenge "Rural drinking water contamination in Gumla" has been validated and assigned to IIIT Ranchi.',
      type: 'CHALLENGE',
    },
    {
      recipient: admin._id,
      title: 'New challenge submitted',
      message: '10 new challenges are pending review across Jharkhand districts.',
      type: 'SYSTEM',
    },
    {
      recipient: universityUser._id,
      title: 'New challenge assigned',
      message: 'A new challenge has been assigned to IIIT Ranchi for solutioning.',
      type: 'CHALLENGE',
    },
    {
      recipient: industryUser._id,
      title: 'Collaboration request accepted',
      message: 'Your collaboration offer for the IoT-based Rural Water Quality Monitoring project was accepted.',
      type: 'COLLABORATION',
    },
  ]);
  console.log('[seed] seeded notifications for each role');
}

async function seed() {
  await connectDB();
  await wipe();

  const universities = await seedUniversities();
  const partners = await seedIndustryPartners();
  const { citizen, admin, universityUser, industryUser, facultyDocs, studentDocs } = await seedUsers({ universities, partners });
  const { challenges } = await seedChallenges({ citizen, admin });
  await seedProjects({ challenges, universities, partners, facultyDocs, studentDocs, admin });
  await seedNotifications({ citizen, admin, universityUser, industryUser });

  console.log('\n[seed] Demo accounts (password: Demo@123):');
  console.log('  citizen@demo.in    (CITIZEN)');
  console.log('  admin@demo.in      (ADMIN)');
  console.log('  university@demo.in (UNIVERSITY - IIIT Ranchi)');
  console.log('  industry@demo.in   (INDUSTRY - Jharkhand Water Tech Pvt Ltd)');

  await mongoose.connection.close();
  console.log('\n[seed] Done. Connection closed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
