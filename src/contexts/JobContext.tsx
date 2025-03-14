
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Define types
export interface JobRequirement {
  id: string;
  category: string;
  description: string;
  weight: number;
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
  email: string;
  resumeUrl: string;
  overallScore: number;
  scores: RequirementScore[];
  strengths: string[];
  weaknesses: string[];
  isStarred: boolean;
  status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  jobId: string;
  processedAt: string;
  personalityTraits: string[];
  zodiacSign: string;
  workStyle: string;
  cultureFit: number;
  leadershipPotential: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  department: string;
  salary: string;
  requirements: JobRequirement[];
  candidates: Candidate[];
  contextFiles: any[];
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

// Mock data and utilities
const STORAGE_KEY = 'job_app_data';

const mockSaveData = async (data: any): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};

interface JobContextType {
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
  setCurrentJob: (job: Job | null) => void; // Added missing function
}

const JobContext = createContext<JobContextType | undefined>(undefined);

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setJobs(parsedData.jobs || []);
          setReports(parsedData.reports || []);
        }
      } catch (err) {
        console.error('Error loading data from localStorage:', err);
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ jobs, reports }));
    } catch (err) {
      console.error('Error saving data to localStorage:', err);
    }
  }, [jobs, reports]);

  // Create a new job
  const createJob = useCallback(async (jobData: Partial<Job>): Promise<Job> => {
    setIsLoading(true);
    try {
      const newJob: Job = {
        id: uuidv4(),
        title: jobData.title || 'Untitled Job',
        company: jobData.company || '',
        description: jobData.description || '',
        location: jobData.location || '',
        department: jobData.department || '',
        salary: jobData.salary || '',
        requirements: jobData.requirements || [],
        candidates: [],
        contextFiles: [],
        userId: 'user_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock API call
      await mockSaveData(newJob);

      // Update local state
      setJobs(prevJobs => [...prevJobs, newJob]);
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing job
  const updateJob = useCallback(async (jobData: Job): Promise<Job> => {
    setIsLoading(true);
    try {
      const updatedJob = {
        ...jobData,
        updatedAt: new Date().toISOString(),
      };

      // Mock API call
      await mockSaveData(updatedJob);

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobData.id ? updatedJob : j)
      );

      if (currentJob && currentJob.id === jobData.id) {
        setCurrentJob(updatedJob);
      }

      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob]);

  // Delete a job
  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Mock API call
      await mockSaveData({ id: jobId, deleted: true });

      // Update local state
      setJobs(prevJobs => prevJobs.filter(j => j.id !== jobId));

      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob]);

  // This function specifically handles the candidate file uploads to extract proper names
  const uploadCandidateFiles = useCallback(async (jobId: string, files: File[]): Promise<void> => {
    if (!jobId || files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Find the job to update
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Process each file and create a candidate entry
      const newCandidates: Candidate[] = files.map((file, index) => {
        // Extract candidate name from filename (remove extension)
        const fileName = file.name;
        let candidateName = fileName.split('.').slice(0, -1).join('.');
        
        // Format the name more professionally
        candidateName = candidateName
          // Replace underscores and hyphens with spaces
          .replace(/[_-]/g, ' ')
          // Convert to title case (capitalize first letter of each word)
          .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
          // Remove any prefix like "CV_" or "Resume_"
          .replace(/^(cv|resume|résumé)[\s_-]*/i, '')
          .trim();
        
        // If name is still empty after processing, use a generic name
        if (!candidateName) {
          candidateName = `Candidate ${job.candidates.length + index + 1}`;
        }
        
        return {
          id: `candidate_${Date.now()}_${index}`,
          name: candidateName,
          email: `candidate${job.candidates.length + index + 1}@example.com`,
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
          leadershipPotential: 0
        };
      });
      
      const updatedJob = {
        ...job,
        candidates: [...job.candidates, ...newCandidates],
        updatedAt: new Date().toISOString()
      };
      
      // Update backend (mocked)
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading candidates';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs, currentJob]);

  // Process a single candidate
  const processCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Simulate AI processing by generating random scores
      const processedCandidate = { ...job.candidates[candidateIndex] };
      
      // Generate scores for each requirement
      const scores = job.requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1, // 1-10 score
      }));
      
      // Calculate overall score (weighted average)
      const totalWeight = job.requirements.reduce((sum, req) => sum + req.weight, 0);
      const weightedScore = job.requirements.reduce((sum, req, index) => {
        return sum + (scores[index].score * req.weight);
      }, 0);
      
      const overallScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
      
      // Generate random strengths and weaknesses
      const strengths = ['Communication skills', 'Problem-solving ability', 'Technical expertise'].slice(0, Math.floor(Math.random() * 3) + 1);
      const weaknesses = ['Limited experience', 'Needs mentoring', 'May require additional training'].slice(0, Math.floor(Math.random() * 3) + 1);
      
      // Update the candidate
      processedCandidate.scores = scores;
      processedCandidate.overallScore = overallScore;
      processedCandidate.strengths = strengths;
      processedCandidate.weaknesses = weaknesses;
      processedCandidate.processedAt = new Date().toISOString();
      processedCandidate.personalityTraits = ['Analytical', 'Detail-oriented', 'Team player'].slice(0, Math.floor(Math.random() * 3) + 1);
      processedCandidate.zodiacSign = ['Aries', 'Taurus', 'Gemini', 'Cancer'][Math.floor(Math.random() * 4)];
      processedCandidate.workStyle = ['Remote', 'Hybrid', 'Office'][Math.floor(Math.random() * 3)];
      processedCandidate.cultureFit = Math.floor(Math.random() * 10) + 1;
      processedCandidate.leadershipPotential = Math.floor(Math.random() * 10) + 1;
      
      // Create updated job
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = processedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs, currentJob]);

  // Process all unprocessed candidates
  const handleProcessAllCandidates = useCallback(async (jobId: string): Promise<void> => {
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Get all unprocessed candidates
      const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
      if (unprocessedCandidates.length === 0) return;
      
      // Process each candidate sequentially (we could make this parallel, but
      // for this demo we'll keep it sequential to avoid UI jank)
      for (const candidate of unprocessedCandidates) {
        await processCandidate(jobId, candidate.id);
      }
      
      toast.success(`Successfully processed ${unprocessedCandidates.length} candidates`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidates';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, processCandidate]);

  // Star/unstar a candidate
  const starCandidate = useCallback(async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Update the candidate
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = {
        ...updatedCandidates[candidateIndex],
        isStarred,
      };
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Mock API call
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starring candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob]);

  // Delete a candidate
  const deleteCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Filter out the candidate
      const updatedCandidates = job.candidates.filter(c => c.id !== candidateId);
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Mock API call
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob]);

  // Generate a report
  const generateReport = useCallback(async (
    jobId: string, 
    candidateIds: string[], 
    additionalPrompt?: string
  ): Promise<Report> => {
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Create a mock report
      const report: Report = {
        id: uuidv4(),
        title: `Candidate Ranking Report for ${job.title}`,
        summary: `Analysis of ${candidateIds.length} candidates for ${job.title} at ${job.company}`,
        content: generateMockReportContent(job, candidateIds, additionalPrompt),
        candidateIds,
        additionalPrompt,
        jobId,
        createdAt: new Date().toISOString(),
      };
      
      // Mock API call
      await mockSaveData(report);
      
      // Update local state
      setReports(prevReports => [...prevReports, report]);
      
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs]);

  // Helper function to generate mock report content
  const generateMockReportContent = (job: Job, candidateIds: string[], additionalPrompt?: string): string => {
    const candidates = job.candidates.filter(c => candidateIds.includes(c.id));
    const sortedCandidates = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
    
    let content = `# Candidate Ranking Report for ${job.title}\n\n`;
    content += `## Job Overview\n\n`;
    content += `**Title:** ${job.title}\n`;
    content += `**Company:** ${job.company}\n`;
    content += `**Department:** ${job.department}\n`;
    content += `**Location:** ${job.location}\n\n`;
    
    content += `## Job Requirements\n\n`;
    job.requirements.forEach(req => {
      content += `- ${req.description} (Weight: ${req.weight}/10, ${req.isRequired ? 'Required' : 'Optional'})\n`;
    });
    
    content += `\n## Candidate Rankings\n\n`;
    sortedCandidates.forEach((candidate, index) => {
      content += `### ${index + 1}. ${candidate.name} (${candidate.overallScore.toFixed(1)}/10)\n\n`;
      
      content += `**Strengths:**\n`;
      candidate.strengths.forEach(strength => {
        content += `- ${strength}\n`;
      });
      
      content += `\n**Areas for Development:**\n`;
      candidate.weaknesses.forEach(weakness => {
        content += `- ${weakness}\n`;
      });
      
      content += `\n**Skill Assessment:**\n`;
      candidate.scores.forEach(score => {
        const requirement = job.requirements.find(r => r.id === score.requirementId);
        if (requirement) {
          content += `- ${requirement.description}: ${score.score}/10\n`;
        }
      });
      
      content += `\n`;
    });
    
    if (additionalPrompt) {
      content += `## Additional Analysis\n\n`;
      content += `Custom analysis based on: "${additionalPrompt}"\n\n`;
      content += `This section would contain AI-generated analysis based on the custom prompt.\n\n`;
    }
    
    content += `## Recommendations\n\n`;
    content += `Based on the analysis, we recommend proceeding with interviews for the top 3 candidates.\n`;
    
    return content;
  };

  const value = {
    jobs,
    reports,
    currentJob,
    isLoading,
    error,
    createJob,
    updateJob,
    deleteJob,
    uploadCandidateFiles,
    processCandidate,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate,
    generateReport,
    setCurrentJob, // Added missing function to the context value
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = (): JobContextType => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
