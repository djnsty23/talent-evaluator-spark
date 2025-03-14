
import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';
import { extractCandidateName, generateComment, getRandomItems, generateRealisticName } from '@/utils/candidateUtils';

export const createCandidateFromFile = (file: File, jobId: string, index: number): Candidate => {
  // Use the more realistic name generator instead of extracting from filename
  const candidateName = generateRealisticName();
  
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

export const processCandidate = (candidate: Candidate, requirements: JobRequirement[]): Candidate => {
  // Get the candidate to process
  const processedCandidate = { ...candidate };
  
  // Generate scores for each requirement
  const scores = requirements.map(req => {
    // More realistic scoring based on requirement category
    let baseScore = Math.floor(Math.random() * 6) + 3; // Base score between 3-8
    
    // Modify score for key skills that might be in the requirements
    if (req.description.toLowerCase().includes("customer success") || 
        req.description.toLowerCase().includes("saas") || 
        req.description.toLowerCase().includes("communication") ||
        req.description.toLowerCase().includes("problem-solving") ||
        req.description.toLowerCase().includes("english")) {
      // Increase chance of higher scores for these important skills
      baseScore = Math.min(baseScore + Math.floor(Math.random() * 3), 10);
    }
    
    return {
      requirementId: req.id,
      score: baseScore,
      comment: generateComment(req.description),
    };
  });
  
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
  processedCandidate.skillKeywords = getRandomItems(['Customer Success', 'SaaS', 'A/B Testing', 'Problem-Solving', 'Analytics', 'CRM', 'HubSpot', 'Communication', 'Project Management', 'Marketing', 'Sales'], Math.floor(Math.random() * 5) + 1);
  processedCandidate.availabilityDate = new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Random date in the next 30 days
  processedCandidate.communicationStyle = communicationStyles[Math.floor(Math.random() * communicationStyles.length)];
  processedCandidate.preferredTools = getRandomItems(toolsAndPlatforms, Math.floor(Math.random() * 3) + 1);
  
  return processedCandidate;
};

// Default requirements focused on Customer Success
export const getDefaultCustomerSuccessRequirements = (): Partial<JobRequirement>[] => {
  return [
    {
      id: uuidv4(),
      description: "Direct experience in customer success or a related role",
      weight: 5,
      category: "Experience",
      isRequired: true
    },
    {
      id: uuidv4(),
      description: "Experience working in SaaS and/or familiarity with A/B testing, experimentation, or CRO",
      weight: 4,
      category: "Technical", 
      isRequired: true
    },
    {
      id: uuidv4(),
      description: "Ability to analyze customer pain points, interpret data, and provide solutions",
      weight: 5,
      category: "Skills",
      isRequired: true
    },
    {
      id: uuidv4(),
      description: "Strong written/verbal communication and ability to build relationships",
      weight: 5,
      category: "Skills",
      isRequired: true
    },
    {
      id: uuidv4(),
      description: "Demonstrated taking initiative, driving product adoption, or improving processes",
      weight: 4,
      category: "Attitude",
      isRequired: false
    },
    {
      id: uuidv4(),
      description: "Comfort with tools like analytics platforms, CRMs, Hubspot, Google Analytics",
      weight: 3,
      category: "Technical",
      isRequired: false
    },
    {
      id: uuidv4(),
      description: "Professional level English communication skills",
      weight: 5,
      category: "Language",
      isRequired: true
    }
  ];
};
