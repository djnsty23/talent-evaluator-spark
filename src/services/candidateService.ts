
import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';

export const createCandidateFromFile = (file: File, jobId: string, index: number): Candidate => {
  // Extract candidate name from filename, removing extension
  const fileName = file.name;
  const candidateName = fileName.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  
  return {
    id: `candidate_${Date.now()}_${index}`,
    name: candidateName,
    email: `${candidateName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    resumeUrl: URL.createObjectURL(file),
    overallScore: 0,
    scores: [],
    strengths: [],
    weaknesses: [],
    isStarred: false,
    status: 'pending',
    jobId: jobId,
    processedAt: new Date().toISOString(),
    // Initialize with empty values, will be filled during real processing
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
  // In a production environment, this would call an AI service to analyze the resume
  // For now, we'll just ensure it returns a properly structured object
  
  const processedCandidate = { ...candidate };
  
  // Initialize with empty scores that will be filled by the AI service
  const scores = requirements.map(req => {
    return {
      requirementId: req.id,
      score: 0,
      comment: '',
    };
  });
  
  processedCandidate.scores = scores;
  processedCandidate.overallScore = 0;
  processedCandidate.strengths = [];
  processedCandidate.weaknesses = [];
  processedCandidate.status = 'processed';
  processedCandidate.processedAt = new Date().toISOString();
  
  return processedCandidate;
};

// Default requirements for a Customer Success role
export const getDefaultCustomerSuccessRequirements = (): JobRequirement[] => {
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
