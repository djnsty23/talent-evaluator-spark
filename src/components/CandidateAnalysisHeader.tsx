
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import ProcessingStatus from '@/components/ProcessingStatus';

interface CandidateAnalysisHeaderProps {
  jobTitle: string;
  jobCompany: string;
  candidateId?: string;
  jobId: string;
  candidatesCount: number;
  processedCount: number;
  isProcessingAll: boolean;
  processingProgress: number;
  currentProcessing: string;
  totalToProcess: number;
}

const CandidateAnalysisHeader = ({
  jobTitle,
  jobCompany,
  candidateId,
  jobId,
  candidatesCount,
  processedCount,
  isProcessingAll,
  processingProgress,
  currentProcessing,
  totalToProcess
}: CandidateAnalysisHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold">
          {candidateId ? 'Candidate Details' : 'Candidate Analysis'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {jobTitle} at {jobCompany}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
        <ProcessingStatus 
          isProcessingAll={isProcessingAll}
          processingProgress={processingProgress}
          currentProcessing={currentProcessing}
          totalToProcess={totalToProcess}
        />
        
        <Button 
          onClick={() => window.location.href = `/jobs/${jobId}/report`}
          disabled={candidatesCount === 0 || processedCount === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default CandidateAnalysisHeader;
