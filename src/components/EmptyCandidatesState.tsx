
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface EmptyCandidatesStateProps {
  jobId: string;
}

const EmptyCandidatesState = ({ jobId }: EmptyCandidatesStateProps) => {
  return (
    <Card className="flex flex-col items-center justify-center p-12">
      <div className="text-muted-foreground mb-4">
        <FileText className="h-16 w-16" />
      </div>
      <h2 className="text-xl font-medium mb-2">No candidates found</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        You haven't uploaded any candidates for this job yet. Upload candidate resumes to see the analysis.
      </p>
      <Button asChild>
        <Link to={`/jobs/${jobId}/upload`}>Upload Candidates</Link>
      </Button>
    </Card>
  );
};

export default EmptyCandidatesState;
