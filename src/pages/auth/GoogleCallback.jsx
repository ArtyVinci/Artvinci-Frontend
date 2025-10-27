import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import showToast from '../../services/toast';
import api from '../../services/api';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('❌ Google OAuth error:', error);
          showToast.error('Google authentication was cancelled or failed');
          navigate('/login');
          return;
        }

        if (!code) {
          console.error('❌ No authorization code received');
          showToast.error('Invalid authentication response');
          navigate('/login');
          return;
        }

        console.log('🔐 Processing Google OAuth callback...');

        // Send code to backend
        const response = await api.post('/auth/google/callback/', { code });
        
        if (response.data && response.data.tokens) {
          const { user, tokens } = response.data;
          
          // Store tokens
          localStorage.setItem('access_token', tokens.access);
          localStorage.setItem('refresh_token', tokens.refresh);
          
          // Update auth context
          setToken(tokens.access);
          setUser(user);
          
          console.log('✅ Google login successful');
          showToast.success(`Welcome back, ${user.first_name || user.email}!`);
          navigate('/dashboard', { replace: true });
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('❌ Google callback error:', error);
        const errorMessage = error.response?.data?.error || 'Google authentication failed';
        showToast.error(errorMessage);
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf9] via-[#f5f5f3] to-[#e8e7e5] dark:from-[#1a1816] dark:via-[#2d2a27] dark:to-[#3a3633] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Loader2 className="w-16 h-16 text-[#6d2842] dark:text-[#d4a343] animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-[#2d2a27] dark:text-[#fafaf9] mb-2">
          Completing Google Sign-in
        </h2>
        <p className="text-[#5d5955] dark:text-[#c4bfb9]">
          Please wait while we complete your authentication...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
