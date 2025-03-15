
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Plus, FileText } from 'lucide-react';
import OpenAIKeyInput from '@/components/OpenAIKeyInput';

interface RequirementsHeaderProps {
  requirementsCount: number;
  isGenerating: boolean;
  showContextUploader: boolean;
  onAddRequirement: () => void;
  onGenerateRequirements: () => void;
  onToggleContextUploader: () => void;
}

const RequirementsHeader = ({
  requirementsCount,
  isGenerating,
  showContextUploader,
  onAddRequirement,
  onGenerateRequirements,
  onToggleContextUploader
}: RequirementsHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between pb-4 space-y-0">
      <div>
        <h3 className="text-xl font-semibold">Requirements</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {requirementsCount > 0 
            ? `${requirementsCount} requirements defined` 
            : 'No requirements defined yet'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <OpenAIKeyInput />
        
        <Button 
          variant="outline"
          onClick={onToggleContextUploader}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          {showContextUploader ? 'Hide Files' : 'Add Context Files'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={onGenerateRequirements}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
        
        <Button 
          onClick={onAddRequirement}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Requirement
        </Button>
      </div>
    </div>
  );
};

export default RequirementsHeader;
