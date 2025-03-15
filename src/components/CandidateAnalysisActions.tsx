
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, Activity } from 'lucide-react';
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
      <div className="flex flex-wrap gap-4 w-full sm:w-auto">
        <Link to={`/jobs/${jobId}/upload`} className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full h-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload More Candidates
          </Button>
        </Link>
        
        <Link to={`/jobs/${jobId}`} className="w-full sm:w-auto">
          <Button
            variant="outline" 
            className="w-full h-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Job Dashboard
          </Button>
        </Link>
      </div>
      
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
