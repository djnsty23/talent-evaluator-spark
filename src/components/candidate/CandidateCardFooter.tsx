
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ArrowUpRight, Activity, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CandidateCardFooterProps {
  isProcessed: boolean;
  isProcessing: boolean;
  onProcess: () => void;
  onViewDetails?: () => void;
  jobId?: string;
  candidateId?: string;
}

const CandidateCardFooter = ({ 
  isProcessed, 
  isProcessing, 
  onProcess, 
  onViewDetails,
  jobId,
  candidateId
}: CandidateCardFooterProps) => {
  // Handle process click without page navigation
  const handleProcessClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onProcess();
  };

  return (
    <CardFooter className="p-3 flex justify-between items-center bg-muted/20 border-t">
      <div className="flex gap-2">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="text-xs h-8"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Detailed View
          </Button>
        )}
        
        {jobId && candidateId && isProcessed && (
          <Link to={`/jobs/${jobId}/analysis/${candidateId}`}>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs h-8"
            >
              <Activity className="h-3 w-3 mr-1" />
              Candidate Analysis
            </Button>
          </Link>
        )}
      </div>
      
      {!isProcessed && (
        <Button
          variant="default"
          size="sm"
          onClick={handleProcessClick}
          disabled={isProcessing}
          className="text-xs h-8"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            'Process CV'
          )}
        </Button>
      )}
    </CardFooter>
  );
};

export default CandidateCardFooter;
