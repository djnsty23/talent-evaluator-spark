
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

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

// Mock data service functions
const mockSaveData = async (data: any) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
};

// Define the context shape
interface JobContextType {
  jobs: Job[];
  reports: Report[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  setCurrentJob: (job: Job) => void;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  updateJob: (job: Job) => Promise<Job>;
  deleteJob: (jobId: string) => Promise<void>;
  uploadCandidateFiles: (jobId: string, files: File[]) => Promise<void>;
  processCandidate: (jobId: string, candidateId: string) => Promise<void>;
  handleProcessAllCandidates: (jobId: string) => Promise<void>;
  starCandidate: (jobId: string, candidateId: string, isStarred: boolean) => Promise<void>;
  deleteCandidate: (jobId: string, candidateId: string) => Promise<void>;
  generateReport: (jobId: string, candidateIds: string[], additionalPrompt?: string) => Promise<Report>;
}

// Create the context
const JobContext = createContext<JobContextType | undefined>(undefined);

// Provider component
export const JobProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with demo data
  useEffect(() => {
    if (currentUser) {
      const demoJobs: Job[] = [];
      const demoReports: Report[] = [];
      
      // Set demo data to state
      setJobs(demoJobs);
      setReports(demoReports);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Create a new job
  const createJob = useCallback(async (jobData: Partial<Job>): Promise<Job> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setIsLoading(true);
    
    try {
      const newJob: Job = {
        id: `job_${Date.now()}`,
        userId: currentUser.uid,
        title: jobData.title || '',
        company: jobData.company || '',
        description: jobData.description || '',
        location: jobData.location || '',
        department: jobData.department || '',
        salary: jobData.salary || '',
        requirements: jobData.requirements || [],
        candidates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save to backend (mocked)
      await mockSaveData(newJob);
      
      // Update local state
      setJobs(prevJobs => [...prevJobs, newJob]);
      setCurrentJob(newJob);
      
      return newJob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error creating job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Update an existing job
  const updateJob = useCallback(async (updatedJob: Job): Promise<Job> => {
    setIsLoading(true);
    
    try {
      // Update backend (mocked)
      await mockSaveData(updatedJob);
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job)
      );
      
      if (currentJob && currentJob.id === updatedJob.id) {
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
      // Delete from backend (mocked)
      await mockSaveData({ jobId });
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      if (currentJob && currentJob.id === jobId) {
        setCurrentJob(null);
      }
      
      // Also delete associated reports
      setReports(prevReports => prevReports.filter(report => report.jobId !== jobId));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error deleting job';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentJob]);

  // Upload candidate files
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
        const candidateName = fileName.split('.').slice(0, -1).join('.');
        
        return {
          id: `candidate_${Date.now()}_${index}`,
          name: candidateName || `Candidate ${job.candidates.length + index + 1}`,
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
    if (!jobId || !candidateId) return;
    
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Mock processing: Generate scores based on requirements
      const scores: CandidateScore[] = job.requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1, // Random score 1-10
        notes: `Auto-generated score for ${req.description}`
      }));
      
      // Calculate overall score (weighted average)
      const totalWeight = job.requirements.reduce((sum, req) => sum + req.weight, 0);
      const weightedScoreSum = scores.reduce((sum, score, index) => {
        const requirement = job.requirements[index];
        return sum + (score.score * requirement.weight);
      }, 0);
      
      const overallScore = totalWeight > 0 
        ? Math.round((weightedScoreSum / totalWeight) * 10) / 10
        : 0;
      
      // Generate strengths and weaknesses
      const strengths = scores
        .filter(score => score.score >= 7)
        .map(score => {
          const req = job.requirements.find(r => r.id === score.requirementId);
          return req ? req.description : '';
        })
        .filter(Boolean);
      
      const weaknesses = scores
        .filter(score => score.score <= 4)
        .map(score => {
          const req = job.requirements.find(r => r.id === score.requirementId);
          return req ? req.description : '';
        })
        .filter(Boolean);

      // Generate personality traits (mock data)
      const personalityTraits = ['Analytical', 'Detail-oriented', 'Team player', 'Self-motivated', 'Creative'];
      const randomTraits = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * personalityTraits.length);
        randomTraits.push(personalityTraits[randomIndex]);
        personalityTraits.splice(randomIndex, 1);
      }
      
      // Generate zodiac sign (mock data)
      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const randomZodiac = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
      
      // Generate work style (mock data)
      const workStyles = ['Remote', 'Hybrid', 'In-office', 'Flexible'];
      const randomWorkStyle = workStyles[Math.floor(Math.random() * workStyles.length)];
      
      // Generate culture fit and leadership potential scores
      const cultureFit = Math.floor(Math.random() * 10) + 1;
      const leadershipPotential = Math.floor(Math.random() * 10) + 1;
      
      // Update the candidate
      const updatedCandidate: Candidate = {
        ...job.candidates[candidateIndex],
        scores,
        overallScore,
        strengths,
        weaknesses,
        status: 'reviewed',
        processedAt: new Date().toISOString(),
        personalityTraits: randomTraits,
        zodiacSign: randomZodiac,
        workStyle: randomWorkStyle,
        cultureFit,
        leadershipPotential
      };
      
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = updatedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob]);

  // Process all unprocessed candidates
  const handleProcessAllCandidates = useCallback(async (jobId: string): Promise<void> => {
    if (!jobId) return;
    
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Find unprocessed candidates (those without scores)
      const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
      
      if (unprocessedCandidates.length === 0) {
        toast.info("No unprocessed candidates found");
        return;
      }
      
      // Process each candidate one by one
      for (const candidate of unprocessedCandidates) {
        await processCandidate(jobId, candidate.id);
      }
      
      toast.success(`Successfully processed ${unprocessedCandidates.length} candidates`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing all candidates';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, processCandidate]);

  // Star/unstar a candidate
  const starCandidate = useCallback(async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    if (!jobId || !candidateId) return;
    
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Update the candidate
      const updatedCandidate = {
        ...job.candidates[candidateIndex],
        isStarred
      };
      
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = updatedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error starring candidate';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [jobs, currentJob]);

  // Delete a candidate
  const deleteCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    if (!jobId || !candidateId) return;
    
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Filter out the candidate
      const updatedCandidates = job.candidates.filter(c => c.id !== candidateId);
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
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
    if (!jobId || candidateIds.length === 0) {
      throw new Error('Job ID and candidate IDs are required');
    }
    
    setIsLoading(true);
    
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Generate a mock report
      const report: Report = {
        id: `report_${Date.now()}`,
        jobId,
        candidateIds,
        content: generateMockReportContent(job, candidateIds, additionalPrompt),
        additionalPrompt,
        createdAt: new Date().toISOString()
      };
      
      // Update backend (mocked)
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
    
    // Sort candidates by score (highest first)
    candidates.sort((a, b) => b.overallScore - a.overallScore);
    
    let reportContent = `# Candidate Ranking Report\n\n`;
    reportContent += `## Job: ${job.title} at ${job.company}\n\n`;
    reportContent += `### Executive Summary\n\n`;
    reportContent += `This report analyzes ${candidates.length} candidates for the ${job.title} position at ${job.company}. `;
    reportContent += `The candidates were evaluated against ${job.requirements.length} key requirements.\n\n`;
    
    if (additionalPrompt) {
      reportContent += `*Additional focus areas: ${additionalPrompt}*\n\n`;
    }
    
    reportContent += `### Candidate Rankings\n\n`;
    
    candidates.forEach((candidate, index) => {
      reportContent += `#### ${index + 1}. ${candidate.name} - Overall Score: ${candidate.overallScore}/10\n\n`;
      
      reportContent += `**Strengths:**\n`;
      if (candidate.strengths.length > 0) {
        candidate.strengths.forEach(strength => {
          reportContent += `- ${strength}\n`;
        });
      } else {
        reportContent += `- No notable strengths identified\n`;
      }
      
      reportContent += `\n**Areas for Improvement:**\n`;
      if (candidate.weaknesses.length > 0) {
        candidate.weaknesses.forEach(weakness => {
          reportContent += `- ${weakness}\n`;
        });
      } else {
        reportContent += `- No significant weaknesses identified\n`;
      }
      
      reportContent += `\n**Personality Traits:** ${candidate.personalityTraits?.join(', ') || 'Not assessed'}\n`;
      reportContent += `**Work Style:** ${candidate.workStyle || 'Not assessed'}\n`;
      reportContent += `**Culture Fit:** ${candidate.cultureFit || 'Not assessed'}/10\n`;
      reportContent += `**Leadership Potential:** ${candidate.leadershipPotential || 'Not assessed'}/10\n\n`;
    });
    
    reportContent += `### Recommendation\n\n`;
    
    if (candidates.length > 0) {
      const topCandidate = candidates[0];
      reportContent += `Based on the evaluation, **${topCandidate.name}** appears to be the strongest candidate `;
      reportContent += `with an overall score of ${topCandidate.overallScore}/10. `;
      
      if (candidates.length > 1) {
        const runnerUp = candidates[1];
        reportContent += `**${runnerUp.name}** is also a strong contender with a score of ${runnerUp.overallScore}/10.`;
      }
    } else {
      reportContent += `No candidates were available for evaluation.`;
    }
    
    return reportContent;
  };

  // Context provider value
  const value = {
    jobs,
    reports,
    currentJob,
    isLoading,
    error,
    setCurrentJob,
    createJob,
    updateJob,
    deleteJob,
    uploadCandidateFiles,
    processCandidate,
    handleProcessAllCandidates,
    starCandidate,
    deleteCandidate,
    generateReport,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

// Custom hook for using the job context
export const useJob = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
};
