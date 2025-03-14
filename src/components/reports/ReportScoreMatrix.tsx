
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import CandidateScoreTable from '@/components/reports/CandidateScoreTable';
import { Candidate, JobRequirement } from '@/types/job.types';

interface ReportScoreMatrixProps {
  candidates: Candidate[];
  requirements: JobRequirement[];
}

const ReportScoreMatrix = ({ candidates, requirements }: ReportScoreMatrixProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Candidate Comparison Matrix</CardTitle>
        <CardDescription>
          Scores of each candidate against job requirements (scale: 1-10)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        <CandidateScoreTable 
          candidates={candidates}
          requirements={requirements}
        />
      </CardContent>
    </Card>
  );
};

export default ReportScoreMatrix;
