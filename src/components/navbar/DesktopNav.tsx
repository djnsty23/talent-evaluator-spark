
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserDropdown from './UserDropdown';
import { AuthUser } from '@/contexts/AuthContext';

interface DesktopNavProps {
  navItems: { name: string; path: string; protected: boolean }[];
  currentUser: AuthUser | null;
  location: ReturnType<typeof useLocation>;
}

const DesktopNav = ({ navItems, currentUser, location }: DesktopNavProps) => {
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex items-center space-x-4">
      {navItems.map(item => (
        (!item.protected || currentUser) && (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              location.pathname === item.path
                ? 'text-primary'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        )
      ))}
      
      {!currentUser ? (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            Sign In
          </Button>
          <Button 
            variant="default" 
            onClick={() => navigate('/login?signup=true')}
            className="text-sm"
          >
            Sign Up
          </Button>
        </div>
      ) : (
        <UserDropdown currentUser={currentUser} />
      )}
    </div>
  );
};

export default DesktopNav;
