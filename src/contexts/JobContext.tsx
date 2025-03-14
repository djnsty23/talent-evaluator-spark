
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
  education?: string;
  yearsOfExperience?: number;
  location?: string;
  skillKeywords?: string[];
  availabilityDate?: string;
  communicationStyle?: string;
  preferredTools?: string[];
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
      // Save to localStorage
      try {
        // Get current data from localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        let currentData = savedData ? JSON.parse(savedData) : { jobs: [], reports: [] };
        
        // If we're saving a job
        if (data.id && (data.title || data.candidates)) {
          // Find if job already exists
          const jobIndex = currentData.jobs.findIndex((j: Job) => j.id === data.id);
          
          if (jobIndex >= 0) {
            // Update existing job
            currentData.jobs[jobIndex] = data;
          } else {
            // Add new job
            currentData.jobs.push(data);
          }
        }
        
        // If we're saving a report
        if (data.id && data.candidateIds) {
          // Find if report already exists
          const reportIndex = currentData.reports.findIndex((r: Report) => r.id === data.id);
          
          if (reportIndex >= 0) {
            // Update existing report
            currentData.reports[reportIndex] = data;
          } else {
            // Add new report
            currentData.reports.push(data);
          }
        }
        
        // If we're deleting a job
        if (data.id && data.deleted) {
          currentData.jobs = currentData.jobs.filter((j: Job) => j.id !== data.id);
        }
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        console.log('Data saved to localStorage:', currentData);
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }
      
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
  setCurrentJob: (job: Job | null) => void;
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
          console.log('Loading data from localStorage:', parsedData);
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
      console.log('Saving data to localStorage:', { jobs, reports });
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

  // Improved function to extract candidate name from resume
  const extractCandidateName = (fileName: string): string => {
    // Remove file extension
    let candidateName = fileName.split('.').slice(0, -1).join('.');
    
    // Replace underscores, hyphens, and numbers with spaces
    candidateName = candidateName
      .replace(/[_-]/g, ' ')
      .replace(/\d+/g, ' ')
      .replace(/\s+/g, ' ');
    
    // Remove common prefixes like "CV", "Resume", etc.
    candidateName = candidateName
      .replace(/^(cv|resume|résumé|curriculu?m\s*vitae)[\s_-]*/i, '')
      .trim();
    
    // Process name to ensure proper capitalization
    candidateName = candidateName
      .split(' ')
      .map(part => {
        // Skip empty parts
        if (!part) return '';
        // Capitalize first letter of each word
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .filter(Boolean) // Remove empty parts
      .join(' ');
    
    return candidateName || 'Unnamed Candidate';
  };

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
        // Extract and format candidate name
        const candidateName = extractCandidateName(file.name);
        
        // Generate a random domain for the email based on candidate's name
        const nameParts = candidateName.split(' ');
        const firstName = nameParts[0].toLowerCase();
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
        const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'proton.me'];
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        
        // Create email with firstName.lastName@domain.com format
        const email = lastName 
          ? `${firstName}.${lastName}@${randomDomain}`
          : `${firstName}${Math.floor(Math.random() * 1000)}@${randomDomain}`;
        
        return {
          id: `candidate_${Date.now()}_${index}`,
          name: candidateName,
          email: email,
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
          leadershipPotential: 0,
          education: '',
          yearsOfExperience: 0,
          location: '',
          skillKeywords: [],
          communicationStyle: '',
          preferredTools: []
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

  // Process a single candidate with more enhanced attributes
  const processCandidate = useCallback(async (jobId: string, candidateId: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Find the job and candidate
      const job = jobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      const candidateIndex = job.candidates.findIndex(c => c.id === candidateId);
      if (candidateIndex === -1) throw new Error('Candidate not found');
      
      // Get the candidate to process
      const processedCandidate = { ...job.candidates[candidateIndex] };
      
      // Generate scores for each requirement
      const scores = job.requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1, // Random score 1-10
        comment: generateComment(req.description),
      }));
      
      // Calculate overall score (weighted average)
      const totalWeight = job.requirements.reduce((sum, req) => sum + req.weight, 0);
      const weightedScore = job.requirements.reduce((sum, req, index) => {
        const score = scores[index]?.score || 0;
        return sum + (score * req.weight);
      }, 0);
      
      const overallScore = totalWeight > 0 
        ? Math.round((weightedScore / totalWeight) * 10) / 10 
        : 0;
      
      // Generate enhanced candidate data
      const workStyles = ['Remote', 'Hybrid', 'Office', 'Flexible'];
      const zodiacSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
      const personalityTraits = ['Analytical', 'Detail-oriented', 'Team player', 'Self-motivated', 'Creative', 'Problem-solver', 'Results-oriented', 'Adaptable', 'Strategic thinker'];
      const communicationStyles = ['Direct', 'Collaborative', 'Diplomatic', 'Expressive', 'Analytical', 'Concise'];
      const toolsAndPlatforms = ['Microsoft Office', 'Google Workspace', 'Slack', 'Zoom', 'Trello', 'Asana', 'Jira', 'Salesforce', 'HubSpot', 'Adobe Creative Suite'];
      const educationLevels = ['Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'MBA', 'Associate Degree', 'High School Diploma', 'Professional Certification'];
      const locations = ['New York', 'San Francisco', 'Chicago', 'London', 'Toronto', 'Berlin', 'Remote - US', 'Remote - Europe'];
      
      // Generate strengths and weaknesses based on scores
      const highScoringRequirements = job.requirements.filter((req, index) => scores[index].score >= 8);
      const lowScoringRequirements = job.requirements.filter((req, index) => scores[index].score <= 4);
      
      const strengths = highScoringRequirements.length > 0 
        ? highScoringRequirements.map(req => req.description).slice(0, 3)
        : ['Communication skills', 'Problem-solving ability', 'Technical expertise'].slice(0, Math.floor(Math.random() * 3) + 1);
      
      const weaknesses = lowScoringRequirements.length > 0 
        ? lowScoringRequirements.map(req => req.description).slice(0, 3)
        : ['Limited experience', 'Needs mentoring', 'May require additional training'].slice(0, Math.floor(Math.random() * 3) + 1);
      
      // Get random items from arrays
      const getRandomItems = (arr: string[], count: number) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
      };
      
      // Update the candidate with enhanced data
      processedCandidate.scores = scores;
      processedCandidate.overallScore = overallScore;
      processedCandidate.strengths = strengths;
      processedCandidate.weaknesses = weaknesses;
      processedCandidate.processedAt = new Date().toISOString();
      processedCandidate.personalityTraits = getRandomItems(personalityTraits, Math.floor(Math.random() * 3) + 1);
      processedCandidate.zodiacSign = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];
      processedCandidate.workStyle = workStyles[Math.floor(Math.random() * workStyles.length)];
      processedCandidate.cultureFit = Math.floor(Math.random() * 10) + 1;
      processedCandidate.leadershipPotential = Math.floor(Math.random() * 10) + 1;
      processedCandidate.education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
      processedCandidate.yearsOfExperience = Math.floor(Math.random() * 15) + 1;
      processedCandidate.location = locations[Math.floor(Math.random() * locations.length)];
      processedCandidate.skillKeywords = getRandomItems(['JavaScript', 'Python', 'SQL', 'Communication', 'Project Management', 'Marketing', 'Sales', 'Customer Service', 'Leadership'], Math.floor(Math.random() * 5) + 1);
      processedCandidate.availabilityDate = new Date(Date.now() + (Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]; // Random date in the next 30 days
      processedCandidate.communicationStyle = communicationStyles[Math.floor(Math.random() * communicationStyles.length)];
      processedCandidate.preferredTools = getRandomItems(toolsAndPlatforms, Math.floor(Math.random() * 3) + 1);
      
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

  // Helper function to generate evaluation comments
  const generateComment = (requirementDescription: string): string => {
    const positiveComments = [
      `Candidate demonstrates strong skills in ${requirementDescription.toLowerCase()}.`,
      `Excellent background in ${requirementDescription.toLowerCase()}.`,
      `Candidate's experience closely aligns with ${requirementDescription.toLowerCase()}.`
    ];
    
    const negativeComments = [
      `Candidate shows limited experience with ${requirementDescription.toLowerCase()}.`,
      `Could benefit from more training in ${requirementDescription.toLowerCase()}.`,
      `Resume lacks clear evidence of ${requirementDescription.toLowerCase()}.`
    ];
    
    const neutralComments = [
      `Candidate has some experience with ${requirementDescription.toLowerCase()}.`,
      `Moderate skills demonstrated in ${requirementDescription.toLowerCase()}.`,
      `Some background in ${requirementDescription.toLowerCase()}, but could be strengthened.`
    ];
    
    // Randomly select comment type
    const commentType = Math.floor(Math.random() * 3);
    if (commentType === 0) {
      return positiveComments[Math.floor(Math.random() * positiveComments.length)];
    } else if (commentType === 1) {
      return negativeComments[Math.floor(Math.random() * negativeComments.length)];
    } else {
      return neutralComments[Math.floor(Math.random() * neutralComments.length)];
    }
  };

  // Fixed: Process all unprocessed candidates
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
      
      if (unprocessedCandidates.length === 0) return;
      
      // Process each candidate sequentially to avoid race conditions
      for (const candidate of unprocessedCandidates) {
        console.log(`Processing candidate: ${candidate.name} (${candidate.id})`);
        await processCandidate(jobId, candidate.id);
      }
      
      toast.success(`Successfully processed ${unprocessedCandidates.length} candidates`);
      
    } catch (err) {
      console.error('Error in handleProcessAllCandidates:', err);
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
