
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      await saveJobs(data.jobs);
    }
    
    // If reports are provided, save them
    if (data.reports && data.reports.length > 0) {
      await saveReports(data.reports);
    }
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    toast.error('Failed to save data to the database');
  }
};

/**
 * Save jobs to Supabase
 */
const saveJobs = async (jobs: Job[]): Promise<void> => {
  const currentUserId = await getUserId();
  if (!currentUserId) {
    console.error('No authenticated user found when saving jobs');
    toast.error('You must be logged in to save jobs');
    return;
  }

  for (const job of jobs) {
    // Always use the current user's ID from auth, not the one stored in the job
    // This ensures we comply with RLS policies
    
    const { error } = await supabase
      .from('jobs')
      .upsert({ 
        id: job.id,
        title: job.title || 'Untitled Job',
        company: job.company || '',
        description: job.description || '',
        location: job.location || '',
        department: job.department || '',
        salary: job.salary || null,
        user_id: currentUserId
      });
    
    if (error) {
      console.error('Error saving job to Supabase:', error);
      throw error;
    }
    
    // Save job requirements
    if (job.requirements && job.requirements.length > 0) {
      await saveJobRequirements(job.id, job.requirements);
    }
    
    // Save job candidates
    if (job.candidates && job.candidates.length > 0) {
      await saveCandidates(job.id, job.candidates);
    }
    
    // Save job context files
    if (job.contextFiles && job.contextFiles.length > 0) {
      await saveContextFiles(job.id, job.contextFiles);
    }
  }
};

/**
 * Save job requirements to Supabase
 */
const saveJobRequirements = async (jobId: string, requirements: any[]): Promise<void> => {
  for (const req of requirements) {
    const { error } = await supabase
      .from('job_requirements')
      .upsert({ 
        id: req.id,
        job_id: jobId,
        title: req.category || 'Requirement',
        description: req.description,
        weight: req.weight || 1
      });
    
    if (error) {
      console.error('Error saving job requirement to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save candidates to Supabase
 */
const saveCandidates = async (jobId: string, candidates: any[]): Promise<void> => {
  for (const candidate of candidates) {
    const { error } = await supabase
      .from('candidates')
      .upsert({ 
        id: candidate.id,
        job_id: jobId,
        name: candidate.name,
        resume_text: candidate.resumeText || '',
        file_name: candidate.fileName || '',
        content_type: candidate.contentType || '',
        is_starred: candidate.isStarred || false
      });
    
    if (error) {
      console.error('Error saving candidate to Supabase:', error);
      throw error;
    }
    
    // Save candidate scores if they exist
    if (candidate.scores && candidate.scores.length > 0) {
      await saveCandidateScores(candidate.id, candidate.scores);
    }
  }
};

/**
 * Save candidate scores to Supabase
 */
const saveCandidateScores = async (candidateId: string, scores: any[]): Promise<void> => {
  for (const score of scores) {
    const { error } = await supabase
      .from('candidate_scores')
      .upsert({ 
        id: score.id || score.requirementId + '_' + candidateId,
        candidate_id: candidateId,
        requirement_id: score.requirementId,
        score: score.score,
        explanation: score.comment || ''
      });
    
    if (error) {
      console.error('Error saving candidate score to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save context files to Supabase
 */
const saveContextFiles = async (jobId: string, files: any[]): Promise<void> => {
  for (const file of files) {
    const { error } = await supabase
      .from('job_context_files')
      .upsert({ 
        id: file.id,
        job_id: jobId,
        name: file.name,
        content: file.content
      });
    
    if (error) {
      console.error('Error saving context file to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save reports to Supabase
 */
const saveReports = async (reports: Report[]): Promise<void> => {
  for (const report of reports) {
    const { error } = await supabase
      .from('reports')
      .upsert({ 
        id: report.id,
        job_id: report.jobId,
        title: report.title,
        content: report.content
      });
    
    if (error) {
      console.error('Error saving report to Supabase:', error);
      throw error;
    }
    
    // Link candidates to report
    if (report.candidateIds && report.candidateIds.length > 0) {
      await linkCandidatesToReport(report.id, report.candidateIds);
    }
  }
};

/**
 * Link candidates to a report
 */
const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  for (const candidateId of candidateIds) {
    const { error } = await supabase
      .from('report_candidates')
      .upsert({
        report_id: reportId,
        candidate_id: candidateId
      });
    
    if (error) {
      console.error('Error linking candidate to report:', error);
      throw error;
    }
  }
};
