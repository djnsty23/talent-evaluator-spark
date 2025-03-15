
import { TableCell } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ScoreCellProps {
  score: number;
  isHighest: boolean;
  weight?: number;
}

const ScoreCell = ({ score, isHighest, weight = 1 }: ScoreCellProps) => {
  // Calculate the color based on the score value
  const getScoreColor = (value: number) => {
    if (value >= 8) return 'bg-green-500 dark:bg-green-400';
    if (value >= 5) return 'bg-blue-500 dark:bg-blue-400';
    if (value >= 3) return 'bg-yellow-500 dark:bg-yellow-400';
    return 'bg-red-500 dark:bg-red-400';
  };

  const scoreColor = getScoreColor(score);
  
  return (
    <TableCell 
      className={`${isHighest ? "font-semibold bg-green-50 dark:bg-green-900/20" : ""}`}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <div className="w-8 text-center font-medium">
                {score || '-'}
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${scoreColor}`}
                  style={{ width: `${score * 10}%` }}
                ></div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Score: {score}/10</p>
            {weight && <p>Requirement weight: {weight}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TableCell>
  );
};

export default ScoreCell;
