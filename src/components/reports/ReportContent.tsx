
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface ReportContentProps {
  content: string;
}

const ReportContent = ({ content }: ReportContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full Report</CardTitle>
        <CardDescription>
          Detailed ranking and analysis of selected candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportContent;
