
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportGenerationButtonProps {
  jobId: string;
  processedCandidatesCount: number;
  candidateId?: string;
  showPostProcessCTA: boolean;
}

const ReportGenerationButton = ({ 
  jobId, 
  processedCandidatesCount, 
  candidateId,
  showPostProcessCTA
}: ReportGenerationButtonProps) => {
  const navigate = useNavigate();

  if (candidateId) {
    // Show in individual candidate view
    return (
      <div className="mt-6">
        <Button
          onClick={() => navigate(`/jobs/${jobId}/report`)}
          variant="outline"
          className="flex items-center gap-2 w-full"
        >
          <FileText className="h-4 w-4" />
          Generate Comparison Report
        </Button>
      </div>
    );
  }

  if (processedCandidatesCount === 0 || showPostProcessCTA) {
    return null;
  }

  const handleGenerateReport = () => {
    navigate(`/jobs/${jobId}/report`);
  };

  return (
    <div className="mt-6 flex justify-center">
      <Button
        onClick={handleGenerateReport}
        variant="outline"
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Generate Candidate Comparison Report
      </Button>
    </div>
  );
};

export default ReportGenerationButton;
