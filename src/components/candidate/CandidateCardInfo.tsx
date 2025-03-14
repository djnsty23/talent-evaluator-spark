
import React from 'react';
import { FileText } from 'lucide-react';

interface CandidateCardInfoProps {
  isProcessed: boolean;
  processedAt?: string;
}

const CandidateCardInfo = ({ isProcessed, processedAt }: CandidateCardInfoProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex items-center text-sm text-muted-foreground mb-3">
      <FileText className="h-4 w-4 mr-1" />
      {isProcessed ? (
        <span>Processed on {formatDate(processedAt)}</span>
      ) : (
        <span>Resume uploaded, not yet processed</span>
      )}
    </div>
  );
};

export default CandidateCardInfo;
