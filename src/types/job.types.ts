
// Define all types related to jobs and candidates here
export interface JobRequirement {
  id: string;
  description: string;
  weight: number;
  isRequired: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  resumeUrl?: string;
  overallScore: number;
  scores: {
    requirementId: string;
    score: number;
    comment: string;
  }[];
  strengths: string[];
  weaknesses: string[];
  isStarred: boolean;
  status: 'pending' | 'processed' | 'reviewed';
  jobId: string;
  processedAt: string;
  personalityTraits: string[];
  zodiacSign: string;
  workStyle: string;
  cultureFit: number;
  leadershipPotential: number;
  education: string;
  yearsOfExperience: number;
  location: string;
  skillKeywords: string[];
  availabilityDate?: string;
  communicationStyle: string;
  preferredTools: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  description: string;
  salary?: string;
  requirements: JobRequirement[];
  candidates: Candidate[];
  contextFiles?: File[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  content: string;
  candidateIds: string[];
  additionalPrompt?: string;
  jobId: string;
  createdAt: string;
}

export interface JobContextType {
  jobs: Job[];
  reports: Report[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  updateJob: (jobData: Job) => Promise<Job>;
  deleteJob: (jobId: string) => Promise<void>;
  uploadCandidateFiles: (jobId: string, files: File[]) => Promise<void>;
  processCandidate: (jobId: string, candidateId: string) => Promise<void>;
  handleProcessAllCandidates: (jobId: string) => Promise<void>;
  starCandidate: (jobId: string, candidateId: string, isStarred: boolean) => Promise<void>;
  deleteCandidate: (jobId: string, candidateId: string) => Promise<void>;
  generateReport: (jobId: string, candidateIds: string[], additionalPrompt?: string) => Promise<Report>;
  setCurrentJob: (job: Job | null) => void;
}
