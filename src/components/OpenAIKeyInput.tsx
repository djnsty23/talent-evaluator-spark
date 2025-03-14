
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

// We're storing the key in window for demo purposes
// In a real app, this would be stored more securely
declare global {
  interface Window {
    openAIKey?: string;
  }
}

interface OpenAIKeyInputProps {
  onKeySubmit?: (key: string) => void;
}

const OpenAIKeyInput = ({ onKeySubmit }: OpenAIKeyInputProps) => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(window.openAIKey || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Check if API key exists in localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_key');
    if (savedKey) {
      window.openAIKey = savedKey;
      setApiKey(savedKey);
    }
  }, []);
  
  const handleSubmit = () => {
    setIsSaving(true);
    
    if (apiKey) {
      // Save to localStorage and window object
      localStorage.setItem('openai_key', apiKey);
      window.openAIKey = apiKey;
      
      // Call the onKeySubmit callback if provided
      if (onKeySubmit) {
        onKeySubmit(apiKey);
      }
      
      toast.success('OpenAI API key saved');
    } else {
      // Clear the saved key if empty
      localStorage.removeItem('openai_key');
      window.openAIKey = '';
      toast.error('API key cleared');
    }
    
    setIsSaving(false);
    setOpen(false);
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <KeyRound size={14} />
        <span>{window.openAIKey ? 'Update' : 'Set'} API Key</span>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to enable AI-powered feature generation.
              Your key is stored locally in your browser and never sent to our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
              id="apiKey"
              type="password"
              placeholder="sk-..." 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Get your API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">OpenAI dashboard</a>.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OpenAIKeyInput;
