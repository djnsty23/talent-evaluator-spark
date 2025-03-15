
import { supabase } from '@/integrations/supabase/client';

/**
 * Link candidates to a report
 */
export const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  try {
    if (!reportId || !candidateIds.length) {
      console.warn('Cannot link candidates: missing report ID or candidate IDs');
      return;
    }
    
    // Clear existing links first to avoid duplicates
    try {
      await supabase
        .from('report_candidates')
        .delete()
        .eq('report_id', reportId);
    } catch (clearError) {
      console.error('Error clearing existing candidate links:', clearError);
    }
    
    let successCount = 0;
    
    for (const candidateId of candidateIds) {
      try {
        const { error } = await supabase.from('report_candidates').insert({
          report_id: reportId,
          candidate_id: candidateId
        });
        
        if (error) {
          console.error('Error linking candidate to report:', error);
        } else {
          successCount++;
        }
      } catch (linkError) {
        console.error('Exception linking candidate to report:', linkError);
        // Continue with next candidate
      }
    }
    
    console.log(`Linked ${successCount}/${candidateIds.length} candidates to report ${reportId}`);
  } catch (error) {
    console.error('Error in linkCandidatesToReport:', error);
    // Don't throw, just log the error
  }
};
