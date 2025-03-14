
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

  if (processedCandidatesCount === 0 || candidateId || showPostProcessCTA) {
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
