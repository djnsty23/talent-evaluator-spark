
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ProcessAllCandidatesButton from './ProcessAllCandidatesButton';

interface CandidateAnalysisActionsProps {
  jobId: string;
  candidateId?: string;
  unprocessedCount: number;
  isProcessingAll: boolean;
  processingCandidateIds: string[];
  onProcessAll: () => void;
}

const CandidateAnalysisActions = ({
  jobId,
  candidateId,
  unprocessedCount,
  isProcessingAll,
  processingCandidateIds,
  onProcessAll
}: CandidateAnalysisActionsProps) => {
  if (candidateId) {
    return null;
  }
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t pt-6 gap-4">
      <Button
        onClick={() => window.location.href = `/jobs/${jobId}/upload`}
        variant="outline"
        className="w-full sm:w-auto"
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload More Candidates
      </Button>
      
      <ProcessAllCandidatesButton
        unprocessedCount={unprocessedCount}
        isProcessingAll={isProcessingAll}
        processingCandidateIds={processingCandidateIds}
        onProcessAll={onProcessAll}
      />
    </div>
  );
};

export default CandidateAnalysisActions;
