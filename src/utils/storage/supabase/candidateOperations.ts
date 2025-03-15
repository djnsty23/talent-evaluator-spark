
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save candidates to Supabase
 */
export const saveCandidates = async (jobId: string, candidates: Candidate[]): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save candidates');
      toast.error('You must be logged in to save candidates');
      return;
    }

    // Verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('user_id', currentUserId)
      .maybeSingle();

    if (jobError || !jobData) {
      console.error('Job not found or does not belong to current user:', jobError);
      toast.error('Cannot save candidates: Job not found or access denied');
      return;
    }

    for (const candidate of candidates) {
      try {
        // Ensure candidate has a valid UUID
        const candidateId = candidate.id && candidate.id.includes('-') && candidate.id.length >= 36 
          ? candidate.id 
          : uuidv4();

        const { error } = await supabase
          .from('candidates')
          .upsert({ 
            id: candidateId,
            job_id: jobId,
            name: candidate.name || 'Unnamed Candidate',
            resume_text: candidate.resumeUrl || '',
            file_name: candidate.name || '',
            content_type: 'text/plain',
            is_starred: candidate.isStarred || false
          });
        
        if (error) {
          console.error('Error saving candidate to Supabase:', error);
          toast.error(`Failed to save candidate: ${candidate.name}`);
          continue;
        }
        
        // Save candidate scores if they exist
        if (candidate.scores && candidate.scores.length > 0) {
          await saveCandidateScores(candidateId, candidate.scores);
        }
      } catch (err) {
        console.error('Error processing candidate:', err);
        toast.error(`Failed to process candidate: ${candidate.name || 'Unknown'}`);
      }
    }
    
    toast.success('Candidates saved successfully');
  } catch (err) {
    console.error('Error in saveCandidates:', err);
    toast.error('Failed to save candidates');
  }
};

/**
 * Legacy method - use saveCandidates instead
 */
export const saveCandidatesData = async (candidates: Candidate[], jobId: string): Promise<void> => {
  await saveCandidates(jobId, candidates);
};

/**
 * Save candidate scores to Supabase
 */
export const saveCandidateScores = async (candidateId: string, scores: any[]): Promise<void> => {
  try {
    for (const score of scores) {
      try {
        // Skip scores without a requirementId
        if (!score.requirementId) {
          console.warn('Skipping score without requirementId:', score);
          continue;
        }
        
        // If the requirementId doesn't look like a UUID, we need to convert it
        let requirementId = score.requirementId;
        
        // If it's not a UUID format, we need to create requirement record first
        if (!requirementId.includes('-') || requirementId.length < 36) {
          console.warn(`Converting non-UUID requirementId: ${requirementId} to UUID format`);
          
          // Create a proper UUID for this requirement
          requirementId = uuidv4();
          
          // Since we need a valid job_id to link this requirement, we need to get the job_id for this candidate
          const { data: candidateData, error: candidateError } = await supabase
            .from('candidates')
            .select('job_id')
            .eq('id', candidateId)
            .single();
            
          if (candidateError || !candidateData) {
            console.error('Cannot get job_id for candidate:', candidateError);
            continue;
          }
          
          // Create the requirement mapping first (needed for foreign key constraint)
          const { error: mappingError } = await supabase
            .from('job_requirements_mapping')
            .upsert({
              id: requirementId,
              job_id: candidateData.job_id,
              description: score.comment || 'Auto-generated requirement',
              original_id: requirementId,
              weight: 5 // default middle weight
            });
            
          if (mappingError) {
            console.error('Error creating requirement mapping:', mappingError);
            continue;
          }
        } else {
          // Verify the requirement exists before trying to link a score to it
          const { data, error } = await supabase
            .from('job_requirements_mapping')
            .select('id')
            .eq('id', requirementId)
            .maybeSingle();
            
          if (error || !data) {
            console.warn(`Requirement ${requirementId} does not exist, skipping score`);
            continue;
          }
        }
        
        // Generate a proper UUID for the score
        const scoreId = score.id && score.id.includes('-') && score.id.length >= 36 ? score.id : uuidv4();
        
        const { error } = await supabase
          .from('candidate_scores')
          .upsert({ 
            id: scoreId,
            candidate_id: candidateId,
            requirement_id: requirementId,
            score: score.score,
            explanation: score.comment || ''
          });
        
        if (error) {
          console.error('Error saving candidate score to Supabase:', error);
        }
      } catch (err) {
        console.error('Error processing score:', err);
      }
    }
  } catch (err) {
    console.error('Error in saveCandidateScores:', err);
  }
};

/**
 * Legacy method - use saveCandidateScores instead
 */
export const saveCandidateScoresData = async (candidateId: string, scores: any[]): Promise<void> => {
  await saveCandidateScores(candidateId, scores);
};
