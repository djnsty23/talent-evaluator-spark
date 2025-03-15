
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center">
      <span className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 hover:from-blue-600 hover:to-indigo-700">
        TalentMatch
      </span>
    </Link>
  );
};

export default Logo;
