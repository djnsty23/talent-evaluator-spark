
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
    <div className="flex flex-col gap-2 p-2 border rounded-md bg-background w-full sm:w-64">
      <div className="flex justify-between text-sm">
        <span>Processing: {currentProcessing}</span>
        <span>{Math.round(processingProgress)}%</span>
      </div>
      <Progress value={processingProgress} className="h-2" />
      <div className="text-xs text-muted-foreground">
        {Math.round(processingProgress / 100 * totalToProcess)} of {totalToProcess} candidates
      </div>
    </div>
  );
};

export default ProcessingStatus;
