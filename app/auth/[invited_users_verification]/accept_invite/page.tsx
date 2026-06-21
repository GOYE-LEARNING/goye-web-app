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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
    console.log(`🔍 Verifying token with API: ${apiUrl}/api/organizations/invitations/check`);
    
    const response = await fetch(`${apiUrl}/api/organizations/invitations/check`, {
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
  
  console.log('✅ Token is valid! Showing form...');
  
  // Token is valid - show the signup form
  return (
    <AcceptInviteForm 
      token={token}
      invitationData={verification.invitation}
    />
  );
}