'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdVerified,
  MdSecurity,
  MdBusiness,
  MdPerson,
  MdError,
  MdCheckCircle,
} from 'react-icons/md';
import { IoReload } from 'react-icons/io5';
import { FaCheck } from 'react-icons/fa6';
import { useModal } from '@/app/context/SimpleModalContext';
import { saveOtpToken, getOtpToken, clearOtpToken } from '@/app/utils/database/db';

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

export function AcceptInviteForm({
  token,
  invitationData: propInvitationData,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const params = useParams();
  const { showModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [fetchedData, setFetchedData] = useState<
    FetchedInvitationData['data'] | null
  >(null);
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

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [tempUserId, setTempUserId] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [emailForOTP, setEmailForOTP] = useState('');
  const [organizationId, setOrganizationId] = useState('');

  // Fetch invitation data if not provided as prop
  useEffect(() => {
    const fetchInvitationData = async () => {
      // If we already have invitation data from props with organizationId
      if (propInvitationData?.email && propInvitationData?.organizationId) {
        console.log('📧 Using invitation data from props:', propInvitationData);
        setEmailForOTP(propInvitationData.email);
        setOrganizationId(propInvitationData.organizationId);
        setFetchedData({
          invitation: {
            id: '',
            email: propInvitationData.email,
            role: propInvitationData.role,
            expiresIn: propInvitationData.expiresIn,
          },
          organization: {
            id: propInvitationData.organizationId,
            name: propInvitationData.organizationName,
            email: '',
          },
        });
        return;
      }

      // If no token, can't fetch
      if (!token) {
        console.error('❌ No token available to fetch invitation data');
        setFetchError('No invitation token found');
        return;
      }

      setIsFetching(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = apiUrl?.replace(/\/$/, '');

      try {
        console.log('🔍 Fetching invitation data from API...');
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
        console.log('📡 Fetch response:', result);

        if (result.success && result.data) {
          setFetchedData(result.data);
          setEmailForOTP(result.data.invitation.email);
          setOrganizationId(result.data.organization.id);
          setFetchError(null);
          console.log('✅ Invitation data fetched successfully:', {
            email: result.data.invitation.email,
            organization: result.data.organization.name,
            organizationId: result.data.organization.id,
          });
        } else {
          setFetchError(result.message || 'Failed to fetch invitation data');
          console.error('❌ Failed to fetch invitation:', result.message);
        }
      } catch (err: any) {
        console.error('❌ Error fetching invitation:', err);
        setFetchError(err.message || 'Network error occurred');
      } finally {
        setIsFetching(false);
      }
    };

    fetchInvitationData();
  }, [token, propInvitationData]);

  // Timer for OTP expiry
  useEffect(() => {
    if (showOTPModal && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showOTPModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendOTP = async (email: string, userId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = apiUrl?.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/api/user/sendOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showModal('Error', data.message || 'Failed to send OTP', 'error');
        return false;
      }

      // Store the OTP session token
      await saveOtpToken(data.sessionToken);

      setEmailForOTP(email);

      return true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      showModal('Error', error.message || 'Failed to send OTP', 'error');
      return false;
    }
  };

  const handleOTPInputChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '');
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && /^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const resendOTP = async () => {
    if (!emailForOTP || !tempUserId) return;

    setOtpError('');
    setOtpSuccess('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = apiUrl?.replace(/\/$/, '');

      const response = await fetch(`${baseUrl}/api/user/sendOtp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForOTP }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Failed to resend OTP');
        return;
      }

      await saveOtpToken(data.sessionToken);

      setResendCount((prev) => prev + 1);
      setTimeLeft(600);
      setCanResend(false);
      setOtpSuccess('New OTP sent successfully!');

      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setTimeout(() => setOtpSuccess(''), 3000);
    } catch (error: any) {
      setOtpError(error.message || 'Failed to resend OTP');
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOTP(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = apiUrl?.replace(/\/$/, '');

      const otpSessionToken = await getOtpToken();

      if (!otpSessionToken) {
        setOtpError('No OTP session found. Please request a new OTP.');
        setIsVerifyingOTP(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/user/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken: otpSessionToken,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      setOtpSuccess('OTP verified successfully!');

      await clearOtpToken();

      setTimeout(() => {
        setShowOTPModal(false);
        showModal(
          'Verification Complete',
          'Your account has been successfully verified! You can now access the dashboard.',
          'success'
        );
        router.push('/auth');
      }, 1500);
    } catch (error: any) {
      setOtpError(error.message || 'Failed to verify OTP');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const invitedEmail =
      propInvitationData?.email || fetchedData?.invitation?.email || '';
    const orgId =
      propInvitationData?.organizationId || fetchedData?.organization?.id || '';

    if (!invitedEmail) {
      setError(
        'Unable to verify invitation. Please try again or contact support.'
      );
      return;
    }

    if (!orgId) {
      setError(
        'Organization ID not found. Please try again or contact support.'
      );
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const baseUrl = apiUrl?.replace(/\/$/, '');

      console.log('🔍 Checking if user already exists...');
      const checkUserResponse = await fetch(
        `${baseUrl}/api/user/check-email?email=${encodeURIComponent(invitedEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const checkUserData = await checkUserResponse.json();
      console.log('📡 User check response:', checkUserData);

      let userId = null;

      if (checkUserData.exists) {
        userId = checkUserData.userId;
        console.log('✅ User already exists with ID:', userId);

        if (checkUserData.hasOrganization) {
          setError(
            'This user is already associated with an organization. Please contact support.'
          );
          setIsLoading(false);
          return;
        }

        const updateUserResponse = await fetch(
          `${baseUrl}/api/user/update-invitation/${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organizationId: orgId,
              invited: true,
              role: 'invited_user',
            }),
          }
        );

        const updateData = await updateUserResponse.json();

        if (!updateUserResponse.ok) {
          setError(updateData.message || 'Failed to update user invitation');
          setIsLoading(false);
          return;
        }

        console.log('✅ User updated with invitation:', updateData);

        const otpSent = await sendOTP(invitedEmail, userId);
        if (otpSent) {
          setTempUserId(userId);
          setShowOTPModal(true);
        } else {
          setError('Failed to send verification OTP. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      console.log('📝 User doesnt exist, creating new account...');

      const endpoint = `${baseUrl}/api/organizations/invite-user/signup/${orgId}`;
      console.log('📡 Submitting signup to:', endpoint);

      const requestBody = {
        email_address: invitedEmail,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        phone_number: formData.phone_number,
        country: formData.country,
        state: formData.state,
        role: 'invited_user',
        level: 'Beginner',
      };

      console.log('📦 Request body:', { ...requestBody, password: '***' });

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

      console.log('📡 Signup response:', { status: response.status, data });

      if (response.ok) {
        if (data.user?.id) {
          userId = data.user.id;
          setTempUserId(userId);
          const otpSent = await sendOTP(invitedEmail, userId);
          if (otpSent) {
            setShowOTPModal(true);
          } else {
            setError('Failed to send verification OTP. Please try again.');
          }
        } else {
          setError('User created but no user ID returned');
        }
      } else {
        if (data.error?.includes('email') || data.message?.includes('email')) {
          setError(
            'This email is already registered. Please try logging in instead.'
          );
        } else {
          setError(data.message || data.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      console.error('❌ Error details:', err);
      if (err.message === 'Failed to fetch') {
        setError(
          'Unable to connect to the server. Please check your internet connection and try again.'
        );
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

  // Get data from props or fetched data
  const invitedEmail =
    propInvitationData?.email || fetchedData?.invitation?.email || '';
  const organizationName =
    propInvitationData?.organizationName ||
    fetchedData?.organization?.name ||
    '';
  const userRole =
    propInvitationData?.role || fetchedData?.invitation?.role || 'member';
  const orgId =
    propInvitationData?.organizationId || fetchedData?.organization?.id || '';

  // Show loading state while fetching
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColors-0 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your invitation...
          </p>
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
            {fetchError || 'This invitation link is invalid or has expired.'}
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
            Unable to load invitation details. Please make sure you have a valid
            invitation link.
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
    <>
      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOTPModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
              onClick={() => {}}
            />
            <motion.div
              ref={modalRef as any}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md"
            >
              <div className="bg-[#1a1d26] rounded-xl shadow-2xl overflow-hidden border border-[#252830] p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-orange-500 text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Verify Your Account
                  </h2>
                  <p className="text-[#B8BCC8] text-sm mt-2">
                    Enter the 6-digit code sent to{' '}
                    <span className="text-orange-500">{emailForOTP}</span>
                  </p>
                  <p className="text-[#9CA3B0] text-xs mt-1">
                    Please check your email or paste the code below
                  </p>
                </div>

                {otpError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                    {otpError}
                  </div>
                )}

                {otpSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">
                    {otpSuccess}
                  </div>
                )}

                <div className="flex justify-center gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOTPInputChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl bg-[#252830] border border-[#3a3d4a] rounded-lg text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                      autoFocus={index === 0}
                      disabled={timeLeft === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-[#B8BCC8] mb-6">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatTime(timeLeft)}
                  </span>
                  <button
                    onClick={resendOTP}
                    disabled={!canResend || isVerifyingOTP}
                    className={`flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors ${
                      !canResend ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <IoReload
                      className={`${isVerifyingOTP ? 'animate-spin' : ''}`}
                    />
                    {canResend
                      ? 'Resend OTP'
                      : `Resend in ${formatTime(timeLeft)}`}
                  </button>
                </div>

                <button
                  onClick={verifyOTP}
                  disabled={isVerifyingOTP || timeLeft === 0}
                  className="w-full bg-orange-500 text-[#121318] py-3 rounded-lg font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifyingOTP ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#121318] border-t-transparent"></span>
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-[#9CA3B0] text-xs">
                    Didn't receive the code? Check your spam folder or contact
                    support
                  </p>
                  <button
                    onClick={() => {
                      setShowOTPModal(false);
                      setError('Verification cancelled. Please try again.');
                    }}
                    className="text-[#9CA3B0] text-sm hover:text-white transition-colors mt-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Signup Form */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white/80 dark:bg-shadyColor-0/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
              <code className="text-xs text-gray-600 dark:text-gray-400">
                {invitedEmail}
              </code>
            </div>

            {fetchedData?.invitation?.remainingTime && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                This invitation expires in{' '}
                {fetchedData.invitation.remainingTime.hours}h{' '}
                {fetchedData.invitation.remainingTime.minutes}m
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
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Accept Invitation & Verify'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </>
  );
}