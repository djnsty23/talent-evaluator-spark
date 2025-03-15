
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

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
  // Don't show the button if there are no unprocessed candidates
  if (unprocessedCount === 0) {
    return null;
  }
  
  return (
    <Button 
      onClick={onProcessAll}
      disabled={isProcessingAll || processingCandidateIds.length > 0}
      className="w-full sm:w-auto"
      variant={isProcessingAll ? "outline" : "default"}
    >
      {isProcessingAll ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Process All ({unprocessedCount})
        </>
      )}
    </Button>
  );
};

export default ProcessAllCandidatesButton;
