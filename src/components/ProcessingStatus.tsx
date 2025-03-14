
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  isProcessingAll: boolean;
  processingProgress: number;
  currentProcessing: string;
  totalToProcess: number;
}

const ProcessingStatus = ({
  isProcessingAll,
  processingProgress,
  currentProcessing,
  totalToProcess
}: ProcessingStatusProps) => {
  if (!isProcessingAll) return null;
  
  return (
    <div className="p-2 px-3 rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 w-full max-w-xs animate-in fade-in">
      <div className="flex items-center mb-2">
        <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin mr-2" />
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          Processing candidates
        </span>
      </div>
      
      <Progress value={processingProgress} className="h-2 mb-1" />
      
      <div className="flex justify-between items-center text-xs text-blue-600 dark:text-blue-400">
        <span>
          {processingProgress < 100 ? 'Processing...' : 'Complete!'}
        </span>
        <span>
          {processingProgress}%
        </span>
      </div>
    </div>
  );
};

export default ProcessingStatus;
