import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for password recovery token
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Valid password recovery
      } else if (!session) {
        // No valid recovery token
        toast({
          title: "Error",
          description: "Invalid password reset link. Please request a new one.",
          variant: "destructive"
        });
        navigate('/auth/forgot-password');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your password has been updated successfully.",
      });

      navigate('/');
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to reset password',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Reset your password</h2>
              <p className="text-sm text-gray-600 mt-2">
                Please enter your new password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
