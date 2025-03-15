
import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';

/**
 * Generate mock data for candidate analysis
 */
export const generateMockAnalysis = (
  candidate: Candidate,
  requirements: JobRequirement[]
): Candidate => {
  console.log(`Generating mock analysis for ${candidate.name}`);

  // Mock strengths based on the candidate's name
  const mockStrengths = [
    'Excellent communication skills',
    'Strong problem-solving abilities',
    'Customer-focused mindset',
    'Experience with SaaS products',
    'Good team collaboration'
  ];

  // Mock weaknesses based on the candidate's name
  const mockWeaknesses = [
    'Limited experience with advanced analytics',
    'Could improve technical knowledge',
    'May need additional training in specific tools',
    'Relatively new to the industry'
  ];

  // Generate random scores for each requirement (1-10)
  const scores = requirements.map(req => ({
    requirementId: req.id, // Use the existing requirement ID
    score: Math.floor(Math.random() * 5) + 3, // Random score between 3-7
    comment: `Mock evaluation for "${req.description}"`
  }));

  // Calculate overall score as average of individual scores
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const overallScore = Math.round(totalScore / (scores.length || 1));

  // Select random strengths and weaknesses
  const selectedStrengths = [];
  const selectedWeaknesses = [];

  // Add 2-3 random strengths
  for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
    const randomStrength = mockStrengths[Math.floor(Math.random() * mockStrengths.length)];
    if (!selectedStrengths.includes(randomStrength)) {
      selectedStrengths.push(randomStrength);
    }
  }

  // Add 1-2 random weaknesses
  for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
    const randomWeakness = mockWeaknesses[Math.floor(Math.random() * mockWeaknesses.length)];
    if (!selectedWeaknesses.includes(randomWeakness)) {
      selectedWeaknesses.push(randomWeakness);
    }
  }

  // Generate random personality traits
  const personalities = [
    'Analytical', 'Collaborative', 'Detail-oriented', 'Proactive',
    'Results-driven', 'Creative', 'Team player', 'Customer-focused'
  ];
  
  const selectedTraits = [];
  for (let i = 0; i < 3; i++) {
    const trait = personalities[Math.floor(Math.random() * personalities.length)];
    if (!selectedTraits.includes(trait)) {
      selectedTraits.push(trait);
    }
  }

  // Random preferred tools
  const tools = [
    'Hubspot', 'Google Analytics', 'Salesforce', 'Jira',
    'Zendesk', 'Intercom', 'Looker', 'Microsoft Office'
  ];
  
  const selectedTools = [];
  for (let i = 0; i < 3; i++) {
    const tool = tools[Math.floor(Math.random() * tools.length)];
    if (!selectedTools.includes(tool)) {
      selectedTools.push(tool);
    }
  }

  // Random skill keywords
  const skills = [
    'Customer success', 'Account management', 'Technical support',
    'Data analysis', 'Client relations', 'Project management',
    'SaaS', 'Communication', 'Problem-solving'
  ];
  
  const selectedSkills = [];
  for (let i = 0; i < 4; i++) {
    const skill = skills[Math.floor(Math.random() * skills.length)];
    if (!selectedSkills.includes(skill)) {
      selectedSkills.push(skill);
    }
  }

  // Communication styles
  const commStyles = [
    'Clear and direct', 'Analytical and detailed', 
    'Empathetic and supportive', 'Persuasive and engaging'
  ];
  
  return {
    ...candidate,
    scores,
    overallScore,
    strengths: selectedStrengths,
    weaknesses: selectedWeaknesses,
    personalityTraits: selectedTraits,
    zodiacSign: ['Aries', 'Taurus', 'Gemini', 'Cancer'][Math.floor(Math.random() * 4)],
    workStyle: ['Remote', 'Hybrid', 'Office-based'][Math.floor(Math.random() * 3)],
    cultureFit: Math.floor(Math.random() * 3) + 7, // 7-9
    leadershipPotential: Math.floor(Math.random() * 3) + 6, // 6-8
    education: ['Bachelor\'s', 'Master\'s', 'MBA'][Math.floor(Math.random() * 3)],
    yearsOfExperience: Math.floor(Math.random() * 7) + 2, // 2-8 years
    location: ['New York', 'San Francisco', 'London', 'Remote'][Math.floor(Math.random() * 4)],
    skillKeywords: selectedSkills,
    communicationStyle: commStyles[Math.floor(Math.random() * commStyles.length)],
    preferredTools: selectedTools,
    status: 'processed',
    processedAt: new Date().toISOString()
  };
};
