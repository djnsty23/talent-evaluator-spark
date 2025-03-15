import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { extractCandidateName, extractNameFromContent } from '@/utils/candidateUtils';
import { extractTextFromFile } from '@/services/api';

export const createCandidateFromFile = async (file: File, jobId: string, index: number): Promise<Candidate> => {
  // Try to extract candidate name, with multiple fallback strategies
  let candidateName = 'N/A';
  
  // First try to extract candidate name from filename
  const filenameExtractedName = extractCandidateName(file.name);
  if (filenameExtractedName) {
    candidateName = filenameExtractedName;
  } else {
    // If filename-based extraction fails, try content-based extraction
    try {
      // Extract text content from the file
      const content = await extractTextFromFile(file);
      const contentExtractedName = await extractNameFromContent(content);
      
      if (contentExtractedName) {
        candidateName = contentExtractedName;
      }
      // If content extraction also fails, we leave it as "N/A"
    } catch (error) {
      console.error("Error extracting text from file:", error);
      // Keep N/A as the name
    }
  }
  
  return {
    id: uuidv4(),
    name: candidateName,
    email: candidateName !== 'N/A' 
      ? `${candidateName.toLowerCase().replace(/\s/g, '.')}@example.com`
      : `candidate${index}@example.com`,
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
  
  // Initialize with scores for each requirement
  const scores = requirements.map(req => {
    return {
      requirementId: req.id,
      score: Math.floor(Math.random() * 5) + 1, // Random score 1-5 for demo
      comment: `Generated score for ${req.description}`,
    };
  });
  
  processedCandidate.scores = scores;
  processedCandidate.overallScore = calculateOverallScore(scores, requirements);
  processedCandidate.strengths = ['Communication', 'Problem Solving'];
  processedCandidate.weaknesses = ['Time Management'];
  processedCandidate.status = 'processed';
  processedCandidate.processedAt = new Date().toISOString();
  
  return processedCandidate;
};

const calculateOverallScore = (
  scores: { requirementId: string; score: number; comment: string }[], 
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
