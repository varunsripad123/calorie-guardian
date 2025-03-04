import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';

export default function Navbar() {
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user info from localStorage
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        setUserName(userData.name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b px-4 py-2 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-primary">
        Calorie Guardian
      </Link>
      
      <div className="flex items-center gap-4">
        {userName && (
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            Welcome, {userName}
          </span>
        )}
        
        <Link to="/profile">
          <Button variant="outline" size="sm">
            <User size={16} className="mr-2" />
            Profile
          </Button>
        </Link>
        
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  );
}