
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Building } from "lucide-react";
import ProcessingStatus from "./ProcessingStatus";

interface CandidateAnalysisHeaderProps {
  jobTitle: string;
  jobCompany: string;
  jobId: string;
  candidateId?: string;
  candidatesCount: number;
  processedCount: number;
  isProcessingAll: boolean;
  processingProgress: number;
  currentProcessing: string;
  totalToProcess: number;
  processedCountTracking?: number;
  errorCount?: number;
}

const CandidateAnalysisHeader = ({
  jobTitle,
  jobCompany,
  jobId,
  candidateId,
  candidatesCount,
  processedCount,
  isProcessingAll,
  processingProgress,
  currentProcessing,
  totalToProcess,
  processedCountTracking = 0,
  errorCount = 0
}: CandidateAnalysisHeaderProps) => {
  return (
    <div className="mb-6">
      <Button
        variant="ghost"
        asChild
        className="mb-4 p-0 hover:bg-transparent"
      >
        <Link to={candidateId ? `/jobs/${jobId}/analysis` : `/jobs/${jobId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>
            {candidateId ? "Back to all candidates" : "Back to job details"}
          </span>
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h1 className="text-3xl font-bold">{jobTitle}</h1>
          <div className="flex items-center mt-1 text-muted-foreground">
            <Building className="h-4 w-4 mr-1" />
            <span>{jobCompany}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div className="text-sm">
              <span className="font-medium">{candidatesCount}</span> candidates
              in total
            </div>
            <div className="text-sm">
              <span className="font-medium">{processedCount}</span> processed
            </div>
          </div>
        </div>

        <div className="flex justify-start md:justify-end">
          <ProcessingStatus
            isProcessingAll={isProcessingAll}
            processingProgress={processingProgress}
            currentProcessing={currentProcessing}
            totalToProcess={totalToProcess}
            processedCount={processedCountTracking}
            errorCount={errorCount}
          />
        </div>
      </div>
    </div>
  );
};

export default CandidateAnalysisHeader;
