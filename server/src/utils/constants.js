export const ROLES = Object.freeze({
  CITIZEN: 'CITIZEN',
  ADMIN: 'ADMIN',
  UNIVERSITY: 'UNIVERSITY',
  INDUSTRY: 'INDUSTRY',
});

export const CHALLENGE_STATUS = Object.freeze({
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VALIDATED: 'VALIDATED',
  MATCHED: 'MATCHED',
  PROJECT_CREATED: 'PROJECT_CREATED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  MERGED: 'MERGED',
});

export const SEVERITY = Object.freeze(['Low', 'Medium', 'High', 'Critical']);

export const PROJECT_STATUS = Object.freeze({
  PROPOSAL: 'PROPOSAL',
  APPROVED: 'APPROVED',
  PROTOTYPE: 'PROTOTYPE',
  TESTING: 'TESTING',
  PILOT: 'PILOT',
  DEPLOYMENT: 'DEPLOYMENT',
  IMPACT_MEASUREMENT: 'IMPACT_MEASUREMENT',
  COMPLETED: 'COMPLETED',
});

export const MILESTONE_NAME = Object.freeze(['Research', 'Prototype', 'Testing', 'Pilot', 'Deployment']);
export const MILESTONE_STATUS = Object.freeze(['Pending', 'In Progress', 'Completed', 'Delayed']);

export const DOMAINS = Object.freeze([
  'Water Management',
  'Agriculture',
  'Healthcare',
  'Education',
  'Waste Management',
  'Energy',
  'Accessibility',
  'Disaster Management',
  'Transport',
  'Irrigation',
]);

export const JHARKHAND_DISTRICTS = Object.freeze([
  'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa',
  'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
  'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj',
  'Seraikela Kharsawan', 'Simdega', 'West Singhbhum',
]);
