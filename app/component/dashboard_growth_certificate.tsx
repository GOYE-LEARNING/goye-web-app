"use client";

import { useEffect, useState } from "react";
import { FiDownload, FiShare2, FiCalendar, FiAward, FiX, FiZoomIn, FiExternalLink } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "./loader";

interface Certificate {
  id: string;
  certificateType: string;
  certificateImageURL: string;
  createdAt: string;
  course: {
    id: string;
    course_title: string;
    course_image: string | null;
  };
}

export default function DashboardGrowthCertificate() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/certificate/user/certificates`, {
        method: "GET",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch certificates");
      }
      
      setCertificates(data.data || []);
      
    } catch (error) {
      console.error("Error fetching certificates:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const downloadCertificate = (certificate: Certificate) => {
    const link = document.createElement('a');
    link.href = certificate.certificateImageURL;
    link.download = `certificate_${certificate.course.course_title.replace(/\s/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareCertificate = async (certificate: Certificate) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Course Certificate - ${certificate.course.course_title}`,
          text: `I completed ${certificate.course.course_title} on GOYE Platform! 🎉`,
          url: certificate.certificateImageURL,
        });
      } catch (err) {
        console.log("Sharing cancelled");
      }
    } else {
      await navigator.clipboard.writeText(certificate.certificateImageURL);
      alert("Certificate URL copied to clipboard!");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader height={40} width={40} border_width={3} full_border_color="transparent" small_border_color="#30A46F"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchCertificates}
          className="mt-4 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primaryColors-0/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primaryColors-0/20 to-green-500/20 rounded-full flex items-center justify-center mb-4">
          <FiAward className="w-10 h-10 text-primaryColors-0" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No Certificates Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Complete courses to earn certificates!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-white dark:bg-secondaryColors-0 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCertificate(cert)}
          >
            {/* Certificate Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <img
                src={cert.certificateImageURL}
                alt={`Certificate for ${cert.course.course_title}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay with zoom icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/20 backdrop-blur-md rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                  <FiZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Certificate Badge */}
              <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                Certificate
              </div>
            </div>

            {/* Certificate Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg line-clamp-1 mb-1">
                {cert.course.course_title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <FiCalendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(cert.createdAt)}</span>
              </div>

              {/* Action Buttons - stop propagation to prevent modal opening when clicking buttons */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => downloadCertificate(cert)}
                  className="flex-1 py-2 bg-primaryColors-0 text-white rounded-lg font-medium hover:bg-primaryColors-0/90 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiDownload className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => shareCertificate(cert)}
                  className="flex-1 py-2 border border-primaryColors-0 text-primaryColors-0 rounded-lg font-medium hover:bg-primaryColors-0/10 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Modal - High z-index for proper display */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedCertificate(null)}
              style={{ zIndex: 9998 }}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative bg-white dark:bg-secondaryColors-0 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              style={{ zIndex: 9999 }}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-secondaryColors-0 sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primaryColors-0 to-green-500 bg-clip-text text-transparent">
                    {selectedCertificate.course.course_title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Certificate of Completion • {formatDate(selectedCertificate.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Certificate Image Full View - Scrollable */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)] bg-gray-100 dark:bg-gray-900">
                <div className="flex justify-center items-center min-h-[400px]">
                  <img
                    src={selectedCertificate.certificateImageURL}
                    alt={`Certificate for ${selectedCertificate.course.course_title}`}
                    className="w-auto h-auto max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-secondaryColors-0 sticky bottom-0 z-10">
                <button
                  onClick={() => downloadCertificate(selectedCertificate)}
                  className="flex-1 py-3 bg-gradient-to-r from-primaryColors-0 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FiDownload className="w-5 h-5" />
                  Download Certificate
                </button>
                <button
                  onClick={() => shareCertificate(selectedCertificate)}
                  className="flex-1 py-3 border-2 border-primaryColors-0 text-primaryColors-0 rounded-xl font-semibold hover:bg-primaryColors-0/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FiShare2 className="w-5 h-5" />
                  Share
                </button>
                <button
                  onClick={() => window.open(selectedCertificate.certificateImageURL, '_blank')}
                  className="py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FiExternalLink className="w-5 h-5" />
                  Open in New Tab
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}