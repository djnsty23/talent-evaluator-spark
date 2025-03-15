
import ReactMarkdown from 'react-markdown';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ReportContentProps {
  content: string;
  isLoading?: boolean;
  error?: string | null;
}

const ReportContent = ({ content, isLoading = false, error = null }: ReportContentProps) => {
  // Check if content is the placeholder text
  const isPlaceholderContent = content?.includes('Report is being generated') || 
                              content?.includes('This will be replaced');
  
  // If we have an error, show it
  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Report Error</CardTitle>
          <CardDescription>
            There was a problem generating the report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Full Report</CardTitle>
        <CardDescription>
          Detailed ranking and analysis of selected candidates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : isPlaceholderContent ? (
          <div className="p-6 text-center border rounded-md bg-muted/50">
            <p className="text-muted-foreground mb-2">Report generation in progress</p>
            <p className="text-sm text-muted-foreground">
              The full report is being generated. This may take a moment to complete.
            </p>
          </div>
        ) : !content ? (
          <div className="p-6 text-center border rounded-md bg-muted/50">
            <p className="text-muted-foreground mb-2">No report content available</p>
            <p className="text-sm text-muted-foreground">
              Please try regenerating the report.
            </p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportContent;
