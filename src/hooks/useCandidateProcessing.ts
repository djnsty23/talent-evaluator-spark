
import { Job } from '@/contexts/JobContext';
import { useCandidateProcessing as useProcessingHook } from './candidate-processing';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  // Use the new modular implementation
  return useProcessingHook(jobId, job);
}
