
import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';
import { extractCandidateName, generateComment, getRandomItems } from '@/utils/candidateUtils';

export const createCandidateFromFile = (file: File, jobId: string, index: number): Candidate => {
  // Extract and format candidate name
  const candidateName = extractCandidateName(file.name);
  
  // Generate a random domain for the email based on candidate's name
  const nameParts = candidateName.split(' ');
  const firstName = nameParts[0].toLowerCase();
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  
  // Create email with firstName.lastName@domain.com format
  const email = lastName 
    ? `${firstName}.${lastName}@${randomDomain}`
    : `${firstName}${Math.floor(Math.random() * 1000)}@${randomDomain}`;
  
  return {
    id: `candidate_${Date.now()}_${index}`,
    name: candidateName,
    email: email,
    resumeUrl: URL.createObjectURL(file),
    overallScore: 0,
    scores: [],
    strengths: [],
    weaknesses: [],
    isStarred: false,
    status: 'pending',
    jobId: jobId,
    processedAt: new Date().toISOString(),
    personalityTraits: [],
    zodiacSign: '',
    workStyle: '',
    cultureFit: 0,
    leadershipPotential: 0,
    education: '',
    yearsOfExperience: 0,
    location: '',
    skillKeywords: [],
    communicationStyle: '',
    preferredTools: []
  };
};

export const processCandidate = (
  candidate: Candidate, 
  requirements: JobRequirement[]
): Candidate => {
  // Get the candidate to process
  const processedCandidate = { ...candidate };
  
  // Generate scores for each requirement
  const scores = requirements.map(req => ({
    requirementId: req.id,
    score: Math.floor(Math.random() * 10) + 1, // Random score 1-10
    comment: generateComment(req.description),
  }));
  
  // Calculate overall score (weighted average)
  const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
  const weightedScore = requirements.reduce((sum, req, index) => {
    const score = scores[index]?.score || 0;
    return sum + (score * req.weight);
  }, 0);
  
  const overallScore = totalWeight > 0 
    ? Math.round((weightedScore / totalWeight) * 10) / 10 
    : 0;
  
  // Generate enhanced candidate data
  const workStyles = ['Remote', 'Hybrid', 'Office', 'Flexible'];
  const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const personalityTraits = ['Analytical', 'Detail-oriented', 'Team player', 'Self-motivated', 'Creative', 'Problem-solver', 'Results-oriented', 'Adaptable', 'Strategic thinker'];
  const communicationStyles = ['Direct', 'Collaborative', 'Diplomatic', 'Expressive', 'Analytical', 'Concise'];
  const toolsAndPlatforms = ['Microsoft Office', 'Google Workspace', 'Slack', 'Zoom', 'Trello', 'Asana', 'Jira', 'Salesforce', 'HubSpot', 'Adobe Creative Suite'];
  const educationLevels = ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'MBA', 'Associate Degree', 'High School Diploma', 'Professional Certification'];
  const locations = ['New York', 'San Francisco', 'Chicago', 'London', 'Toronto', 'Berlin', 'Remote - US', 'Remote - Europe'];
  
  // Generate strengths and weaknesses based on scores
  const highScoringRequirements = requirements.filter((req, index) => scores[index].score >= 8);
  const lowScoringRequirements = requirements.filter((req, index) => scores[index].score <= 4);
  
  const strengths = highScoringRequirements.length > 0 
    ? highScoringRequirements.map(req => req.description).slice(0, 3)
    : ['Communication skills', 'Problem-solving ability', 'Technical expertise'].slice(0, Math.floor(Math.random() * 3) + 1);
  
  const weaknesses = lowScoringRequirements.length > 0 
    ? lowScoringRequirements.map(req => req.description).slice(0, 3)
    : ['Limited experience', 'Needs mentoring', 'May require additional training'].slice(0, Math.floor(Math.random() * 3) + 1);
  
  // Update the candidate with enhanced data
  processedCandidate.scores = scores;
  processedCandidate.overallScore = overallScore;
  processedCandidate.strengths = strengths;
  processedCandidate.weaknesses = weaknesses;
  processedCandidate.processedAt = new Date().toISOString();
  processedCandidate.personalityTraits = getRandomItems(personalityTraits, Math.floor(Math.random() * 3) + 1);
  processedCandidate.zodiacSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
  processedCandidate.workStyle = workStyles[Math.floor(Math.random() * workStyles.length)];
  processedCandidate.cultureFit = Math.floor(Math.random() * 10) + 1;
  processedCandidate.leadershipPotential = Math.floor(Math.random() * 10) + 1;
  processedCandidate.education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
  processedCandidate.yearsOfExperience = Math.floor(Math.random() * 15) + 1;
  processedCandidate.location = locations[Math.floor(Math.random() * locations.length)];
  processedCandidate.skillKeywords = getRandomItems(['JavaScript', 'Python', 'SQL', 'Communication', 'Project Management', 'Marketing', 'Sales', 'Customer Service', 'Leadership'], Math.floor(Math.random() * 5) + 1);
  processedCandidate.availabilityDate = new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Random date in the next 30 days
  processedCandidate.communicationStyle = communicationStyles[Math.floor(Math.random() * communicationStyles.length)];
  processedCandidate.preferredTools = getRandomItems(toolsAndPlatforms, Math.floor(Math.random() * 3) + 1);
  
  return processedCandidate;
};
