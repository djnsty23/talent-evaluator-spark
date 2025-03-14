
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandidateResumeButtonProps {
  resumeUrl: string | undefined;
}

const CandidateResumeButton = ({ resumeUrl }: CandidateResumeButtonProps) => {
  if (!resumeUrl) return null;
  
  return (
    <div className="mt-4 border-t pt-4 border-gray-100 dark:border-gray-800">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={(e) => {
          e.stopPropagation();
          window.open(resumeUrl, '_blank');
        }}
      >
        <FileText className="h-3 w-3 mr-1" />
        View Resume
        <ExternalLink className="h-3 w-3 ml-1" />
      </Button>
    </div>
  );
};

export default CandidateResumeButton;
