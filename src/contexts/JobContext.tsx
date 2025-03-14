
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '@/services/api';
import { toast } from 'sonner';

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
}

export interface Report {
  id: string;
  jobId: string;
  candidateIds: string[];
  content: string;
  additionalPrompt?: string;
  createdAt: string;
}

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
  handleProcessAllCandidates: (jobId: string) => Promise<void>; 
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
  createJob: async () => ({ id: '', userId: '', title: '', company: '', description: '', location: '', department: '', salary: '', requirements: [], candidates: [], createdAt: '', updatedAt: '' }),
  updateJob: async () => {},
  deleteJob: async () => {},
  setCurrentJob: () => {},
  generateRequirements: async () => [],
  uploadCandidateFiles: async () => {},
  processCandidate: async () => {},
  handleProcessAllCandidates: async () => {}, 
  starCandidate: async () => {},
  generateReport: async () => ({ id: '', jobId: '', candidateIds: [], content: '', createdAt: '' }),
  deleteCandidate: async () => {},
});

// Provider props interface
interface JobProviderProps {
  children: ReactNode;
}

// Provider component
export const JobProvider = ({ children }: JobProviderProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load jobs from localStorage on mount
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true);
      try {
        const savedJobs = localStorage.getItem('jobs');
        const savedReports = localStorage.getItem('reports');
        
        if (savedJobs) {
          setJobs(JSON.parse(savedJobs));
        }
        
        if (savedReports) {
          setReports(JSON.parse(savedReports));
        }
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJobs();
  }, []);
  
  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }
  }, [jobs]);
  
  // Save reports to localStorage whenever they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('reports', JSON.stringify(reports));
    }
  }, [reports]);
  
  const createJob = async (jobData: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>) => {
    const newJob: Job = {
      id: `job_${Date.now()}`,
      userId: 'user123', // Mock user ID
      title: jobData.title,
      company: jobData.company,
      description: jobData.description,
      location: jobData.location || '',
      department: jobData.department || '',
      salary: jobData.salary || '',
      requirements: [],
      candidates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setJobs(prevJobs => [...prevJobs, newJob]);
    return newJob;
  };
  
  const updateJob = async (job: Job) => {
    setJobs(prevJobs => prevJobs.map(j => j.id === job.id ? { ...job, updatedAt: new Date().toISOString() } : j));
    if (currentJob && currentJob.id === job.id) {
      setCurrentJob({ ...job, updatedAt: new Date().toISOString() });
    }
  };
  
  const deleteJob = async (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));
    if (currentJob && currentJob.id === jobId) {
      setCurrentJob(null);
    }
    
    // Also delete any reports associated with this job
    setReports(prevReports => prevReports.filter(r => r.jobId !== jobId));
  };
  
  const generateRequirements = async (jobData: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>) => {
    try {
      // In a real app, this would call an AI service to generate requirements
      const mockRequirements: JobRequirement[] = [
        {
          id: `req_${Date.now()}_1`,
          category: 'Technical Skills',
          description: 'Proficiency in React.js',
          weight: 9,
          isRequired: true,
        },
        {
          id: `req_${Date.now()}_2`,
          category: 'Technical Skills',
          description: 'Experience with TypeScript',
          weight: 7,
          isRequired: false,
        },
        {
          id: `req_${Date.now()}_3`,
          category: 'Soft Skills',
          description: 'Strong communication skills',
          weight: 6,
          isRequired: true,
        },
      ];
      
      return mockRequirements;
    } catch (error) {
      console.error('Error generating requirements:', error);
      throw error;
    }
  };
  
  const uploadCandidateFiles = async (jobId: string, files: File[]) => {
    // Find the job to update
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Create mock candidates from the files
    const newCandidates: Candidate[] = files.map((file, index) => ({
      id: `candidate_${Date.now()}_${index}`,
      name: `Candidate ${index + 1}`,
      email: `candidate${index + 1}@example.com`,
      resumeUrl: URL.createObjectURL(file),
      overallScore: 0,
      scores: [],
      strengths: [],
      weaknesses: [],
      isStarred: false,
      status: 'pending',
      jobId: jobId,
    }));
    
    // Update the job with the new candidates
    const updatedJob = {
      ...job,
      candidates: [...job.candidates, ...newCandidates],
      updatedAt: new Date().toISOString()
    };
    
    await updateJob(updatedJob);
  };
  
  const processCandidate = async (jobId: string, candidateId: string) => {
    // Find the job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Find the candidate
    const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      throw new Error('Candidate not found');
    }
    
    // Generate mock analysis for the candidate
    const processedCandidate = {
      ...job.candidates[candidateIndex],
      overallScore: Math.random() * 10,
      scores: job.requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1,
        notes: 'Generated automatically'
      })),
      strengths: ['Good communication', 'Technical expertise'],
      weaknesses: ['Limited experience', 'Needs mentoring'],
      processedAt: new Date().toISOString()
    };
    
    // Update the job with the processed candidate
    const updatedCandidates = [...job.candidates];
    updatedCandidates[candidateIndex] = processedCandidate;
    
    const updatedJob = {
      ...job,
      candidates: updatedCandidates,
      updatedAt: new Date().toISOString()
    };
    
    await updateJob(updatedJob);
  };
  
  const handleProcessAllCandidates = async (jobId: string) => {
    // Find the job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Get all unprocessed candidates
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    
    // Process candidates with rate limiting (one at a time with delay)
    for (const candidate of unprocessedCandidates) {
      try {
        await processCandidate(jobId, candidate.id);
        // Add delay between API calls to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing candidate ${candidate.id}:`, error);
        toast.error(`Failed to process candidate: ${candidate.name}`);
      }
    }
  };
  
  const starCandidate = async (jobId: string, candidateId: string, isStarred: boolean) => {
    // Find the job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Find and update the candidate
    const updatedCandidates = job.candidates.map(c => 
      c.id === candidateId ? { ...c, isStarred } : c
    );
    
    const updatedJob = {
      ...job,
      candidates: updatedCandidates,
      updatedAt: new Date().toISOString()
    };
    
    await updateJob(updatedJob);
  };
  
  const deleteCandidate = async (jobId: string, candidateId: string) => {
    // Find the job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Filter out the candidate to delete
    const updatedCandidates = job.candidates.filter(c => c.id !== candidateId);
    
    const updatedJob = {
      ...job,
      candidates: updatedCandidates,
      updatedAt: new Date().toISOString()
    };
    
    await updateJob(updatedJob);
  };
  
  const generateReport = async (jobId: string, candidateIds: string[], additionalPrompt?: string) => {
    // Find the job
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    
    // Create a new report
    const newReport: Report = {
      id: `report_${Date.now()}`,
      jobId,
      candidateIds,
      content: `# Candidate Analysis Report for ${job.title} at ${job.company}
      
## Overview
This report analyzes ${candidateIds.length} candidates for the position.

## Job Requirements
${job.requirements.map(req => `- ${req.description} (Weight: ${req.weight}/10)`).join('\n')}

## Candidate Rankings
${candidateIds.map((candidateId, index) => {
  const candidate = job.candidates.find(c => c.id === candidateId);
  if (!candidate) return '';
  return `### ${index + 1}. ${candidate.name} - Overall Score: ${candidate.overallScore.toFixed(1)}/10
  - Strengths: ${candidate.strengths.join(', ')}
  - Areas for Development: ${candidate.weaknesses.join(', ')}
  `;
}).join('\n')}

${additionalPrompt ? `## Additional Analysis\n${additionalPrompt}` : ''}

## Recommendations
Based on our analysis, we recommend proceeding with the top-ranked candidates for interviews.
      `,
      additionalPrompt,
      createdAt: new Date().toISOString(),
    };
    
    // Add the report to the state
    setReports(prevReports => [...prevReports, newReport]);
    
    return newReport;
  };
  
  return (
    <JobContext.Provider
      value={{
        jobs,
        currentJob,
        reports,
        isLoading,
        createJob,
        updateJob,
        deleteJob,
        setCurrentJob,
        generateRequirements,
        uploadCandidateFiles,
        processCandidate,
        handleProcessAllCandidates,
        starCandidate,
        generateReport,
        deleteCandidate,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// Custom hook to use the job context
export const useJob = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
