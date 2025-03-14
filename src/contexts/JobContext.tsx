
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { 
  Job, 
  Candidate, 
  JobRequirement, 
  Report, 
  JobContextType 
} from '@/types/job.types';
import { getStorageData, saveStorageData, mockSaveData } from '@/utils/storage';
import { createCandidateFromFile, processCandidate } from '@/services/candidateService';
import { generateReport } from '@/services/reportService';

// Re-export types
export type { 
  Job, 
  Candidate, 
  JobRequirement, 
  Report, 
  JobContextType 
};

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
    const loadSavedData = async () => {
      setIsLoading(true);
      try {
        const data = await getStorageData();
        setJobs(data.jobs);
        setReports(data.reports);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveStorageData({ jobs, reports });
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
        salary: jobData.salary,
        requirements: jobData.requirements || [],
        candidates: [],
        contextFiles: jobData.contextFiles || [],
        userId: 'user_1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Supabase
      await mockSaveData(newJob);

      // Update local state
      setJobs(prevJobs => [...prevJobs, newJob]);
      
      // Log the current jobs state after update
      console.log('Jobs after create:', [...jobs, newJob]);
      
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs]);

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
      
      // Log the current jobs state after update
      console.log('Jobs after update:', jobs.map(j => j.id === jobData.id ? updatedJob : j));

      return updatedJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error updating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, jobs]);

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
      
      // Log the current jobs state after delete
      console.log('Jobs after delete:', jobs.filter(j => j.id !== jobId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob, jobs]);

  // Handle candidate file uploads to extract proper names
  const uploadCandidateFiles = useCallback(async (jobId: string, files: File[]): Promise<void> => {
    if (!jobId || files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Find the job to update
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Process each file and create a candidate entry
      const newCandidates: Candidate[] = files.map((file, index) => 
        createCandidateFromFile(file, jobId, index)
      );
      
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

  // Process a single candidate with more enhanced attributes
  const processCandidateAction = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Get the candidate and process it
      const processedCandidate = processCandidate(job.candidates[candidateIndex], job.requirements);
      
      // Create updated job with processed candidate
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = processedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await mockSaveData(updatedJob);
      
      // Update local state immediately
      setJobs(prevJobs => 
        prevJobs.map(j => j.id === jobId ? updatedJob : j)
      );
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      console.log(`Successfully processed candidate: ${processedCandidate.name}`);
      return Promise.resolve();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidate';
      setError(errorMessage);
      console.error(`Error processing candidate: ${errorMessage}`);
      return Promise.reject(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobs, currentJob]);

  // Process all unprocessed candidates - improved with better error handling and state updates
  const handleProcessAllCandidates = useCallback(async (jobId: string): Promise<void> => {
    try {
      console.log('Processing all candidates for job:', jobId);
      
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        console.error('Job not found:', jobId);
        throw new Error('Job not found');
      }
      
      // Get all unprocessed candidates
      const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
      console.log(`Found ${unprocessedCandidates.length} unprocessed candidates`);
      
      if (unprocessedCandidates.length === 0) {
        toast.info('No unprocessed candidates found');
        return Promise.resolve();
      }
      
      // Track processed candidates and errors
      let successCount = 0;
      let errorCount = 0;
      const processingErrors: string[] = [];
      
      // Process each candidate sequentially to avoid race conditions
      for (const candidate of unprocessedCandidates) {
        try {
          console.log(`Processing candidate: ${candidate.name} (${candidate.id})`);
          await processCandidateAction(jobId, candidate.id);
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          processingErrors.push(`Failed to process ${candidate.name}: ${errorMessage}`);
          console.error(`Error processing candidate ${candidate.name}:`, error);
        }
      }
      
      // Fetch the updated job to ensure we have the latest state
      const updatedJob = jobs.find(j => j.id === jobId);
      
      // Log processing results
      console.log(`Processing completed. Success: ${successCount}, Errors: ${errorCount}`);
      
      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully processed ${successCount} candidates`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`Processed ${successCount} candidates with ${errorCount} errors`);
      } else if (successCount === 0 && errorCount > 0) {
        toast.error(`Failed to process any candidates. Check console for details.`);
      }
      
      // If we had any errors, log them to console
      if (processingErrors.length > 0) {
        console.error('Processing errors:', processingErrors);
      }
      
      return Promise.resolve();
      
    } catch (err) {
      console.error('Error in handleProcessAllCandidates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidates';
      setError(errorMessage);
      toast.error('Failed to process candidates');
      return Promise.reject(errorMessage);
    }
  }, [jobs, processCandidateAction]);

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
  const generateReportAction = useCallback(async (
    jobId: string, 
    candidateIds: string[], 
    additionalPrompt?: string
  ): Promise<Report> => {
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Create a report
      const report = await generateReport(job, candidateIds, additionalPrompt);
      
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
    processCandidate: processCandidateAction,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate,
    generateReport: generateReportAction,
    setCurrentJob,
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
