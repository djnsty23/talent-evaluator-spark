
import { useState } from 'react';
import { toast } from 'sonner';
import { useJob } from '@/contexts/job/JobContext';
import { Job } from '@/types/job.types';

// Delay between API calls to avoid rate limiting
const PROCESSING_DELAY_MS = 1500; 

// Helper function to introduce a delay between processing requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useProcessAllCandidates(
  jobId: string | undefined,
  job: Job | null,
  setIsProcessingAll: React.Dispatch<React.SetStateAction<boolean>>,
  setTotalToProcess: React.Dispatch<React.SetStateAction<number>>,
  setProcessedCountTracking: React.Dispatch<React.SetStateAction<number>>,
  setErrorCount: React.Dispatch<React.SetStateAction<number>>,
  setProcessingProgress: React.Dispatch<React.SetStateAction<number>>,
  setShowPostProcessCTA: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentProcessing: React.Dispatch<React.SetStateAction<string | null>>
) {
  const { handleProcessAllCandidates, jobs } = useJob();
  const [isInProgress, setIsInProgress] = useState(false);
  
  const handleProcessAllCandidatesClick = async (e?: React.MouseEvent) => {
    // Prevent default behavior to avoid any navigation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!jobId || !job || isInProgress) return;
    
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info('No candidates to process');
      return;
    }
    
    setIsInProgress(true);
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessedCountTracking(0);
    setErrorCount(0);
    setProcessingProgress(0);
    
    try {
      // Get a copy of unprocessed candidates before we start processing
      // This will prevent issues if state updates during processing
      const candidatesToProcess = [...unprocessedCandidates];
      let processedCount = 0;
      let errors = 0;
      
      // Process candidates one by one with delay
      for (let i = 0; i < candidatesToProcess.length; i++) {
        const candidate = candidatesToProcess[i];
        setCurrentProcessing(candidate.name);
        
        try {
          // Calculate and update progress
          const progress = Math.round((i / candidatesToProcess.length) * 100);
          setProcessingProgress(progress);
          
          // Process the candidate
          await new Promise<void>((resolve, reject) => {
            // Call the context function to process the candidate
            const currentJob = jobs.find(j => j.id === jobId);
            if (!currentJob) {
              reject(new Error('Job not found'));
              return;
            }
            
            // Find the candidate again in the updated job to ensure we have latest state
            const updatedCandidate = currentJob.candidates.find(c => c.id === candidate.id);
            if (!updatedCandidate) {
              reject(new Error('Candidate not found'));
              return;
            }
            
            // Skip if already processed
            if (updatedCandidate.scores && updatedCandidate.scores.length > 0) {
              resolve();
              return;
            }
            
            // Process the candidate
            handleProcessAllCandidates(jobId)
              .then(() => resolve())
              .catch(err => reject(err));
          });
          
          // Increment processed count
          processedCount++;
          setProcessedCountTracking(processedCount);
          
          // Add delay between candidates
          if (i < candidatesToProcess.length - 1) {
            await delay(PROCESSING_DELAY_MS);
          }
        } catch (error) {
          console.error(`Error processing candidate ${candidate.name}:`, error);
          errors++;
          setErrorCount(errors);
          
          // Add delay before continuing to next candidate
          await delay(PROCESSING_DELAY_MS);
        }
      }
      
      // Final progress update
      setProcessingProgress(100);
      
      // Show appropriate success or error message
      if (processedCount > 0) {
        if (errors === 0) {
          toast.success(`Successfully processed ${processedCount} candidates`);
        } else {
          toast.warning(`Processed ${processedCount} candidates with ${errors} errors`);
        }
        
        // Show post-processing CTA
        setShowPostProcessCTA(true);
      } else {
        toast.error('Failed to process any candidates');
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('Error processing candidates');
    } finally {
      setIsProcessingAll(false);
      setCurrentProcessing(null);
      setIsInProgress(false);
    }
  };

  return { handleProcessAllCandidatesClick };
}
