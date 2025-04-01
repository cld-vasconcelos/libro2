import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/spinner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the next path from URL params
        const params = new URLSearchParams(window.location.hash.substring(1));
        const next = params.get('next');
        console.log('next', next);
        // If this is a password reset flow, redirect to reset password page
        if (next === '/reset-password') {
          navigate('/reset-password', { replace: true });
          return;
        }

        // For other auth flows, check session and redirect accordingly
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          navigate(next || '/', { replace: true });
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default AuthCallback;
