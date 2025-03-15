
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { saveJobs } from './supabase/jobOperations';
import { saveJobRequirements } from './supabase/requirementsOperations';
import { saveCandidates } from './supabase/candidateOperations';
import { saveContextFiles } from './supabase/fileOperations';
import { saveReports } from './supabase/reportOperations';
import { supabase } from '@/integrations/supabase/client';
import { getUserId } from '@/utils/authUtils';

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // Verify user is authenticated before attempting any saves
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save data');
      toast.error('You must be logged in to save data');
      return;
    }
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      try {
        // Ensure all jobs have the current user's ID
        const jobsWithUserId = data.jobs.map(job => ({
          ...job,
          userId: currentUserId
        }));
        
        await saveJobs(jobsWithUserId);
        
        // Save related entities for each job
        for (const job of jobsWithUserId) {
          // Save job requirements
          if (job.requirements && job.requirements.length > 0) {
            try {
              await saveJobRequirements(job.id, job.requirements);
            } catch (reqError) {
              console.error('Error saving job requirements:', reqError);
              // Continue with other saves even if requirements fail
            }
          }
          
          // Save job candidates
          if (job.candidates && job.candidates.length > 0) {
            try {
              await saveCandidates(job.id, job.candidates);
            } catch (candError) {
              console.error('Error saving candidates:', candError);
              // Continue with other saves even if candidates fail
            }
          }
          
          // Save job context files
          if (job.contextFiles && job.contextFiles.length > 0) {
            try {
              await saveContextFiles(job.id, job.contextFiles);
            } catch (fileError) {
              console.error('Error saving context files:', fileError);
              // Continue with other saves even if files fail
            }
          }
        }
      } catch (jobError) {
        console.error('Error saving jobs:', jobError);
        toast.error('Failed to save job data');
      }
    }
    
    // If reports are provided, save them
    if (data.reports && data.reports.length > 0) {
      try {
        await saveReports(data.reports);
      } catch (reportError) {
        console.error('Error saving reports:', reportError);
        toast.error('Failed to save reports');
      }
    }
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    toast.error('Failed to save data to the database');
  }
};
