
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface CandidateCardFooterProps {
  isProcessed: boolean;
  isProcessing: boolean;
  onProcess: () => void;
  onViewDetails?: () => void;
}

const CandidateCardFooter = ({ 
  isProcessed, 
  isProcessing, 
  onProcess, 
  onViewDetails 
}: CandidateCardFooterProps) => {
  return (
    <CardFooter className="p-3 flex justify-between items-center bg-muted/20 border-t">
      {onViewDetails && (
        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="text-xs h-8"
        >
          Detailed View
        </Button>
      )}
      
      {!isProcessed && (
        <Button
          variant="default"
          size="sm"
          onClick={onProcess}
          disabled={isProcessing}
          className="text-xs h-8"
        >
          {isProcessing ? 'Processing...' : 'Process CV'}
        </Button>
      )}
    </CardFooter>
  );
};

export default CandidateCardFooter;
