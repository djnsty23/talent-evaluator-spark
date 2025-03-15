
import { Candidate, JobRequirement, RequirementScore } from '@/types/job.types';

/**
 * Generate mock analysis data for a candidate
 */
export const generateMockAnalysis = (candidate: Candidate, requirements: JobRequirement[]): Candidate => {
  // Generate mock scores for each requirement
  const scores = requirements.map(req => {
    return {
      requirementId: req.id, // Ensure this is a proper UUID
      score: Math.floor(Math.random() * 5) + 3, // Random score 3-7 for demo
      comment: `Mock analysis for ${req.description}`,
    };
  });
  
  // Calculate overall score based on weighted requirements
  const overallScore = calculateOverallScore(scores, requirements);
  
  // Generate mock strengths and weaknesses
  const mockStrengths = [
    'Communication',
    'Problem Solving',
    'Technical Knowledge',
    'Teamwork',
    'Adaptability',
    'Time Management',
    'Leadership',
    'Attention to Detail'
  ];
  
  const mockWeaknesses = [
    'Public Speaking',
    'Task Delegation',
    'Working Under Pressure',
    'Handling Criticism',
    'Perfectionism',
    'Work-Life Balance',
    'Technical Documentation'
  ];
  
  // Randomly select 2-4 strengths and 1-3 weaknesses
  const strengths = shuffleArray(mockStrengths).slice(0, Math.floor(Math.random() * 3) + 2);
  const weaknesses = shuffleArray(mockWeaknesses).slice(0, Math.floor(Math.random() * 3) + 1);
  
  // Generate mock personality traits
  const mockPersonalityTraits = [
    'Analytical',
    'Creative',
    'Detail-oriented', 
    'Pragmatic',
    'Collaborative',
    'Independent',
    'Goal-oriented',
    'Innovative'
  ];
  
  const personalityTraits = shuffleArray(mockPersonalityTraits).slice(0, Math.floor(Math.random() * 3) + 2);
  
  // Generate mock education and experience
  const mockEducation = [
    'Bachelor of Science in Computer Science',
    'Master of Business Administration',
    'Bachelor of Arts in Communication',
    'Master of Science in Data Analytics',
    'Bachelor of Engineering'
  ];
  
  const education = mockEducation[Math.floor(Math.random() * mockEducation.length)];
  
  // Random years of experience (1-10)
  const yearsOfExperience = Math.floor(Math.random() * 10) + 1;
  
  // Mock locations
  const mockLocations = [
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Seattle, WA',
    'Boston, MA',
    'Remote'
  ];
  
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  // Mock skill keywords
  const mockSkillKeywords = [
    'JavaScript',
    'Python',
    'React',
    'SQL',
    'Data Analysis',
    'Machine Learning',
    'Project Management',
    'Agile',
    'UX Design',
    'Customer Success'
  ];
  
  const skillKeywords = shuffleArray(mockSkillKeywords).slice(0, Math.floor(Math.random() * 5) + 3);
  
  // Mock communication styles
  const mockCommunicationStyles = [
    'Direct and concise',
    'Detailed and thorough',
    'Collaborative and open',
    'Formal and structured',
    'Visual communicator'
  ];
  
  const communicationStyle = mockCommunicationStyles[Math.floor(Math.random() * mockCommunicationStyles.length)];
  
  // Mock preferred tools
  const mockPreferredTools = [
    'JIRA',
    'Slack',
    'GSuite',
    'Microsoft Office',
    'Figma',
    'Notion',
    'GitHub',
    'VS Code',
    'Trello'
  ];
  
  const preferredTools = shuffleArray(mockPreferredTools).slice(0, Math.floor(Math.random() * 4) + 2);
  
  // Random culture fit and leadership potential (3-10)
  const cultureFit = Math.floor(Math.random() * 7) + 3;
  const leadershipPotential = Math.floor(Math.random() * 7) + 3;
  
  return {
    ...candidate,
    scores,
    overallScore,
    strengths,
    weaknesses,
    personalityTraits,
    cultureFit,
    leadershipPotential,
    education,
    yearsOfExperience,
    location,
    skillKeywords,
    communicationStyle,
    preferredTools,
    status: 'processed',
    processedAt: new Date().toISOString()
  };
};

/**
 * Helper function to calculate overall score based on weighted requirements
 */
export const calculateOverallScore = (
  scores: RequirementScore[], 
  requirements: JobRequirement[]
): number => {
  if (scores.length === 0) return 0;
  
  const totalWeightedScore = scores.reduce((total, score) => {
    const req = requirements.find(r => r.id === score.requirementId);
    const weight = req ? req.weight : 1;
    return total + (score.score * weight);
  }, 0);
  
  const totalWeight = requirements.reduce((total, req) => total + req.weight, 0);
  
  return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
};

/**
 * Helper function to shuffle an array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
