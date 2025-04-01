import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
            {success ? (
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Check your email</h2>
                <p className="text-sm text-gray-600">
                  Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">Reset your password</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Enter your email address and we'll send you instructions to reset your password.
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

                {error && (
                  <Alert variant="destructive">
                    {error}
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset instructions'}
                </Button>
                </form>
              </>
            )}

            <div className="border-t border-gray-200 mt-6 pt-4">
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link to="/login?form=password" className="text-book hover:text-book-dark font-medium underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
