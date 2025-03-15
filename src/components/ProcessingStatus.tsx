
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  isProcessingAll: boolean;
  processingProgress: number;
  currentProcessing: string;
  totalToProcess: number;
  processedCount?: number;
  errorCount?: number;
}

const ProcessingStatus = ({
  isProcessingAll,
  processingProgress,
  currentProcessing,
  totalToProcess,
  processedCount = 0,
  errorCount = 0
}: ProcessingStatusProps) => {
  if (!isProcessingAll) return null;
  
  return (
    <div className="p-3 px-4 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 w-full max-w-xl animate-in fade-in mb-4">
      <div className="flex items-center mb-2">
        <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin mr-2" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          {processingProgress < 100 
            ? `Processing candidates (${processedCount}/${totalToProcess})`
            : `Processing complete (${processedCount}/${totalToProcess})`
          }
        </span>
      </div>
      
      <Progress value={processingProgress} className="h-2 mb-2" />
      
      <div className="flex justify-between items-center text-xs text-blue-600 dark:text-blue-400">
        <span>
          {processingProgress < 100 
            ? currentProcessing 
              ? `Processing: ${currentProcessing}...` 
              : 'Processing...'
            : 'Complete!'
          }
        </span>
        <span>
          {processingProgress}%
        </span>
      </div>
      
      {errorCount > 0 && (
        <div className="mt-1 text-xs text-red-500">
          {errorCount} candidate{errorCount !== 1 ? 's' : ''} failed to process
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
