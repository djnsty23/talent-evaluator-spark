
import { Button } from "@/components/ui/button";
import { FileText, BarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PostProcessingCTAProps {
  jobId: string;
  processedCandidatesCount: number;
  show: boolean;
}

const PostProcessingCTA = ({ jobId, processedCandidatesCount, show }: PostProcessingCTAProps) => {
  const navigate = useNavigate();

  if (!show || processedCandidatesCount === 0) {
    return null;
  }

  const handleGenerateReport = () => {
    navigate(`/jobs/${jobId}/report`);
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 my-6">
      <h3 className="text-lg font-semibold mb-2">All candidates processed!</h3>
      <p className="text-muted-foreground mb-4">
        You've successfully processed {processedCandidatesCount} candidates. 
        Now you can generate a detailed comparison report.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleGenerateReport}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Generate Comparison Report
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="flex items-center gap-2"
        >
          <BarChart className="h-4 w-4" />
          View Job Dashboard
        </Button>
      </div>
    </div>
  );
};

export default PostProcessingCTA;
