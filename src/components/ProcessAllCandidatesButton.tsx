
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ProcessAllCandidatesButtonProps {
  unprocessedCount: number;
  isProcessingAll: boolean;
  processingCandidateIds: string[];
  onProcessAll: () => void;
}

const ProcessAllCandidatesButton = ({
  unprocessedCount,
  isProcessingAll,
  processingCandidateIds,
  onProcessAll
}: ProcessAllCandidatesButtonProps) => {
  if (unprocessedCount === 0 || isProcessingAll) {
    return null;
  }
  
  return (
    <Button 
      onClick={onProcessAll}
      disabled={isProcessingAll || processingCandidateIds.length > 0}
      className="w-full sm:w-auto"
    >
      <CheckCircle2 className="h-4 w-4 mr-2" />
      Process All Unprocessed ({unprocessedCount})
    </Button>
  );
};

export default ProcessAllCandidatesButton;
