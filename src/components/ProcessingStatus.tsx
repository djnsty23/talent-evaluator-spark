
import { Loader2, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ProcessingStatusProps {
  isProcessingAll: boolean;
  processingProgress: number;
  currentProcessing: string | null;
  totalToProcess: number;
  processedCount?: number;
  errorCount?: number;
  onCancel?: () => void;
}

const ProcessingStatus = ({
  isProcessingAll,
  processingProgress,
  currentProcessing,
  totalToProcess,
  processedCount = 0,
  errorCount = 0,
  onCancel
}: ProcessingStatusProps) => {
  if (!isProcessingAll) return null;
  
  return (
    <div className="p-3 px-4 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 w-full max-w-xl animate-in fade-in mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin mr-2" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {processingProgress < 100 
              ? `Processing candidates (${processedCount}/${totalToProcess})`
              : `Processing complete (${processedCount}/${totalToProcess})`
            }
          </span>
        </div>
        
        {onCancel && processingProgress < 100 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1"
            onClick={onCancel}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
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
