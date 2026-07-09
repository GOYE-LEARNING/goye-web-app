// app/auth/[invited_users_verification]/accept-invite/page.tsx
import { notFound } from 'next/navigation';
import { AcceptInviteForm } from './AcceptInviteForm';

interface PageProps {
  params: {
    invited_users_verification: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

async function verifyInvitationWithAPI(token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = apiUrl?.replace(/\/$/, '');
    console.log(`🔍 Verifying token with API: ${baseUrl}/api/organizations/invitations/check`);
    
    const response = await fetch(`${baseUrl}/api/organizations/invitations/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });
    
    const data = await response.json();
    console.log(`📡 API Response:`, { status: response.status, data });
    
    if (!response.ok || !data.exists) {
      return { valid: false, error: data.message || 'Invitation not found' };
    }
    
    return { 
      valid: true, 
      invitation: data.invitation
    };
  } catch (error) {
    console.error('❌ Error checking invitation:', error);
    return { valid: false, error: 'Failed to verify invitation' };
  }
}

// Function to fetch full invitation details
async function fetchInvitationDetails(token: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = apiUrl?.replace(/\/$/, '');
    console.log(`🔍 Fetching invitation details: ${baseUrl}/api/organizations/fetch-specific-invited-user-by-token/${encodeURIComponent(token)}`);
    
    const response = await fetch(
      `${baseUrl}/api/organizations/fetch-specific-invited-user-by-token/${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );
    
    const data = await response.json();
    console.log(`📡 Fetch details response:`, { status: response.status, success: data.success });
    
    if (data.success && data.data) {
      return {
        success: true,
        data: data.data
      };
    }
    
    return {
      success: false,
      error: data.message || 'Failed to fetch invitation details'
    };
  } catch (error) {
    console.error('❌ Error fetching invitation details:', error);
    return { success: false, error: 'Failed to fetch invitation details' };
  }
}

export default async function AcceptInvitePage({ params, searchParams }: PageProps) {
  // Log all params for debugging
  console.log("📦 Full params:", params);
  console.log("🔑 Token from params:", params.invited_users_verification);
  console.log("🔍 Search params:", searchParams);
  
  const token = params.invited_users_verification;
  
  // Case 1: No token provided
  if (!token) {
    console.log('❌ No token provided in params');
    notFound();
  }
  
  console.log(`✅ Token found: ${token.substring(0, 50)}...`);
  
  // Case 2: Verify token with API
  const verification = await verifyInvitationWithAPI(token);
  
  if (!verification.valid) {
    console.log('❌ Token verification failed:', verification.error);
    notFound();
  }
  
  console.log('✅ Token is valid! Fetching invitation details...');
  
  // Case 3: Fetch full invitation details
  const invitationDetails = await fetchInvitationDetails(token);
  
  if (!invitationDetails.success) {
    console.log('❌ Failed to fetch invitation details:', invitationDetails.error);
    // Still show the form with basic info if available
    return (
      <div className="overflow-y-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <AcceptInviteForm 
          token={token}
          invitationData={verification.invitation}
        />
      </div>
    );
  }
  
  console.log('✅ Invitation details fetched successfully!');
  
  // Prepare invitation data for the form
  const invitationData = {
    role: verification.invitation?.role || invitationDetails.data?.invitation?.role || 'member',
    expiresIn: verification.invitation?.expiresIn || invitationDetails.data?.invitation?.expiresIn || '',
    email: invitationDetails.data?.invitation?.email || '',
    organizationId: invitationDetails.data?.organization?.id || '',
    organizationName: invitationDetails.data?.organization?.name || '',
  };
  
  console.log('📋 Invitation data:', {
    email: invitationData.email,
    organizationName: invitationData.organizationName,
    role: invitationData.role,
  });
  
  // Token is valid and we have full details - show the signup form with OTP
  return (
    <div className="overflow-y-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <AcceptInviteForm 
        token={token}
        invitationData={invitationData}
      />
    </div>
  );
}