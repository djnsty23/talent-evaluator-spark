
import { supabase } from '@/integrations/supabase/client';
import { getUserId } from '@/utils/authUtils';

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
    throw err;
  }
};

/**
 * Save job data to Supabase
 */
const saveJobData = async (data: any): Promise<void> => {
  // Get the current authenticated user ID
  const currentUserId = await getUserId();
  
  if (!currentUserId) {
    console.error('No authenticated user found when saving job');
    throw new Error('You must be logged in to save jobs');
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
    throw error;
  }
};

/**
 * Save candidates to Supabase
 */
const saveCandidates = async (candidates: any[], jobId: string): Promise<void> => {
  for (const candidate of candidates) {
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
    }
  }
};

/**
 * Save report data to Supabase
 */
const saveReportData = async (data: any): Promise<void> => {
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
};

/**
 * Link candidates to a report
 */
const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  for (const candidateId of candidateIds) {
    const { error: linkError } = await supabase
      .from('report_candidates')
      .upsert({
        report_id: reportId,
        candidate_id: candidateId
      });
    
    if (linkError) {
      console.error('Error linking candidate to report:', linkError);
    }
  }
};

/**
 * Delete a job from Supabase
 */
const deleteJob = async (jobId: string): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);
  
  if (error) {
    console.error('Error deleting job from Supabase:', error);
    throw error;
  }
};
