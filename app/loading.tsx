"use client";

import Image from "next/image";
import logo from "@/public/images/goye_final_logo.png";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const [dots, setDots] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Inspirational quotes that change every few seconds
  const quotes = [
    { text: "Getting ready to transform your faith journey...", icon: "✨" },
    { text: "Preparing life-changing content just for you...", icon: "📖" },
    { text: "Loading your pathway to spiritual growth...", icon: "🌱" },
    { text: "Setting up your encounter with JESUS...", icon: "🙏" },
    { text: "Almost ready to inspire your soul...", icon: "💫" },
    { text: "Preparing blessings for your journey...", icon: "🎁" },
    { text: "Getting your daily devotion ready...", icon: "☀️" },
    { text: "Loading messages of hope and faith...", icon: "🕊️" },
  ];

  // Animated dots effect
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  // Rotate quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    return () => clearInterval(quoteInterval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-screen z-50 bg-gradient-to-br from-orange-900 via-orange-800 to-black overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600 rounded-full filter blur-3xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400 rounded-full filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4">
        {/* Logo with breathing animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-orange-500 rounded-full blur-2xl opacity-30 animate-ping"></div>
          <div className="relative bg-gray-900/50 rounded-full p-4 backdrop-blur-sm">
            <Image 
              src={logo} 
              alt="GOYE Logo" 
              height={100} 
              width={100} 
              className="relative z-10 animate-breathe"
              priority
            />
          </div>
        </div>

        {/* Welcome message */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-fade-in">
            Welcome to GOYE
          </h1>
          <p className="text-orange-200/80 text-lg animate-slide-up">
            Your faith journey begins here{dots}
          </p>
        </div>

        {/* Animated quote card */}
        <div className="max-w-md mx-auto mb-12 animate-fade-in-up">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/20 shadow-xl">
            <div className="text-4xl mb-3 text-center animate-bounce-soft">
              {quotes[quoteIndex].icon}
            </div>
            <p className="text-orange-100/90 text-center text-lg font-medium leading-relaxed">
              {quotes[quoteIndex].text}
            </p>
          </div>
        </div>

        {/* Animated dots progress indicator */}
        <div className="flex space-x-3 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>

        {/* Loading tip */}
        <p className="text-orange-300/50 text-sm mt-8 text-center animate-fade-in">
          <span className="inline-block animate-spin-slow mr-2">⚡</span>
          Please don't refresh the page
        </p>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-breathe {
          animation: breathe 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.4s both;
        }
        
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}