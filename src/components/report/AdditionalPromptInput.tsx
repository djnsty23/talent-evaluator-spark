
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface AdditionalPromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

const AdditionalPromptInput = ({ value, onChange }: AdditionalPromptInputProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Additional Prompt (Optional)</h3>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Focus on leadership skills, exclude candidates without marketing experience..."
        className="min-h-[100px]"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Provide additional instructions to customize the report generation
      </p>
    </div>
  );
};

export default AdditionalPromptInput;
