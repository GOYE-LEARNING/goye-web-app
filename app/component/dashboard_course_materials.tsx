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

// PDF Modal Component using iframe
function PDFModal({ isOpen, onClose, pdfUrl, materialTitle }: PDFModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{materialTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-[70vh] border rounded-lg"
            title={materialTitle}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
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

      // Process materials to get file size
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
          
          return {
            ...m,
            material_file_size: fileSize,
          };
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
    setSelectedPDF({ url: pdfUrl, title });
  };

  const handleDownloadPDF = async (pdfUrl: string, fileName: string) => {
    setDownloading(fileName);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
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
        <h1 className="text-textSlightDark-0 text-[18px] font-bold mb-6">All Materials</h1>
        
        {material.length === 0 ? (
          <div className="text-center py-12">
            <FaRegFileAlt className="mx-auto text-4xl text-gray-400 mb-3" />
            <p className="text-gray-500">No materials available for this course yet.</p>
          </div>
        ) : (
          material.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 my-5">
              <h1 className="text-[16px] text-textSlightDark-0 font-[600]">
                {m.material_title}
              </h1>
              <p className="text-[#71748C] text-[14px]">
                {m.material_description}
              </p>
              <p className="flex gap-4 text-[#71748C] text-[14px]">
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
                  className="form_more bg-transparent border border-[#EFEFF2] text-primaryColors-0 font-semibold flex justify-center items-center gap-2"
                  onClick={() => handleViewPDF(m.material_document, m.material_title)}
                >
                  <IoEye /> View
                </button>
                <button 
                  className="form_more bg-primaryColors-0 text-white flex justify-center items-center gap-2 disabled:opacity-50"
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

      {/* PDF Modal */}
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