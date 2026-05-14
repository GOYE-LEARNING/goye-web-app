"use client"
import Image from "next/image";
import Link from "next/link";
import pic from "@/public/images/401.png";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121318] to-[#1a1d26] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated icon container */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
          <Image 
            src={pic} 
            alt="Unauthorized Access" 
            className="relative z-10 mx-auto w-48 h-48 object-contain"
            priority
          />
        </div>

        {/* Error code */}
        <div className="mb-6">
          <div className="mt-2 inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="text-red-400 text-sm font-medium">UNAUTHORIZED ACCESS</span>
          </div>
        </div>

        {/* Main message */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Access Denied
        </h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link 
            href="/auth"
            className="block w-full bg-transparent border border-gray-700 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-gray-800/50 hover:border-gray-600"
          >
            Sign In to Different Account
          </Link>
        </div>

        {/* Help text */}
        <p className="text-gray-500 text-sm mt-8">
          Need access?{' '}
          <button 
            onClick={() => window.location.href = "mailto:support@goye.com"}
            className="text-[#FFA500] hover:underline transition-all"
          >
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
}