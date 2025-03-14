
// Types
export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  description: string;
  location: string;
  department: string;
  salary: string;
  requirements: JobRequirement[];
  candidates: Candidate[];
  contextFiles?: File[];
  createdAt: string;
  updatedAt: string;
}

export interface JobRequirement {
  id: string;
  category: string;
  description: string;
  weight: number;
  isRequired: boolean;
}

export interface CandidateScore {
  requirementId: string;
  score: number;
  notes?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  overallScore: number;
  scores: CandidateScore[];
  strengths: string[];
  weaknesses: string[];
  isStarred: boolean;
  status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  notes?: string;
  jobId: string;
  processedAt?: string;
  // New fields for enhanced evaluation
  personalityTraits?: string[];
  zodiacSign?: string;
  workStyle?: string;
  cultureFit?: number;
  leadershipPotential?: number;
}

export interface Report {
  id: string;
  jobId: string;
  candidateIds: string[];
  content: string;
  additionalPrompt?: string;
  createdAt: string;
}
