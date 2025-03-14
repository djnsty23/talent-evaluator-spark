
import { Calendar, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Report } from '@/types/job.types';
import { format } from 'date-fns';

interface ReportMetricsProps {
  report: Report;
  candidateCount: number;
}

const ReportMetrics = ({ report, candidateCount }: ReportMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="text-sm font-medium">Generated</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(report.createdAt), 'PPP')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="text-sm font-medium">Candidates</p>
              <p className="text-xs text-muted-foreground">
                {candidateCount} included
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <div>
              <p className="text-sm font-medium">Report Type</p>
              <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                {report.additionalPrompt 
                  ? `Custom Analysis: ${report.additionalPrompt.substring(0, 50)}${report.additionalPrompt.length > 50 ? '...' : ''}`
                  : 'Standard Candidate Ranking Analysis'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportMetrics;
