// app/auth/[invited_users_verification]/accept-invite/AcceptInviteForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MdVerified, MdSecurity, MdBusiness, MdPerson, MdError } from 'react-icons/md';

interface AcceptInviteFormProps {
  token: string;
  invitationData?: {
    role: string;
    expiresIn: string;
    email: string;
    organizationId: string;
    organizationName: string;
  };
}

interface FetchedInvitationData {
  success: boolean;
  data?: {
    invitation: {
      id: string;
      email: string;
      role: string;
      expiresIn: string;
      remainingTime?: {
        hours: number;
        minutes: number;
      };
    };
    organization: {
      id: string;
      name: string;
      email: string;
      image?: string;
      type?: string;
      description?: string;
    };
  };
  message?: string;
}

export function AcceptInviteForm({ token, invitationData: propInvitationData }: AcceptInviteFormProps) {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<FetchedInvitationData['data'] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    country: '',
    state: '',
  });
  const [error, setError] = useState('');

  // Fetch invitation data if not provided as prop
  useEffect(() => {
    const fetchInvitationData = async () => {
      // If we already have invitation data from props, use it
      if (propInvitationData?.email) {
        console.log("📧 Using invitation data from props:", propInvitationData);
        return;
      }

      // If no token, can't fetch
      if (!token) {
        console.error("❌ No token available to fetch invitation data");
        setFetchError("No invitation token found");
        return;
      }

      setIsFetching(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const baseUrl = apiUrl?.replace(/\/$/, '');
      
      try {
        console.log("🔍 Fetching invitation data from API...");
        const response = await fetch(
          `${baseUrl}/api/organizations/fetch-specific-invited-user-by-token/${encodeURIComponent(token)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result: FetchedInvitationData = await response.json();
        console.log("📡 Fetch response:", result);

        if (result.success && result.data) {
          setFetchedData(result.data);
          setFetchError(null);
          console.log("✅ Invitation data fetched successfully:", {
            email: result.data.invitation.email,
            organization: result.data.organization.name,
          });
        } else {
          setFetchError(result.message || "Failed to fetch invitation data");
          console.error("❌ Failed to fetch invitation:", result.message);
        }
      } catch (err: any) {
        console.error("❌ Error fetching invitation:", err);
        setFetchError(err.message || "Network error occurred");
      } finally {
        setIsFetching(false);
      }
    };

    fetchInvitationData();
  }, [token, propInvitationData]);

  // Get the email from props or fetched data
  const invitedEmail = propInvitationData?.email || fetchedData?.invitation?.email || '';
  const organizationName = propInvitationData?.organizationName || fetchedData?.organization?.name || '';
  const userRole = propInvitationData?.role || fetchedData?.invitation?.role || 'member';

  // Log for debugging
  useEffect(() => {
    console.log("📝 AcceptInviteForm state:", {
      tokenPreview: token?.substring(0, 50),
      hasPropData: !!propInvitationData?.email,
      hasFetchedData: !!fetchedData,
      invitedEmail,
      organizationName,
      userRole,
      isFetching,
      fetchError,
    });
  }, [token, propInvitationData, fetchedData, invitedEmail, organizationName, userRole, isFetching, fetchError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!invitedEmail) {
      setError('Unable to verify invitation. Please try again or contact support.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://goye-platform-backend.onrender.com';
      const baseUrl = apiUrl.replace(/\/$/, '');
      const endpoint = `${baseUrl}/api/organizations/invite-user/signup/${fetchedData?.organization.id}`;
      
      console.log("📡 Submitting signup to:", endpoint);
      
      const requestBody = {
        email_address: invitedEmail,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        phone_number: formData.phone_number,
        country: formData.country,
        state: formData.state,
        role: userRole,
        level: 'Beginner',
      };
      
      console.log("📦 Request body:", { ...requestBody, password: '***' });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text && text.trim()) {
          data = JSON.parse(text);
        } else {
          throw new Error('Empty response from server');
        }
      } else {
        throw new Error('Server returned non-JSON response');
      }
      
      console.log("📡 Signup response:", { status: response.status, data });
      
      if (response.ok) {
        if (data.token) {
          document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        }
        router.push('/auth');
      } else {
        setError(data.message || data.error || 'Failed to create account');
      }
    } catch (err: any) {
      console.error("❌ Error details:", err);
      if (err.message === 'Failed to fetch') {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show loading state while fetching
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColors-0 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  // Show error state if fetch failed and no prop data
  if (fetchError && !propInvitationData?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <MdError className="text-4xl text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Invalid Invitation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {fetchError || "This invitation link is invalid or has expired."}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primaryColors-0 text-white rounded-lg font-semibold hover:bg-primaryColors-600 transition-colors"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  // Show error if no email available
  if (!invitedEmail) {
    return (
      <div className="min-h-screen bg-white/80 dark:bg-shadyColor-0/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <MdError className="text-4xl text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Invitation Data Missing
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load invitation details. Please make sure you have a valid invitation link.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primaryColors-0 text-white rounded-lg font-semibold hover:bg-primaryColors-600 transition-colors"
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 dark:bg-shadyColor-0/80  backdrop-blur-sm rounded-2xl shadow-xl p-8"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
          >
            <MdVerified className="text-4xl text-green-600 dark:text-green-400" />
          </motion.div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            You're Invited!
          </h1>
          
          {organizationName && (
            <div className="flex items-center justify-center gap-2 mb-3">
              <MdBusiness className="text-primaryColors-0" />
              <p className="text-lg text-primaryColors-0 font-semibold">
                {organizationName}
              </p>
            </div>
          )}
          
          <p className="text-gray-600 dark:text-gray-400">
            Complete your account setup to join
          </p>
          
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg inline-flex items-center gap-2">
            <MdSecurity className="text-green-600 dark:text-green-400" />
            <code className="text-xs text-gray-600 dark:text-gray-400">{invitedEmail}</code>
          </div>

          {fetchedData?.invitation?.remainingTime && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              This invitation expires in {fetchedData.invitation.remainingTime.hours}h {fetchedData.invitation.remainingTime.minutes}m
            </div>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone_number"
              required
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="California"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Create a password"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primaryColors-0 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primaryColors-0 text-white rounded-lg font-semibold hover:bg-primaryColors-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Accept Invitation & Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}