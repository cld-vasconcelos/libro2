import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { signInWithLink } from '@/services/authService';
import PasswordLogin from './PasswordLogin';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setShowPasswordLogin(searchParams.get('form') === 'password');
  }, [searchParams]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithLink(email);
      toast({
        title: "Check your email",
        description: "We've sent you a link to log in.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send login link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    toast({
      title: "Success",
      description: "You have been logged in successfully.",
    });
    navigate('/');
  };

  const handleLoginError = (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-book underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          {showPasswordLogin ? (
            <div>
              <PasswordLogin 
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
              <button
                onClick={() => setSearchParams({})}
                className="mt-4 text-sm text-book hover:text-book-dark font-medium underline w-full text-center"
              >
                ← Back to Link Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <h1 className="text-2xl font-semibold">Login to Libro</h1>
                <p className="text-sm text-gray-600 mt-2">
                  We'll email you a link for a password-free sign in
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
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send link'}
                </Button>
              </form>

              <div className="border-t border-gray-200 mt-6 pt-4">
                <div className="flex flex-col space-y-4 text-center text-sm">
                  <button
                    onClick={() => setSearchParams({ form: 'password' })}
                    className="text-book hover:text-book-dark font-medium underline"
                  >
                    Use password instead
                  </button>
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-book hover:text-book-dark font-medium underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
