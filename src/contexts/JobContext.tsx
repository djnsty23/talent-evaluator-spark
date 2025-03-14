
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Define job types
export interface JobRequirement {
  id: string;
  category: string;
  description: string;
  weight: number; // 1-10 weight
  isRequired: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  resumeUrl: string;
  isStarred: boolean;
  scores: {
    requirementId: string;
    score: number; // 1-10 score
    notes?: string;
  }[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  notes: string;
  processedAt: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  description: string;
  requirements: JobRequirement[];
  candidates: Candidate[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  jobId: string;
  candidateIds: string[];
  content: string;
  createdAt: string;
  additionalPrompt?: string;
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
  starCandidate: async () => {},
  generateReport: async () => ({ id: '', jobId: '', candidateIds: [], content: '', createdAt: '' }),
  deleteCandidate: async () => {},
});

// Custom hook to use Job context
export const useJob = () => useContext(JobContext);

// Job Provider component
export const JobProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load jobs from local storage when component mounts
  useEffect(() => {
    if (currentUser) {
      const storedJobs = localStorage.getItem(`jobs_${currentUser.id}`);
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      }

      const storedReports = localStorage.getItem(`reports_${currentUser.id}`);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
    }
  }, [currentUser]);

  // Save jobs to local storage when they change
  useEffect(() => {
    if (currentUser && jobs.length > 0) {
      localStorage.setItem(`jobs_${currentUser.id}`, JSON.stringify(jobs));
    }
  }, [currentUser, jobs]);

  // Save reports to local storage when they change
  useEffect(() => {
    if (currentUser && reports.length > 0) {
      localStorage.setItem(`reports_${currentUser.id}`, JSON.stringify(reports));
    }
  }, [currentUser, reports]);

  // Create a new job
  const createJob = async (
    jobData: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>
  ): Promise<Job> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Generate a unique ID
      const jobId = `job_${Date.now()}`;
      
      // Create the new job
      const newJob: Job = {
        id: jobId,
        userId: currentUser.id,
        ...jobData,
        requirements: [],
        candidates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update state
      setJobs(prevJobs => [...prevJobs, newJob]);
      setCurrentJob(newJob);
      
      toast.success('Job created successfully');
      return newJob;
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing job
  const updateJob = async (updatedJob: Job): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Update the job
      const updatedJobs = jobs.map(job => 
        job.id === updatedJob.id 
          ? { ...updatedJob, updatedAt: new Date().toISOString() } 
          : job
      );
      
      // Update state
      setJobs(updatedJobs);
      if (currentJob?.id === updatedJob.id) {
        setCurrentJob({ ...updatedJob, updatedAt: new Date().toISOString() });
      }
      
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a job
  const deleteJob = async (jobId: string): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Remove job from state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      // Clear current job if it's the one being deleted
      if (currentJob?.id === jobId) {
        setCurrentJob(null);
      }
      
      // Remove related reports
      setReports(prevReports => prevReports.filter(report => report.jobId !== jobId));
      
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate job requirements using OpenAI
  const generateRequirements = async (
    jobData: Omit<Job, 'id' | 'userId' | 'requirements' | 'candidates' | 'createdAt' | 'updatedAt'>
  ): Promise<JobRequirement[]> => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call to a backend that uses OpenAI
      // For demo purposes, we'll simulate the response with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated requirements based on job title
      const mockCategories = ['Technical Skills', 'Soft Skills', 'Education', 'Experience', 'Certifications'];
      
      // Generate mock requirements
      const requirements: JobRequirement[] = [];
      
      // Technical skills
      requirements.push({
        id: `req_${Date.now()}_1`,
        category: 'Technical Skills',
        description: 'Proficiency in relevant programming languages',
        weight: 9,
        isRequired: true,
      });
      
      requirements.push({
        id: `req_${Date.now()}_2`,
        category: 'Technical Skills',
        description: 'Experience with relevant frameworks and tools',
        weight: 8,
        isRequired: true,
      });
      
      // Soft skills
      requirements.push({
        id: `req_${Date.now()}_3`,
        category: 'Soft Skills',
        description: 'Strong communication and teamwork',
        weight: 7,
        isRequired: true,
      });
      
      requirements.push({
        id: `req_${Date.now()}_4`,
        category: 'Soft Skills',
        description: 'Problem-solving and analytical thinking',
        weight: 8,
        isRequired: true,
      });
      
      // Education
      requirements.push({
        id: `req_${Date.now()}_5`,
        category: 'Education',
        description: 'Bachelor\'s degree in relevant field',
        weight: 6,
        isRequired: false,
      });
      
      // Experience
      requirements.push({
        id: `req_${Date.now()}_6`,
        category: 'Experience',
        description: '3+ years of relevant experience',
        weight: 8,
        isRequired: true,
      });
      
      // Added implied requirement
      requirements.push({
        id: `req_${Date.now()}_7`,
        category: 'Language',
        description: 'Fluency in English (written and verbal)',
        weight: 9,
        isRequired: true,
      });
      
      toast.success('Requirements generated successfully');
      return requirements;
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast.error('Failed to generate requirements');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload candidate files
  const uploadCandidateFiles = async (jobId: string, files: File[]): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Process each file
      const newCandidates: Candidate[] = [];
      const duplicates: string[] = [];
      
      for (const file of files) {
        // In a real app, this would upload the file to storage and process it
        // For demo, we'll create mock candidates and check for duplicates
        const candidateName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        
        // Check if this CV may already be uploaded (by filename)
        const possibleDuplicate = job.candidates.find(
          c => c.name.toLowerCase() === candidateName.toLowerCase()
        );
        
        if (possibleDuplicate) {
          duplicates.push(candidateName);
          continue;
        }
        
        const candidateId = `candidate_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const newCandidate: Candidate = {
          id: candidateId,
          name: candidateName,
          resumeUrl: URL.createObjectURL(file),
          isStarred: false,
          scores: [],
          overallScore: 0,
          strengths: [],
          weaknesses: [],
          notes: '',
          processedAt: new Date().toISOString(),
        };
        
        newCandidates.push(newCandidate);
      }
      
      // Show toast for duplicates if any
      if (duplicates.length > 0) {
        toast.warning(
          duplicates.length === 1
            ? `Skipped possible duplicate: ${duplicates[0]}`
            : `Skipped ${duplicates.length} possible duplicates`
        );
      }
      
      // Update the job with new candidates
      const updatedJob = {
        ...job,
        candidates: [...job.candidates, ...newCandidates],
        updatedAt: new Date().toISOString(),
      };
      
      // Update state
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));
      if (currentJob?.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      const addedCount = newCandidates.length;
      if (addedCount > 0) {
        toast.success(`${addedCount} candidate file(s) uploaded successfully`);
      } else if (duplicates.length === files.length) {
        toast.error('All files appear to be duplicates');
      }
    } catch (error) {
      console.error('Error uploading candidate files:', error);
      toast.error('Failed to upload candidate files');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process a candidate with AI
  const processCandidate = async (jobId: string, candidateId: string): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Find the candidate
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // In a real app, this would call an API to process the candidate with AI
      // For demo, we'll simulate processing with random scores
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedCandidate = { ...job.candidates[candidateIndex] };
      
      // Generate mock scores for each requirement
      updatedCandidate.scores = job.requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1, // Random score 1-10
        notes: `AI analysis for ${req.description}`,
      }));
      
      // Calculate overall score based on weighted average
      const totalWeight = job.requirements.reduce((sum, req) => sum + req.weight, 0);
      const weightedScore = job.requirements.reduce((sum, req, index) => {
        const score = updatedCandidate.scores[index].score;
        return sum + (score * req.weight);
      }, 0);
      
      updatedCandidate.overallScore = totalWeight > 0 
        ? Math.round((weightedScore / totalWeight) * 10) / 10 
        : 0;
      
      // Generate strengths and weaknesses
      const strengths = job.requirements
        .filter((_, index) => updatedCandidate.scores[index].score >= 8)
        .map(req => req.description);
      
      const weaknesses = job.requirements
        .filter((_, index) => updatedCandidate.scores[index].score <= 4)
        .map(req => req.description);
      
      updatedCandidate.strengths = strengths;
      updatedCandidate.weaknesses = weaknesses;
      
      // Update the candidate in the job
      const updatedCandidates = [...job.candidates];
      updatedCandidates[candidateIndex] = updatedCandidate;
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Update state
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));
      if (currentJob?.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      toast.success(`Candidate ${updatedCandidate.name} processed successfully`);
    } catch (error) {
      console.error('Error processing candidate:', error);
      toast.error('Failed to process candidate');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Star/unstar a candidate
  const starCandidate = async (jobId: string, candidateId: string, isStarred: boolean): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Update the candidate isStarred status
      const updatedCandidates = job.candidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, isStarred } 
          : candidate
      );
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Update state
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));
      if (currentJob?.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      toast.success(`Candidate ${isStarred ? 'starred' : 'unstarred'} successfully`);
    } catch (error) {
      console.error('Error starring candidate:', error);
      toast.error('Failed to update candidate starred status');
      throw error;
    }
  };

  // Generate a report for selected candidates
  const generateReport = async (jobId: string, candidateIds: string[], additionalPrompt?: string): Promise<Report> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    setIsLoading(true);
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Get the selected candidates
      const selectedCandidates = job.candidates.filter(candidate => 
        candidateIds.includes(candidate.id)
      );
      
      if (selectedCandidates.length === 0) {
        throw new Error('No candidates selected for report');
      }
      
      // In a real app, this would call an API to generate the report with OpenAI
      // For demo, we'll simulate the report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create the report ID
      const reportId = `report_${Date.now()}`;
      
      // Sort candidates by overall score
      const sortedCandidates = [...selectedCandidates].sort(
        (a, b) => b.overallScore - a.overallScore
      );
      
      // Generate a mock report
      const reportContent = `
# Candidate Ranking Report for ${job.title} at ${job.company}

## Executive Summary
This report provides a comprehensive analysis and ranking of ${selectedCandidates.length} candidates for the ${job.title} position at ${job.company}.

## Ranking
${sortedCandidates.map((candidate, index) => `
### ${index + 1}. ${candidate.name} (Score: ${candidate.overallScore}/10)

**Strengths:**
${candidate.strengths.map(strength => `- ${strength}`).join('\n')}

**Areas for Development:**
${candidate.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

**Overall Assessment:**
Candidate demonstrates ${candidate.overallScore >= 7 ? 'strong' : candidate.overallScore >= 5 ? 'moderate' : 'limited'} alignment with the position requirements.
`).join('\n')}

## Methodology
Candidates were evaluated against the job requirements using AI-powered resume analysis.

## Recommendations
${sortedCandidates[0] ? `We recommend moving forward with ${sortedCandidates[0].name} as the primary candidate.` : ''}
${sortedCandidates[1] ? `${sortedCandidates[1].name} would be a strong secondary choice.` : ''}

${additionalPrompt ? `## Additional Analysis (Based on Custom Prompt)
${additionalPrompt}

Response: The candidates have been evaluated with this specific focus in mind, and the rankings reflect this additional criteria.` : ''}

Report generated: ${new Date().toLocaleString()}
      `;
      
      // Create the report object
      const newReport: Report = {
        id: reportId,
        jobId,
        candidateIds,
        content: reportContent,
        createdAt: new Date().toISOString(),
        additionalPrompt,
      };
      
      // Update state
      setReports(prevReports => [...prevReports, newReport]);
      
      toast.success('Report generated successfully');
      return newReport;
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a candidate
  const deleteCandidate = async (jobId: string, candidateId: string): Promise<void> => {
    if (!currentUser) throw new Error('User must be logged in');
    
    try {
      // Find the job
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      // Filter out the candidate to delete
      const updatedCandidates = job.candidates.filter(
        candidate => candidate.id !== candidateId
      );
      
      const updatedJob = {
        ...job,
        candidates: updatedCandidates,
        updatedAt: new Date().toISOString(),
      };
      
      // Update state
      setJobs(prevJobs => prevJobs.map(j => j.id === jobId ? updatedJob : j));
      if (currentJob?.id === jobId) {
        setCurrentJob(updatedJob);
      }
      
      toast.success('Candidate deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
      throw error;
    }
  };

  const value = {
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
    starCandidate,
    generateReport,
    deleteCandidate,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
