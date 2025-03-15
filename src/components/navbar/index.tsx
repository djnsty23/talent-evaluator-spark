
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import MobileMenuButton from './MobileMenuButton';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const Navbar = () => {
  const { currentUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', protected: true },
    { name: 'Jobs', path: '/jobs', protected: true },
  ];

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 dark:bg-black/70 border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Nav */}
          <DesktopNav 
            navItems={navItems} 
            currentUser={currentUser} 
            location={location} 
          />

          {/* Notification Bell - Only show when logged in */}
          {currentUser && (
            <div className="hidden md:flex items-center mr-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuGroup className="p-2">
                    <h3 className="font-medium mb-1">Notifications</h3>
                    <div className="text-xs text-muted-foreground mb-2">Recent activity</div>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuItem className="p-3 hover:bg-accent focus:bg-accent cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">New candidate uploaded</div>
                      <div className="text-xs text-muted-foreground">Jane Smith's resume was processed successfully</div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="p-3 hover:bg-accent focus:bg-accent cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">Report generated</div>
                      <div className="text-xs text-muted-foreground">Software Engineer report is ready to view</div>
                      <div className="text-xs text-muted-foreground">Yesterday</div>
                    </div>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="p-3 hover:bg-accent focus:bg-accent cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">API key updated</div>
                      <div className="text-xs text-muted-foreground">Your OpenAI API key was updated successfully</div>
                      <div className="text-xs text-muted-foreground">2 days ago</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            isOpen={mobileMenuOpen}
            onToggle={toggleMobileMenu}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileNav 
        isOpen={mobileMenuOpen}
        navItems={navItems}
        currentUser={currentUser}
        currentPath={location.pathname}
        onMenuClose={closeMobileMenu}
        onSignOut={handleSignOut}
      />
    </nav>
  );
};

export default Navbar;
