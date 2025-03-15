
import { supabase } from '@/integrations/supabase/client';
import { getUserId } from '@/utils/authUtils';
import { toast } from 'sonner';

/**
 * Save a single entity to Supabase
 */
export const mockSaveData = async (data: any): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If we're saving a job
    if (data.id && (data.title || data.candidates)) {
      await saveJobData(data);
      
      // Save candidates if they exist
      if (data.candidates && data.candidates.length > 0) {
        await saveCandidates(data.candidates, data.id);
      }
    }
    
    // If we're saving a report
    if (data.id && data.candidateIds) {
      await saveReportData(data);
    }
    
    // If we're deleting a job
    if (data.id && data.deleted) {
      await deleteJob(data.id);
    }
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    // Don't throw, just log the error and show a toast
    toast.error('Failed to save data');
  }
};

/**
 * Save job data to Supabase
 */
const saveJobData = async (data: any): Promise<void> => {
  try {
    // Get the current authenticated user ID
    const currentUserId = await getUserId();
    
    if (!currentUserId) {
      console.error('No authenticated user found when saving job');
      toast.error('You must be logged in to save jobs');
      return;
    }

    const { error } = await supabase
      .from('jobs')
      .upsert({ 
        id: data.id,
        title: data.title || 'Untitled Job',
        company: data.company || '',
        description: data.description || '',
        location: data.location || '',
        department: data.department || '',
        salary: data.salary || null,
        user_id: currentUserId // Use the current user ID from auth
      });
    
    if (error) {
      console.error('Error saving job to Supabase:', error);
      toast.error('Failed to save job details');
    }
  } catch (error) {
    console.error('Exception saving job:', error);
  }
};

/**
 * Save candidates to Supabase
 */
const saveCandidates = async (candidates: any[], jobId: string): Promise<void> => {
  let savedCount = 0;
  let errorCount = 0;
  
  for (const candidate of candidates) {
    try {
      const { error: candidateError } = await supabase
        .from('candidates')
        .upsert({ 
          id: candidate.id,
          name: candidate.name,
          is_starred: candidate.isStarred,
          job_id: jobId
          // Add other fields as needed
        });
      
      if (candidateError) {
        console.error('Error saving candidate to Supabase:', candidateError);
        errorCount++;
      } else {
        savedCount++;
      }
    } catch (error) {
      console.error('Exception saving candidate:', error);
      errorCount++;
    }
  }
  
  console.log(`Saved ${savedCount}/${candidates.length} candidates to Supabase`);
};

/**
 * Save report data to Supabase
 */
const saveReportData = async (data: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reports')
      .upsert({ 
        id: data.id,
        title: data.title || 'Candidate Report',
        content: data.content,
        job_id: data.jobId
      });
    
    if (error) {
      console.error('Error saving report to Supabase:', error);
      throw error;
    }
    
    // Link candidates to report
    await linkCandidatesToReport(data.id, data.candidateIds);
  } catch (error) {
    console.error('Exception saving report:', error);
    toast.error('Failed to save report');
  }
};

/**
 * Link candidates to a report
 */
const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  let linkedCount = 0;
  
  for (const candidateId of candidateIds) {
    try {
      const { error: linkError } = await supabase
        .from('report_candidates')
        .upsert({
          report_id: reportId,
          candidate_id: candidateId
        });
      
      if (linkError) {
        console.error('Error linking candidate to report:', linkError);
      } else {
        linkedCount++;
      }
    } catch (error) {
      console.error('Exception linking candidate to report:', error);
    }
  }
  
  console.log(`Linked ${linkedCount}/${candidateIds.length} candidates to report ${reportId}`);
};

/**
 * Delete a job from Supabase
 */
const deleteJob = async (jobId: string): Promise<void> => {
  try {
    // First clean up any reports associated with this job
    try {
      // Get all reports for this job
      const { data: reports } = await supabase
        .from('reports')
        .select('id')
        .eq('job_id', jobId);
      
      if (reports && reports.length > 0) {
        // Delete candidate-report links
        for (const report of reports) {
          await supabase
            .from('report_candidates')
            .delete()
            .eq('report_id', report.id);
        }
        
        // Delete reports
        await supabase
          .from('reports')
          .delete()
          .eq('job_id', jobId);
      }
    } catch (error) {
      console.error('Error cleaning up reports during job deletion:', error);
      // Continue with deletion
    }
    
    // Delete candidates
    try {
      await supabase
        .from('candidates')
        .delete()
        .eq('job_id', jobId);
    } catch (error) {
      console.error('Error deleting candidates during job deletion:', error);
      // Continue with deletion
    }
    
    // Delete the job
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);
    
    if (error) {
      console.error('Error deleting job from Supabase:', error);
      toast.error('Failed to delete job from database');
      throw error;
    }
  } catch (error) {
    console.error('Exception deleting job:', error);
    toast.error('Failed to delete job');
  }
};
