
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, Share2, Check, Mail, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ReportShareWidgetProps {
  reportId: string;
  jobId: string;
}

const ReportShareWidget = ({ reportId, jobId }: ReportShareWidgetProps) => {
  const [copied, setCopied] = useState(false);
  
  const reportUrl = `${window.location.origin}/jobs/${jobId}/report/${reportId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  const handleShareByEmail = () => {
    const subject = encodeURIComponent('Candidate Comparison Report');
    const body = encodeURIComponent(`Here's the candidate comparison report I created: ${reportUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Report
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareByEmail}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Input 
              readOnly 
              value={reportUrl} 
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleCopyLink} 
              variant="secondary"
              size="icon"
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Sharing this link will allow anyone with access to view this report
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportShareWidget;
