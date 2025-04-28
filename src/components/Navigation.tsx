// Remove the React import if it's not needed
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Bell } from 'lucide-react';

export default function Navigation() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="bg-white border-b shadow">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center">
          <Button variant="link" onClick={() => navigate('/books')}>
            My Books
          </Button>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5" />
            <span>{user.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
