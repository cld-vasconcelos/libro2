import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { signIn } from '@/services/authService';

interface PasswordLoginProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
}

const PasswordLogin = ({ onSuccess, onError }: PasswordLoginProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn({ email, password });
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Login to Libro</h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter your email and password to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <div className="flex justify-end mt-1">
            <Link to="/auth/forgot-password" className="text-sm text-book hover:text-book-dark font-medium underline">
              Forgot your password?
            </Link>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <div className="border-t border-gray-200 mt-6 pt-4">
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-book hover:text-book-dark font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordLogin;
