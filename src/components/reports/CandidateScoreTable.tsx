
import { useState } from 'react';
import { Candidate, JobRequirement } from '@/contexts/JobContext';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

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

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="h-4 w-4 inline-block ml-1" /> 
      : <ChevronDown className="h-4 w-4 inline-block ml-1" />;
  };

  // Find max score for each requirement
  const maxScores: { [reqId: string]: number } = {};
  requirements.forEach(req => {
    maxScores[req.id] = Math.max(...candidates.map(c => {
      const score = c.scores.find(s => s.requirementId === req.id);
      return score ? score.score : 0;
    }));
  });

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead 
              className="w-[180px] cursor-pointer"
              onClick={() => requestSort('name')}
            >
              Candidate {getSortIcon('name')}
            </TableHead>
            
            {requirements.map(req => (
              <TableHead 
                key={req.id}
                className="min-w-[140px] cursor-pointer"
                onClick={() => requestSort(req.id)}
              >
                <div className="flex flex-col">
                  <span>
                    {req.description.length > 30
                      ? req.description.substring(0, 30) + '...'
                      : req.description
                    }
                    {getSortIcon(req.id)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {req.category} (weight: {req.weight})
                  </span>
                </div>
              </TableHead>
            ))}
            
            <TableHead 
              className="text-right cursor-pointer"
              onClick={() => requestSort('overallScore')}
            >
              Overall Score {getSortIcon('overallScore')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map(candidate => (
            <TableRow key={candidate.id}>
              <TableCell className="font-medium">
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
                  <TableCell 
                    key={req.id}
                    className={isHighest ? "font-semibold bg-green-50 dark:bg-green-900/20" : ""}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 text-center">{scoreValue || '-'}</div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isHighest 
                            ? 'bg-green-500 dark:bg-green-400' 
                            : 'bg-blue-500 dark:bg-blue-400'}`}
                          style={{ width: `${scoreValue * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                );
              })}
              
              <TableCell className="text-right font-semibold">
                {candidate.overallScore.toFixed(1)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidateScoreTable;
