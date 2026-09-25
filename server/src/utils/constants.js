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
  'Healthcare',
  'Roads & Infrastructure',
  'Water & Sanitation',
  'Electricity',
  'Education',
  'Agriculture',
  'Transport',
  'Environment',
  'Public Safety',
  'Employment',
  'Government Services',
  'Other',
]);

export const COMPLAINT_CATEGORIES = DOMAINS;
export const COMPLAINT_PRIORITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const SUBCATEGORIES = Object.freeze({
  Healthcare: ['Hospital', 'Medicine Availability', 'Ambulance', 'Medical Staff', 'Healthcare Facility', 'Maternal Health', 'Other'],
  'Roads & Infrastructure': ['Pothole', 'Damaged Road', 'Street Light', 'Drainage', 'Public Building', 'Footpath', 'Bridge', 'Other'],
  'Water & Sanitation': ['Water Supply', 'Water Leakage', 'Drainage', 'Garbage', 'Sewage', 'Drinking Water', 'Other'],
  Electricity: ['Power Outage', 'Voltage Fluctuation', 'Transformer', 'Street Electricity', 'Grid Connection', 'Renewable Energy', 'Other'],
  Education: ['School Attendance', 'Teacher Shortage', 'Infrastructure', 'Digital Access', 'Learning Outcomes', 'Scholarship', 'Other'],
  Agriculture: ['Crop Disease', 'Irrigation', 'Soil Health', 'Market Access', 'Post-harvest Loss', 'Seeds & Inputs', 'Other'],
  Transport: ['Public Bus Service', 'Rural Connectivity', 'Road Safety', 'Last-mile Mobility', 'Traffic Management', 'Other'],
  Environment: ['Air Pollution', 'Water Pollution', 'Solid Waste', 'Deforestation', 'Flooding & Waterlogging', 'Climate Risk', 'Other'],
  'Public Safety': ['Fire Hazard', 'Unsafe Infrastructure', 'Crime Risk', 'Disaster Warning', "Women's Safety", 'Other'],
  Employment: ['Job Access', 'Skills Training', 'Worker Safety', 'Migration', 'Livelihood Support', 'Other'],
  'Government Services': ['Documents & Certificates', 'Benefits & Pensions', 'Office Access', 'Digital Services', 'Service Delay', 'Other'],
  Other: ['Other'],
});

export const JHARKHAND_DISTRICTS = Object.freeze([
  'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Garhwa',
  'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti', 'Koderma',
  'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj',
  'Seraikela Kharsawan', 'Simdega', 'West Singhbhum',
]);
