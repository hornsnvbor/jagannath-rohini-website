import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, Typography, InputBase, Button } from '@mui/material';
import { Lock, CheckCircle } from '@mui/icons-material';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<'' | string>('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    // Simple hardcoded auth for admin panel
    if (username === 'admin@jagannath' && password === 'jagannath@123') {
      // Store auth state in localStorage
      localStorage.setItem('admin_logged_in', 'true');
      navigate('/admin');
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary/50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader>
          <Typography variant="h6" className="text-center">
            Admin Login
          </Typography>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <InputBase
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <InputBase
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-md font-medium transition"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
            {error && (
              <div className="text-sm text-red-500 mt-2">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;