
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

  const sortedCandidates = [...candidates].sort((a, b) => {
    if (!sortConfig) return 0;
    
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    
    if (sortConfig.key === 'overallScore') {
      return sortConfig.direction === 'ascending'
        ? a.overallScore - b.overallScore
        : b.overallScore - a.overallScore;
    }
    
    // Sort by requirement score
    const reqId = sortConfig.key;
    const scoreA = a.scores.find(s => s.requirementId === reqId)?.score || 0;
    const scoreB = b.scores.find(s => s.requirementId === reqId)?.score || 0;
    
    return sortConfig.direction === 'ascending'
      ? scoreA - scoreB
      : scoreB - scoreA;
  });

  // Find max score for each requirement
  const maxScores = calculateMaxScores(candidates, requirements);

  return (
    <div className="border rounded-md">
      <Table>
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
              className="text-right"
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
