
import { TableCell } from '@/components/ui/table';

interface ScoreCellProps {
  score: number;
  isHighest: boolean;
}

const ScoreCell = ({ score, isHighest }: ScoreCellProps) => {
  return (
    <TableCell 
      className={isHighest ? "font-semibold bg-green-50 dark:bg-green-900/20" : ""}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 text-center">{score || '-'}</div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${isHighest 
              ? 'bg-green-500 dark:bg-green-400' 
              : 'bg-blue-500 dark:bg-blue-400'}`}
            style={{ width: `${score * 10}%` }}
          ></div>
        </div>
      </div>
    </TableCell>
  );
};

export default ScoreCell;
