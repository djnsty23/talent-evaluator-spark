import { Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save candidates to Supabase
 */
export const saveCandidates = async (jobId: string, candidates: Candidate[]): Promise<void> => {
  for (const candidate of candidates) {
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
      throw error;
    }
    
    // Save candidate scores if they exist
    if (candidate.scores && candidate.scores.length > 0) {
      await saveCandidateScores(candidate.id, candidate.scores);
    }
  }
};

/**
 * Save candidates to Supabase
 */
export const saveCandidatesData = async (candidates: Candidate[], jobId: string): Promise<void> => {
  for (const candidate of candidates) {
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
export const saveCandidateScores = async (candidateId: string, scores: any[]): Promise<void> => {
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
 * Save candidate scores to Supabase
 */
export const saveCandidateScoresData = async (candidateId: string, scores: any[]): Promise<void> => {
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
