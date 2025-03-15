
import { Star } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Candidate, JobRequirement } from '@/types/job.types';
import ScoreCell from './ScoreCell';

interface CandidateRowProps {
  candidate: Candidate;
  requirements: JobRequirement[];
  maxScores: { [reqId: string]: number };
}

const CandidateRow = ({ candidate, requirements, maxScores }: CandidateRowProps) => {
  return (
    <TableRow key={candidate.id}>
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-1">
          {candidate.name}
          {candidate.isStarred && (
            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
          )}
        </div>
      </TableCell>
      
      {requirements.map(req => {
        const score = candidate.scores.find(s => s.requirementId === req.id);
        const scoreValue = score ? score.score : 0;
        const isHighest = scoreValue > 0 && scoreValue === maxScores[req.id];
        
        return (
          <ScoreCell
            key={req.id}
            score={scoreValue}
            isHighest={isHighest}
            weight={req.weight}
          />
        );
      })}
      
      <TableCell className="text-right font-semibold">
        {candidate.overallScore.toFixed(1)}
      </TableCell>
    </TableRow>
  );
};

export default CandidateRow;
