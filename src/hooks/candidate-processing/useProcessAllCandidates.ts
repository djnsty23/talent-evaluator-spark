import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useJob } from '@/contexts/job/JobContext';
import { Job } from '@/types/job.types';

// Delay between API calls to avoid rate limiting
const PROCESSING_DELAY_MS = 2000; 

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
  
  // Use refs to keep track of the processing state across renders
  const processingRef = useRef(false);
  const cancelProcessingRef = useRef(false);
  
  const handleProcessAllCandidatesClick = async (e?: React.MouseEvent) => {
    // Prevent default behavior to avoid any navigation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Guard clauses to prevent multiple processing attempts
    if (!jobId || !job || isInProgress) return;
    if (processingRef.current) {
      toast.info('Processing is already in progress');
      return;
    }
    
    // Find unprocessed candidates
    const unprocessedCandidates = job.candidates.filter(c => c.scores.length === 0);
    if (unprocessedCandidates.length === 0) {
      toast.info('No candidates to process');
      return;
    }
    
    // Set processing flags and update UI state
    setIsInProgress(true);
    setIsProcessingAll(true);
    setTotalToProcess(unprocessedCandidates.length);
    setProcessedCountTracking(0);
    setErrorCount(0);
    setProcessingProgress(0);
    processingRef.current = true;
    cancelProcessingRef.current = false;
    
    try {
      // Get a copy of unprocessed candidates before we start processing
      // This will prevent issues if state updates during processing
      const candidatesToProcess = [...unprocessedCandidates];
      let processedCount = 0;
      let errors = 0;
      
      // Process candidates one by one with delay
      for (let i = 0; i < candidatesToProcess.length; i++) {
        // Check if processing was cancelled
        if (cancelProcessingRef.current) {
          console.log('Processing cancelled by user');
          break;
        }
        
        const candidate = candidatesToProcess[i];
        setCurrentProcessing(candidate.name);
        
        try {
          // Calculate and update progress - ensure it's never over 100%
          const progress = Math.min(Math.round((i / candidatesToProcess.length) * 100), 99);
          setProcessingProgress(progress);
          
          console.log(`Processing candidate ${i+1}/${candidatesToProcess.length}: ${candidate.name}`);
          
          // Process the candidate
          await new Promise<void>((resolve, reject) => {
            // Get the current state of the job data
            const currentJob = jobs.find(j => j.id === jobId);
            if (!currentJob) {
              reject(new Error('Job not found'));
              return;
            }
            
            // Find the candidate again in the updated job to ensure we have latest state
            const updatedCandidate = currentJob.candidates.find(c => c.id === candidate.id);
            if (!updatedCandidate) {
              reject(new Error(`Candidate ${candidate.name} not found`));
              return;
            }
            
            // Skip if already processed
            if (updatedCandidate.scores && updatedCandidate.scores.length > 0) {
              console.log(`Candidate ${candidate.name} already processed, skipping`);
              resolve();
              return;
            }
            
            // Process the candidate
            handleProcessAllCandidates(jobId)
              .then(() => {
                console.log(`Successfully processed candidate: ${candidate.name}`);
                resolve();
              })
              .catch(err => {
                console.error(`Error processing candidate ${candidate.name}:`, err);
                reject(err);
              });
          });
          
          // Increment processed count and update state
          processedCount++;
          setProcessedCountTracking(prev => {
            // Ensure we don't set it to a lower value than it already is
            return Math.max(prev, processedCount);
          });
          
          // Add delay between candidates only if we're not on the last one
          if (i < candidatesToProcess.length - 1 && !cancelProcessingRef.current) {
            console.log(`Waiting ${PROCESSING_DELAY_MS}ms before processing next candidate`);
            await delay(PROCESSING_DELAY_MS);
          }
        } catch (error) {
          console.error(`Error processing candidate ${candidate.name}:`, error);
          errors++;
          setErrorCount(errors);
          
          // Small delay before continuing to next candidate
          await delay(PROCESSING_DELAY_MS);
        }
      }
      
      // Final progress update - only set to 100% if we actually finished all candidates
      if (!cancelProcessingRef.current && processedCount === candidatesToProcess.length) {
        setProcessingProgress(100);
      }
      
      // Show appropriate success or error message
      if (processedCount > 0) {
        if (cancelProcessingRef.current) {
          toast.info(`Processing cancelled after completing ${processedCount} of ${candidatesToProcess.length} candidates`);
        } else if (errors === 0) {
          toast.success(`Successfully processed ${processedCount} candidates`);
        } else {
          toast.warning(`Processed ${processedCount} candidates with ${errors} errors`);
        }
        
        // Show post-processing CTA if we processed some candidates successfully
        setShowPostProcessCTA(true);
      } else {
        toast.error('Failed to process any candidates');
      }
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('Error processing candidates');
    } finally {
      // Always reset all state flags to ensure UI is responsive again
      setIsProcessingAll(false);
      setCurrentProcessing(null);
      setIsInProgress(false);
      processingRef.current = false;
      
      // Small delay before final cleanup to ensure UI updates properly
      await delay(100);
    }
  };

  // Function to cancel ongoing processing
  const cancelProcessing = () => {
    if (processingRef.current) {
      console.log('Cancelling candidate processing');
      cancelProcessingRef.current = true;
      toast.info('Cancelling processing after current candidate completes');
    }
  };

  return { 
    handleProcessAllCandidatesClick,
    cancelProcessing,
    isProcessing: processingRef.current
  };
}
