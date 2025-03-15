
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';

interface RequirementsActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const RequirementsActions = ({ isSaving, onSave, onCancel }: RequirementsActionsProps) => {
  return (
    <div className="flex justify-end space-x-4 mt-8">
      <Button
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        onClick={onSave}
        disabled={isSaving}
        className="min-w-[120px]"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Requirements
          </>
        )}
      </Button>
    </div>
  );
};

export default RequirementsActions;
