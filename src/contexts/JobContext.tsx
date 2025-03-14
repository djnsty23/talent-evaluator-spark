
// Define context type
interface JobContextType {
  jobs: Job[];
  currentJob: Job | null;
  reports: Report[];
  isLoading: boolean;
  createJob: (job: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>) => Promise<Job>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  setCurrentJob: (job: Job | null) => void;
  generateRequirements: (job: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>) => Promise<JobRequirement[]>;
  uploadCandidateFiles: (jobId: string, files: File[]) => Promise<void>;
  processCandidate: (jobId: string, candidateId: string) => Promise<void>;
  handleProcessAllCandidates: (jobId: string) => Promise<void>; // Add the new function
  starCandidate: (jobId: string, candidateId: string, isStarred: boolean) => Promise<void>;
  generateReport: (jobId: string, candidateIds: string[], additionalPrompt?: string) => Promise<Report>;
  deleteCandidate: (jobId: string, candidateId: string) => Promise<void>;
}

// Create context with default values
const JobContext = createContext<JobContextType>({
  jobs: [],
  currentJob: null,
  reports: [],
  isLoading: false,
  createJob: async () => ({ id: '', userId: '', title: '', company: '', description: '', requirements: [], candidates: [], createdAt: '', updatedAt: '' }),
  updateJob: async () => {},
  deleteJob: async () => {},
  setCurrentJob: () => {},
  generateRequirements: async () => [],
  uploadCandidateFiles: async () => {},
  processCandidate: async () => {},
  handleProcessAllCandidates: async () => {}, // Add the new function
  starCandidate: async () => {},
  generateReport: async () => ({ id: '', jobId: '', candidateIds: [], content: '', createdAt: '' }),
  deleteCandidate: async () => {},
});
