"use client";

import { useEffect, useState } from "react";
import { FaRegFileAlt } from "react-icons/fa";
import { GoDownload } from "react-icons/go";
import { HiOutlineBookOpen } from "react-icons/hi";
import { IoEye } from "react-icons/io5";

interface Props {
  courseId: string;
}

interface Material {
  material_title: string;
  material_description: string;
  material_document: string;
  material_pages: number;
  material_file_size?: number;
  material_file_name?: string;
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  materialTitle: string;
}

// Helper to get a viewable PDF URL (using Google Docs viewer)
function getViewablePDFUrl(url: string): string {
  // Encode the PDF URL for Google Docs viewer
  const encodedUrl = encodeURIComponent(url);
  return `https://docs.google.com/viewer?embedded=true&url=${encodedUrl}`;
}

// Helper to get download URL (forces attachment)
function getDownloadUrl(url: string): string {
  if (url.includes('cloudinary.com')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}fl_attachment=1`;
  }
  return url;
}

// PDF Modal Component with Google Docs viewer (works 100%)
function PDFModal({ isOpen, onClose, pdfUrl, materialTitle }: PDFModalProps) {
  const [loadError, setLoadError] = useState(false);
  const viewableUrl = getViewablePDFUrl(pdfUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-secondaryColors-0 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {materialTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4">
          {loadError ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
              <p className="text-red-500 dark:text-red-400 mb-4">Failed to load PDF preview.</p>
              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Open Original PDF
              </button>
            </div>
          ) : (
            <iframe
              src={viewableUrl}
              className="w-full h-[70vh] border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              title={materialTitle}
              onError={() => setLoadError(true)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardCourseMaterials({ courseId }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [material, setMaterial] = useState<Material[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/course/get-course/${courseId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        console.log(data);
        return;
      }

      const materialsWithInfo = await Promise.all(
        (data.data?.material || []).map(async (m: Material) => {
          let fileSize = 0;
          if (m.material_document) {
            try {
              const response = await fetch(m.material_document, { method: 'HEAD' });
              const contentLength = response.headers.get('content-length');
              fileSize = contentLength ? parseInt(contentLength) : 0;
            } catch (error) {
              console.error('Error fetching file info:', error);
            }
          }
          return { ...m, material_file_size: fileSize };
        })
      );

      setMaterial(materialsWithInfo);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const handleViewPDF = (pdfUrl: string, title: string) => {
    // Use original URL; modal will use Google Docs viewer
    setSelectedPDF({ url: pdfUrl, title });
  };

  const handleDownloadPDF = (pdfUrl: string, fileName: string) => {
    setDownloading(fileName);
    try {
      const downloadUrl = getDownloadUrl(pdfUrl);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download. Please try again later.');
    } finally {
      setDownloading(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="dashboard_content_mainbox">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primaryColors-0"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard_hr my-5"></div>
      <div className="dashboard_content_mainbox">
        <h1 className="text-textSlightDark-0 dark:text-white text-[18px] font-bold mb-6">
          All Materials
        </h1>

        {material.length === 0 ? (
          <div className="text-center py-12">
            <FaRegFileAlt className="mx-auto text-4xl text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No materials available for this course yet.
            </p>
          </div>
        ) : (
          material.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 my-5">
              <h1 className="text-[16px] text-textSlightDark-0 dark:text-white font-[600]">
                {m.material_title}
              </h1>
              <p className="text-[#71748C] dark:text-gray-300 text-[14px]">
                {m.material_description}
              </p>
              <p className="flex gap-4 text-[#71748C] dark:text-gray-400 text-[14px]">
                <span className="flex items-center gap-2">
                  <FaRegFileAlt />
                  {formatFileSize(m.material_file_size || 0)}
                </span>
                <span className="flex items-center gap-2">
                  <HiOutlineBookOpen /> {m.material_pages || '?'} Pages
                </span>
              </p>
              <div className="flex gap-2 items-center">
                <button
                  className="form_more bg-transparent border border-[#ccc]/10 dark:border-gray-700 text-primaryColors-0 font-semibold flex justify-center items-center gap-2 px-4 py-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleViewPDF(m.material_document, m.material_title)}
                >
                  <IoEye /> View
                </button>
                <button
                  className="form_more bg-primaryColors-0 text-white flex justify-center items-center gap-2 px-4 py-2 rounded-md disabled:opacity-50 transition-colors hover:bg-primaryColors-700"
                  onClick={() => handleDownloadPDF(m.material_document, `${m.material_title}.pdf`)}
                  disabled={downloading === m.material_title}
                >
                  {downloading === m.material_title ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <GoDownload /> Download
                    </>
                  )}
                </button>
              </div>
              <div className="dashboard_hr my-5"></div>
            </div>
          ))
        )}
      </div>

      {/* PDF Modal with Google Docs viewer */}
      {selectedPDF && (
        <PDFModal
          isOpen={!!selectedPDF}
          onClose={() => setSelectedPDF(null)}
          pdfUrl={selectedPDF.url}
          materialTitle={selectedPDF.title}
        />
      )}
    </>
  );
}