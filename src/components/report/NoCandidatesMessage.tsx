
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface NoCandidatesMessageProps {
  onGoToAnalysis: () => void;
}

const NoCandidatesMessage = ({ onGoToAnalysis }: NoCandidatesMessageProps) => {
  return (
    <Card className="flex flex-col items-center justify-center p-12">
      <div className="text-muted-foreground mb-4">
        <FileText className="h-16 w-16" />
      </div>
      <h2 className="text-xl font-medium mb-2">No processed candidates</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        You need to process at least one candidate before you can generate a report.
        Go to the analysis page to process your candidates.
      </p>
      <Button onClick={onGoToAnalysis}>
        Go to Analysis
      </Button>
    </Card>
  );
};

export default NoCandidatesMessage;
