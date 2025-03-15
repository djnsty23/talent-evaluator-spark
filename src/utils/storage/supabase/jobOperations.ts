import { Job } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save jobs to Supabase
 */
export const saveJobs = async (jobs: Job[]): Promise<void> => {
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
  }
};

/**
 * Save a single job to Supabase
 */
export const saveJobData = async (data: any): Promise<void> => {
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
 * Delete a job from Supabase
 */
export const deleteJob = async (jobId: string): Promise<void> => {
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

/**
 * Get a job by ID from Supabase, including its candidates and requirements
 */
export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      console.error('No authenticated user found when fetching job');
      throw new Error('You must be logged in to fetch job data');
    }
    
    // First get the job data
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();
      
    if (jobError || !jobData) {
      console.error('Error fetching job from Supabase:', jobError);
      return null;
    }
    
    // Get the job requirements
    const { data: requirementsData, error: requirementsError } = await supabase
      .from('job_requirements_mapping')
      .select('*')
      .eq('job_id', jobId);
      
    if (requirementsError) {
      console.error('Error fetching job requirements from Supabase:', requirementsError);
    }
    
    // Get the candidates
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId);
      
    if (candidatesError) {
      console.error('Error fetching candidates from Supabase:', candidatesError);
    }
    
    // Get candidate scores for all candidates
    const { data: scoresData, error: scoresError } = await supabase
      .from('candidate_scores')
      .select('*')
      .in('candidate_id', (candidatesData || []).map(c => c.id));
      
    if (scoresError) {
      console.error('Error fetching candidate scores from Supabase:', scoresError);
    }
    
    // Map scores to candidates
    const candidatesWithScores = (candidatesData || []).map(candidate => {
      const candidateScores = (scoresData || []).filter(score => score.candidate_id === candidate.id);
      
      return {
        id: candidate.id,
        name: candidate.name || 'Unnamed Candidate',
        resumeUrl: candidate.resume_text || '',
        isStarred: candidate.is_starred || false,
        processedAt: candidate.created_at || new Date().toISOString(),
        scores: candidateScores.map(score => ({
          requirementId: score.requirement_id,
          score: score.score,
          comment: score.explanation || ''
        })),
        strengths: [],
        weaknesses: [],
        overallScore: candidateScores.length > 0 
          ? Math.round(candidateScores.reduce((sum, s) => sum + s.score, 0) / candidateScores.length * 10) / 10
          : 0
      };
    });
    
    // Construct the full job object
    const job: Job = {
      id: jobData.id,
      title: jobData.title || 'Untitled Job',
      company: jobData.company || '',
      description: jobData.description || '',
      location: jobData.location || '',
      department: jobData.department || '',
      salary: jobData.salary || null,
      createdAt: jobData.created_at || new Date().toISOString(),
      updatedAt: jobData.updated_at || new Date().toISOString(),
      requirements: (requirementsData || []).map(req => ({
        id: req.id,
        original_id: req.original_id || req.id,
        category: req.category || '',
        description: req.description || '',
        weight: req.weight || 5,
        isRequired: req.is_required || false
      })),
      candidates: candidatesWithScores
    };
    
    return job;
  } catch (err) {
    console.error('Error in getJobById:', err);
    return null;
  }
};
