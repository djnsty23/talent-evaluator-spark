
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { saveJobs } from './supabase/jobOperations';
import { saveJobRequirements } from './supabase/requirementsOperations';
import { saveCandidates } from './supabase/candidateOperations';
import { saveContextFiles } from './supabase/fileOperations';
import { saveReports } from './supabase/reportOperations';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // Verify user is authenticated before attempting any saves
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.error('User not authenticated, cannot save data');
      toast.error('You must be logged in to save data');
      return;
    }
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      await saveJobs(data.jobs);
      
      // Save related entities for each job
      for (const job of data.jobs) {
        // First, ensure the job has a valid user_id
        if (!job.userId) {
          job.userId = sessionData.session.user.id;
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
