
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';
import { AuthUser } from '@/contexts/AuthContext';
import { getInitials, isPathActive } from './utils';

interface MobileNavProps {
  isOpen: boolean;
  navItems: { name: string; path: string; protected: boolean }[];
  currentUser: AuthUser | null;
  currentPath: string;
  onMenuClose: () => void;
  onSignOut: () => Promise<void>;
}

const MobileNav = ({ 
  isOpen, 
  navItems, 
  currentUser, 
  currentPath,
  onMenuClose,
  onSignOut
}: MobileNavProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="md:hidden animate-fade-in">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
        {navItems.map(item => (
          (!item.protected || currentUser) && (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isPathActive(currentPath, item.path)
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={onMenuClose}
            >
              {item.name}
            </Link>
          )
        ))}
        
        {!currentUser ? (
          <div className="flex flex-col space-y-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => { 
                navigate('/login');
                onMenuClose();
              }}
              className="w-full"
            >
              Sign In
            </Button>
            <Button 
              variant="default" 
              onClick={() => { 
                navigate('/login?signup=true');
                onMenuClose();
              }}
              className="w-full"
            >
              Sign Up
            </Button>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
            <div className="flex items-center px-3 py-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={currentUser.photoURL} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {currentUser.email}
                </span>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  navigate('/profile');
                  onMenuClose();
                }}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start" 
                onClick={() => {
                  navigate('/settings');
                  onMenuClose();
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" 
                onClick={() => {
                  onSignOut();
                  onMenuClose();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileNav;
