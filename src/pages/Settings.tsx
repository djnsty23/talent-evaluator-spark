
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Monitor, Moon, Sun, Bell, Globe, Key, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import OpenAIKeyInput from '@/components/OpenAIKeyInput';

const Settings = () => {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setIsDeletingAccount(true);
    
    try {
      // Additional account deletion logic would go here
      
      toast.success('Account deleted successfully');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="container max-w-3xl px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')} 
        className="mb-6 p-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the application looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select light or dark theme
                  </p>
                </div>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={`rounded-none px-3 ${theme === 'light' ? 'bg-muted' : ''}`}
                  >
                    <Sun className="h-5 w-5 mr-1" />
                    Light
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={`rounded-none px-3 ${theme === 'dark' ? 'bg-muted' : ''}`}
                  >
                    <Moon className="h-5 w-5 mr-1" />
                    Dark
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme("system")}
                    className={`rounded-none px-3 ${theme === 'system' ? 'bg-muted' : ''}`}
                  >
                    <Monitor className="h-5 w-5 mr-1" />
                    System
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates and information via email
                  </p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage API keys for integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <OpenAIKeyInput />
                <p className="text-xs text-muted-foreground mt-1">
                  This key is required for AI-powered features like generating job requirements and analyzing candidates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-destructive/50">
          <CardHeader className="text-destructive">
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Account
            </CardTitle>
            <CardDescription className="text-destructive/80">
              Permanently delete your account and all data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive mr-3 flex-shrink-0" />
              <p className="text-sm text-destructive">
                This action cannot be undone. All your data, including jobs, candidates, and reports will be permanently deleted.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
