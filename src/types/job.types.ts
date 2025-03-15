
export interface JobRequirement {
  id: string;
  description: string;
  weight: number;
  category: string;
  isRequired: boolean;
}

export interface RequirementScore {
  requirementId: string;
  score: number;
  comment?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  resumeUrl?: string;
  scores: RequirementScore[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  isStarred?: boolean;
  status?: 'pending' | 'processed';
  jobId: string;
  processedAt: string;
  
  // Additional candidate details
  personalityTraits?: string[];
  zodiacSign?: string;
  workStyle?: string;
  cultureFit?: number;
  leadershipPotential?: number;
  education?: string;
  yearsOfExperience?: number;
  location?: string;
  skillKeywords?: string[];
  communicationStyle?: string;
  preferredTools?: string[];
}

export interface ContextFile {
  id: string;
  name: string;
  content: string;
  type: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: JobRequirement[];
  candidates: Candidate[];
  department?: string;
  location?: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt: string;
  updatedAt: string;
  contextFiles?: ContextFile[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  content: string;
  candidateIds: string[];
  jobId: string;
  createdAt: string;
  additionalPrompt?: string;
  metadata?: any; // For storing AI-generated structured data
}
