
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save candidates to Supabase
 */
export const saveCandidates = async (jobId: string, candidates: Candidate[]): Promise<void> => {
  for (const candidate of candidates) {
    try {
      const { error } = await supabase
        .from('candidates')
        .upsert({ 
          id: candidate.id,
          job_id: jobId,
          name: candidate.name,
          resume_text: candidate.resumeUrl || '',
          file_name: candidate.name || '',
          content_type: 'text/plain',
          is_starred: candidate.isStarred || false
        });
      
      if (error) {
        console.error('Error saving candidate to Supabase:', error);
        toast.error('Failed to save candidate data');
        continue;
      }
      
      // Save candidate scores if they exist
      if (candidate.scores && candidate.scores.length > 0) {
        await saveCandidateScores(candidate.id, candidate.scores);
      }
    } catch (err) {
      console.error('Error in saveCandidates:', err);
      toast.error('Failed to save candidate');
    }
  }
};

/**
 * Save candidates to Supabase
 */
export const saveCandidatesData = async (candidates: Candidate[], jobId: string): Promise<void> => {
  for (const candidate of candidates) {
    try {
      const { error: candidateError } = await supabase
        .from('candidates')
        .upsert({ 
          id: candidate.id,
          name: candidate.name,
          is_starred: candidate.isStarred,
          job_id: jobId,
          resume_text: candidate.resumeUrl || null,
          file_name: candidate.name || null,
          content_type: 'text/plain'
        });
      
      if (candidateError) {
        console.error('Error saving candidate to Supabase:', candidateError);
        continue;
      }
      
      // Save candidate scores if they exist
      if (candidate.scores && candidate.scores.length > 0) {
        await saveCandidateScoresData(candidate.id, candidate.scores);
      }
    } catch (err) {
      console.error('Error in saveCandidatesData:', err);
    }
  }
};

/**
 * Save candidate scores to Supabase
 */
export const saveCandidateScores = async (candidateId: string, scores: any[]): Promise<void> => {
  for (const score of scores) {
    try {
      // Ensure requirement ID is a valid UUID
      const requirementId = score.requirementId;
      
      // Skip scores with invalid requirementIds to prevent foreign key violations
      if (!requirementId || !requirementId.includes('-') || requirementId.length < 36) {
        console.warn('Skipping score with invalid requirement ID:', score);
        continue;
      }
      
      // Check if the requirement exists in job_requirements_mapping
      const { data: reqData, error: reqError } = await supabase
        .from('job_requirements_mapping')
        .select('id')
        .eq('id', requirementId)
        .maybeSingle();
        
      if (reqError || !reqData) {
        console.warn(`Requirement ID ${requirementId} does not exist in job_requirements_mapping, skipping score`);
        continue;
      }
      
      // Generate a proper UUID for the score
      const scoreId = score.id || uuidv4();
      
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
      console.error('Error in saveCandidateScores:', err);
    }
  }
};

/**
 * Save candidate scores to Supabase
 */
export const saveCandidateScoresData = async (candidateId: string, scores: any[]): Promise<void> => {
  for (const score of scores) {
    try {
      // Ensure requirement ID is a valid UUID
      const requirementId = score.requirementId;
      
      // Skip scores with invalid requirementIds to prevent foreign key violations
      if (!requirementId || !requirementId.includes('-') || requirementId.length < 36) {
        console.warn('Skipping score with invalid requirement ID:', score);
        continue;
      }
      
      // Check if the requirement exists in job_requirements_mapping
      const { data: reqData, error: reqError } = await supabase
        .from('job_requirements_mapping')
        .select('id')
        .eq('id', requirementId)
        .maybeSingle();
        
      if (reqError || !reqData) {
        console.warn(`Requirement ID ${requirementId} does not exist in job_requirements_mapping, skipping score`);
        continue;
      }
      
      // Generate a proper UUID for the score
      const scoreId = score.id || uuidv4();
      
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
      console.error('Error in saveCandidateScoresData:', err);
    }
  }
};
