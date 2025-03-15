
import { useState } from 'react';
import { Candidate, JobRequirement } from '@/types/job.types';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SortableTableHeader from './table/SortableTableHeader';
import CandidateRow from './table/CandidateRow';
import { calculateMaxScores } from './utils/scoreUtils';

interface CandidateScoreTableProps {
  candidates: Candidate[];
  requirements: JobRequirement[];
}

const CandidateScoreTable = ({ candidates, requirements }: CandidateScoreTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>({
    key: 'overallScore',
    direction: 'descending',
  });

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Check if we have candidates to display
  if (candidates.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No candidates available to display</p>
      </div>
    );
  }

  // Make sure we have processed candidates with scores
  const processedCandidates = candidates.filter(c => c.status === 'processed');
  
  if (processedCandidates.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">No processed candidates available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Process candidates to view their scores
        </p>
      </div>
    );
  }

  const sortedCandidates = [...processedCandidates].sort((a, b) => {
    if (!sortConfig) return 0;
    
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortConfig.key === 'overallScore') {
      // Handle cases where one or both scores are 0 (N/A)
      if (a.overallScore === 0 && b.overallScore === 0) return 0;
      if (a.overallScore === 0) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (b.overallScore === 0) return sortConfig.direction === 'ascending' ? 1 : -1;
      
      return sortConfig.direction === 'ascending'
        ? a.overallScore - b.overallScore
        : b.overallScore - a.overallScore;
    }
    
    // Sort by requirement score
    const reqId = sortConfig.key;
    const scoreA = a.scores.find(s => s.requirementId === reqId)?.score || 0;
    const scoreB = b.scores.find(s => s.requirementId === reqId)?.score || 0;
    
    // Handle cases where one or both scores are 0 (N/A)
    if (scoreA === 0 && scoreB === 0) return 0;
    if (scoreA === 0) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (scoreB === 0) return sortConfig.direction === 'ascending' ? 1 : -1;
    
    return sortConfig.direction === 'ascending'
      ? scoreA - scoreB
      : scoreB - scoreA;
  });

  // Find max score for each requirement
  const maxScores = calculateMaxScores(processedCandidates, requirements);

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableCaption>
          Scores of each candidate against job requirements (scale: 1-10, or N/A if not evaluated)
        </TableCaption>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <SortableTableHeader
              title="Candidate"
              sortKey="name"
              currentSort={sortConfig}
              onSort={requestSort}
              className="w-[180px]"
            />
            
            {requirements.map(req => (
              <SortableTableHeader
                key={req.id}
                title={req.description}
                subtitle={`${req.category} (weight: ${req.weight})`}
                sortKey={req.id}
                currentSort={sortConfig}
                onSort={requestSort}
                className="min-w-[140px]"
                truncateAt={30}
              />
            ))}
            
            <SortableTableHeader
              title="Overall Score"
              sortKey="overallScore"
              currentSort={sortConfig}
              onSort={requestSort}
              className="text-right w-[120px]"
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map(candidate => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              requirements={requirements}
              maxScores={maxScores}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateScoreTable;
