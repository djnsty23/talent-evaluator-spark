
import React from 'react';
import { JobRequirement } from '@/types/job.types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface JobRequirementFormProps {
  requirement: JobRequirement;
  onRemove: (id: string) => void;
  onChange: (id: string, field: keyof JobRequirement, value: any) => void;
}

// List of available categories for job requirements
export const REQUIREMENT_CATEGORIES = [
  "Technical Skills",
  "Soft Skills",
  "Education",
  "Experience",
  "Certifications",
  "Language",
  "Other"
];

const JobRequirementForm = ({ requirement, onRemove, onChange }: JobRequirementFormProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border rounded-md hover:bg-muted/5 transition-colors">
      <div className="col-span-3">
        <Select
          value={requirement.category}
          onValueChange={(value) => onChange(requirement.id, 'category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {REQUIREMENT_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-5">
        <Textarea
          value={requirement.description}
          onChange={(e) => onChange(requirement.id, 'description', e.target.value)}
          placeholder="Requirement description"
          className="min-h-[60px] resize-none"
        />
      </div>
      
      <div className="col-span-2">
        <Select
          value={requirement.weight.toString()}
          onValueChange={(value) => onChange(requirement.id, 'weight', parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Weight" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="col-span-1 flex items-center justify-center">
        <Switch
          checked={requirement.isRequired}
          onCheckedChange={(checked) => onChange(requirement.id, 'isRequired', checked)}
          id={`required-${requirement.id}`}
        />
      </div>
      
      <div className="col-span-1 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(requirement.id)}
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default JobRequirementForm;
