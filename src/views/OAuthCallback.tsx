// @ts-nocheck
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * OAuth Callback Handler
 * Handles both popup window and main window OAuth completion.
 */
export default function OAuthCallback() {
  const { loginWithGoogleToken } = useAuth();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const idToken = params.get('id_token');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // Check if we're in a popup
    const isPopup = !!window.opener && window.opener !== window;

    if (error) {
      if (isPopup) {
        window.opener?.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: errorDescription || error || 'Authentication failed'
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 500);
      } else {
        window.location.href = '/home?error=' + encodeURIComponent(error);
      }
    } else if (idToken) {
      if (isPopup) {
        window.opener?.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            idToken
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 500);
      } else {
        loginWithGoogleToken(idToken)
          .then(() => {
            window.history.replaceState({}, document.title, '/home');
            window.location.href = '/home';
          })
          .catch(() => {
            window.location.href = '/home?error=auth_failed';
          });
      }
    } else {
      if (isPopup) {
        window.opener?.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authentication token received'
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 500);
      } else {
        window.location.href = '/home?error=no_token';
      }
    }
  }, [loginWithGoogleToken]);

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-[#09090B] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Completing sign in...</p>
      </div>
    </div>
  );
}
