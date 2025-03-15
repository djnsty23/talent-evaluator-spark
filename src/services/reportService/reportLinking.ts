
import { supabase } from '@/integrations/supabase/client';

/**
 * Link candidates to a report in the database
 */
export const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  if (!reportId || !candidateIds || candidateIds.length === 0) {
    console.warn('Invalid report ID or candidate IDs for linking');
    return;
  }
  
  try {
    // Create an array of objects for batch insert
    const candidateLinks = candidateIds.map(candidateId => ({
      report_id: reportId,
      candidate_id: candidateId
    }));
    
    // Insert the links into the report_candidates table
    const { error } = await supabase
      .from('report_candidates')
      .insert(candidateLinks);
    
    if (error) {
      console.error('Error linking candidates to report:', error);
      throw new Error(`Failed to link candidates to report: ${error.message}`);
    }
    
    console.log(`Linked ${candidateIds.length}/${candidateIds.length} candidates to report ${reportId}`);
  } catch (error) {
    console.error('Exception linking candidates to report:', error);
    // We don't throw here to prevent blocking the report generation flow
  }
};

/**
 * Get candidate IDs linked to a report
 */
export const getCandidateIdsForReport = async (reportId: string): Promise<string[]> => {
  if (!reportId) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('report_candidates')
      .select('candidate_id')
      .eq('report_id', reportId);
    
    if (error) {
      console.error('Error fetching candidate IDs for report:', error);
      return [];
    }
    
    return data.map(row => row.candidate_id);
  } catch (error) {
    console.error('Exception fetching candidate IDs for report:', error);
    return [];
  }
};
