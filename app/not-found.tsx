// app/not-found.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MdHome, 
  MdArrowBack, 
  MdRefresh, 
  MdSearch, 
  MdEmail,
  MdSupportAgent,
  MdWarning,
  MdTimer,
  MdBlock,
  MdErrorOutline,
  MdCheckCircle
} from "react-icons/md";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [suggestedPath, setSuggestedPath] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<{
    exists: boolean;
    isValid?: boolean;
    isExpired?: boolean;
    error?: string;
    email?: string;
    organizationId?: string;
    organizationName?: string;
    role?: string;
    apiChecked?: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [extractedToken, setExtractedToken] = useState<string | null>(null);

  useEffect(() => {
    const checkTokenWithAPI = async (token: string) => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log(`🔍 Checking token with API: ${apiUrl}/organizations/invitations/check`);
        
        const response = await fetch(`${apiUrl}/organizations/invitations/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        console.log(`📡 API Check Result:`, { status: response.status, data });
        
        if (response.ok && data.exists) {
          // Token is valid in database
          setTokenStatus({
            exists: true,
            isValid: true,
            isExpired: false,
            email: data.invitation?.email,
            organizationId: data.invitation?.organizationId,
            organizationName: data.invitation?.organizationName,
            role: data.invitation?.role,
            apiChecked: true,
          });
          return true;
        } else if (response.status === 404 || !data.exists) {
          // Token not found in database (expired or invalid)
          setTokenStatus({
            exists: true,
            isValid: false,
            isExpired: true,
            error: data.message || 'Invitation not found or expired',
            apiChecked: true,
          });
          return false;
        }
      } catch (error) {
        console.error('❌ API check failed:', error);
        return null;
      }
      return null;
    };

    const extractAndCheckToken = async () => {
      // Try multiple ways to get the token
      let token = null;
      
      // Method 1: From params (folder name is [invited_users_verification])
      token = params?.invited_users_verification as string;
      
      // Method 2: If not in params, try to extract from pathname
      if (!token && pathname.includes("/accept-invite")) {
        const pathParts = pathname.split('/');
        const acceptInviteIndex = pathParts.findIndex(part => part === 'accept-invite');
        if (acceptInviteIndex > 0) {
          token = pathParts[acceptInviteIndex - 1];
        }
      }
      
      // Method 3: Try to get from search params if present
      if (!token && window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get('token');
      }
      
      if (token) {
        setExtractedToken(token);
        console.log(`🔑 Token extracted: ${token.substring(0, 50)}...`);
        console.log(`📋 Token length: ${token.length}`);
        console.log(`📋 Token parts: ${token.split('.').length}`);
        
        // Check with API
        const apiResult = await checkTokenWithAPI(token);
        
        if (apiResult === true) {
          console.log('✅ Token is valid according to API');
        } else if (apiResult === false) {
          console.log('❌ Token is invalid/expired according to API');
        } else {
          // API failed, fall back to JWT decoding
          console.log('⚠️ API check failed, falling back to JWT decoding');
          
          const isJWT = token.split('.').length === 3;
          if (isJWT) {
            try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(atob(base64));
              const now = Math.floor(Date.now() / 1000);
              const isExpired = payload.exp && payload.exp < now;
              
              setTokenStatus({
                exists: true,
                isValid: !isExpired,
                isExpired: isExpired,
                email: payload.email,
                organizationId: payload.organizationId,
                apiChecked: false,
              });
              
              console.log('📦 JWT Decoded:', {
                email: payload.email,
                organizationId: payload.organizationId,
                isExpired: isExpired,
              });
            } catch (error) {
              console.error('❌ Invalid token format:', error);
              setTokenStatus({
                exists: true,
                isValid: false,
                error: 'Invalid token format',
              });
            }
          } else {
            setTokenStatus({
              exists: true,
              isValid: false,
              error: 'Not a valid JWT token',
            });
          }
        }
      } else if (pathname.includes("/accept-invite")) {
        console.log('⚠️ Accept-invite route but no token found');
        setTokenStatus({
          exists: false,
          isValid: false,
          error: 'No token found in URL',
        });
      }
      
      setIsLoading(false);
    };
    
    extractAndCheckToken();
  }, [params, pathname]);

  useEffect(() => {
    // Log 404 error for monitoring
    console.error("404: Page not found", {
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      tokenExtracted: !!extractedToken,
      tokenStatus: tokenStatus,
    });

    // Try to suggest a correction based on the path
    const path = window.location.pathname;
    if (path.includes("/dashbaord")) setSuggestedPath("/dashboard");
    else if (path.includes("/proflie")) setSuggestedPath("/profile");
    else if (path.includes("/setttings")) setSuggestedPath("/settings");
    else if (path.includes("/orgnaization")) setSuggestedPath("/organization");
    else if (path.includes("/inviatation")) setSuggestedPath("/invitation");
  }, [pathname, extractedToken, tokenStatus]);

  const handleGoHome = () => {
    router.push("/auth");
  };

  const handleReportIssue = () => {
    const issueData = {
      path: window.location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      tokenStatus: tokenStatus,
      extractedToken: extractedToken?.substring(0, 50),
    };
    localStorage.setItem("last_404_error", JSON.stringify(issueData));
    router.push("/support?issue=404&path=" + encodeURIComponent(window.location.pathname));
  };

  const handleRequestNewInvite = () => {
    router.push("/auth/request-invite");
  };

  // Show loading while checking token
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColors-0 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking invitation...</p>
        </div>
      </div>
    );
  }

  const isInviteRoute = pathname.includes("/accept-invite");
  const hasValidToken = isInviteRoute && tokenStatus?.isValid === true;
  const hasExpiredToken = isInviteRoute && tokenStatus?.isExpired === true;
  const hasInvalidToken = isInviteRoute && tokenStatus?.exists && tokenStatus?.isValid === false && !hasExpiredToken;
  const noTokenFound = isInviteRoute && !tokenStatus?.exists;

  // If token is valid, show a different message (shouldn't happen on 404 page)
  if (hasValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MdCheckCircle className="text-8xl md:text-9xl text-green-500 dark:text-green-400 mx-auto" />
            </motion.div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Valid Invitation Found!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your invitation link is valid, but the page couldn't be loaded correctly.
          </p>
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
            <code className="text-sm text-gray-600 dark:text-gray-400">
              {pathname}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primaryColors-0 text-white rounded-xl font-semibold hover:bg-primaryColors-600 transition-colors"
          >
            <MdRefresh className="inline mr-2" /> Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl"
      >
        {/* Dynamic Icon based on error type */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: hasExpiredToken ? [0, -10, 10, 0] : [0, -5, 5, 0]
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {hasExpiredToken ? (
              <div className="text-8xl md:text-9xl font-bold">
                <MdTimer className="text-yellow-500 dark:text-yellow-400 mx-auto" />
              </div>
            ) : hasInvalidToken || noTokenFound ? (
              <div className="text-8xl md:text-9xl font-bold">
                <MdBlock className="text-red-500 dark:text-red-400 mx-auto" />
              </div>
            ) : (
              <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-primaryColors-0 to-purple-600 bg-clip-text text-transparent">
                404
              </h1>
            )}
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-32 h-32 rounded-full animate-pulse ${
              hasExpiredToken ? 'bg-yellow-500/10' : 
              hasInvalidToken || noTokenFound ? 'bg-red-500/10' : 
              'bg-primaryColors-0/10'
            }`}></div>
          </div>
        </div>

        {/* Dynamic Title based on token status */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {hasExpiredToken ? "Invitation Link Expired" :
           hasInvalidToken ? "Invalid Invitation Link" :
           noTokenFound ? "No Invitation Found" :
           "Page Not Found"}
        </h2>
        
        {/* Dynamic Message based on token status */}
        {hasExpiredToken && (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This invitation link has expired. Invitation links are only valid for 24 hours.
            </p>
            {tokenStatus?.email && (
              <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg inline-block">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Invitation was sent to: <strong>{tokenStatus.email}</strong>
                </p>
              </div>
            )}
          </>
        )}

        {hasInvalidToken && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The invitation link you're using is invalid. It may have already been used or was cancelled.
          </p>
        )}

        {noTokenFound && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No valid invitation token was found in the URL.
          </p>
        )}

        {!hasExpiredToken && !hasInvalidToken && !noTokenFound && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
        )}

        {/* Show extracted token info for debugging */}
        {extractedToken && (hasExpiredToken || hasInvalidToken) && (
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg inline-block">
            <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
              Token: {extractedToken.substring(0, 40)}...
            </code>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MdArrowBack /> Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-primaryColors-0 text-white rounded-xl font-semibold hover:bg-primaryColors-600 transition-colors flex items-center gap-2"
          >
            <MdHome /> Go Home
          </button>

          {(hasExpiredToken || hasInvalidToken) && (
            <button
              onClick={handleRequestNewInvite}
              className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2"
            >
              <MdEmail /> Request New Invite
            </button>
          )}

          <button
            onClick={handleReportIssue}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <MdSupportAgent /> Report Issue
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
            Try these helpful links:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/dashboard" className="text-sm text-primaryColors-0 hover:underline">
              Dashboard
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/dashboard/student/courses" className="text-sm text-primaryColors-0 hover:underline">
              My Courses
            </a>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <a href="/support" className="text-sm text-primaryColors-0 hover:underline">
              Support
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}