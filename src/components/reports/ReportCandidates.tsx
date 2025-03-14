
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Job } from '@/types/job.types';

interface ReportCandidatesProps {
  job: Job;
  candidateIds: string[];
}

const ReportCandidates = ({ job, candidateIds }: ReportCandidatesProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Candidates Included</CardTitle>
        <CardDescription>
          This report includes analysis for the following candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {candidateIds.map(candidateId => {
            const candidate = job.candidates.find(c => c.id === candidateId);
            if (!candidate) return null;
            
            return (
              <Badge key={candidateId} variant="secondary" className="px-3 py-1">
                {candidate.name}
                {candidate.isStarred && (
                  <span className="ml-1 text-yellow-500">★</span>
                )}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCandidates;
