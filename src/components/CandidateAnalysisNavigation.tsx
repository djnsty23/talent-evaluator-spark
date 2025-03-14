
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CandidateAnalysisNavigationProps {
  jobId: string;
  candidateId?: string;
}

const CandidateAnalysisNavigation = ({ jobId, candidateId }: CandidateAnalysisNavigationProps) => {
  return (
    <>
      {candidateId ? (
        <Button 
          variant="ghost" 
          asChild 
          className="mb-6"
        >
          <Link to={`/jobs/${jobId}/analysis`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All Candidates
          </Link>
        </Button>
      ) : (
        <Button 
          variant="ghost" 
          asChild 
          className="mb-6"
        >
          <Link to={`/jobs/${jobId}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Link>
        </Button>
      )}
    </>
  );
};

export default CandidateAnalysisNavigation;
