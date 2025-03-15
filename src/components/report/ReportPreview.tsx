
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';

interface ReportPreviewProps {
  hasCustomInstructions: boolean;
}

const ReportPreview = ({ hasCustomInstructions }: ReportPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Preview</CardTitle>
        <CardDescription>
          What your report will include
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Job Details</h3>
          <p className="text-sm text-muted-foreground">
            Basic job information including title, company, and description
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Requirements Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Overview of job requirements and their weights
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Candidate Ranking</h3>
          <p className="text-sm text-muted-foreground">
            Detailed ranking of selected candidates based on their scores
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Individual Assessments</h3>
          <p className="text-sm text-muted-foreground">
            Analysis of each candidate's strengths and weaknesses
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated hiring recommendations and next steps
          </p>
        </div>
        
        {hasCustomInstructions && (
          <div>
            <h3 className="text-sm font-medium mb-2">Custom Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Additional analysis based on your custom instructions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportPreview;
