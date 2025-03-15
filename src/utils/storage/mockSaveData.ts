
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
        await saveCandidatesData(data.candidates, data.id);
      }
      
      // Save requirements if they exist
      if (data.requirements && data.requirements.length > 0) {
        await saveRequirementsData(data.requirements, data.id);
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
const saveCandidatesData = async (candidates: any[], jobId: string): Promise<void> => {
  for (const candidate of candidates) {
    const { error: candidateError } = await supabase
      .from('candidates')
      .upsert({ 
        id: candidate.id,
        name: candidate.name,
        is_starred: candidate.isStarred,
        job_id: jobId,
        resume_text: candidate.resumeText || null,
        file_name: candidate.fileName || null,
        content_type: candidate.contentType || null
      });
    
    if (candidateError) {
      console.error('Error saving candidate to Supabase:', candidateError);
    }
    
    // Save candidate scores if they exist
    if (candidate.scores && candidate.scores.length > 0) {
      await saveCandidateScoresData(candidate.id, candidate.scores);
    }
  }
};

/**
 * Save candidate scores to Supabase
 */
const saveCandidateScoresData = async (candidateId: string, scores: any[]): Promise<void> => {
  for (const score of scores) {
    const { error } = await supabase
      .from('candidate_scores')
      .upsert({ 
        id: score.id || `${score.requirementId}_${candidateId}`,
        candidate_id: candidateId,
        requirement_id: score.requirementId,
        score: score.score,
        explanation: score.comment || ''
      });
    
    if (error) {
      console.error('Error saving candidate score to Supabase:', error);
    }
  }
};

/**
 * Save requirements to Supabase
 */
const saveRequirementsData = async (requirements: any[], jobId: string): Promise<void> => {
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
  const userId = await getUserId();
  
  if (!userId) {
    throw new Error('You must be logged in to delete a job');
  }
  
  try {
    // Use the secure function to delete the job and all related data
    const { error } = await supabase
      .rpc('delete_job_cascade', { 
        p_job_id: jobId,
        p_user_id: userId
      });
      
    if (error) {
      console.error('Error deleting job from Supabase:', error);
      throw error;
    }
  } catch (err) {
    console.error('Error with delete_job_cascade function:', err);
    
    // Fallback: delete the job directly if the RPC function fails
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error with fallback job deletion:', error);
      throw error;
    }
  }
};
