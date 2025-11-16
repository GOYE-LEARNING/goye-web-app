"use client";

import React, { useState, useEffect } from "react";
import { BsPlus } from "react-icons/bs";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Pic from "@/public/images/notfound.png";
import { IoIosRefresh } from "react-icons/io";
import { MdDelete } from "react-icons/md";

function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}

interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface Document {
  id: number;
  material_document: string;
  document_preview?: string | null;
  documentFile?: File; // ✅ Added for file upload
}

interface Material {
  id: number;
  material_title: string;
  material_description: string;
  material_page: string;
  material_document: Document[];
  visible: boolean;
}

export default function CourseStep3({ formData, setFormData }: Props) {
  const [material, setMaterial] = usePersistentState<Material[]>(
    "course_materials",
    []
  );

  useEffect(() => {
    setFormData((prev: any) => ({...prev, material: material}))
  }, [material])

  const materialForm = [
    { label: "Material title", type: "text", name: "material_title" },
    { label: "Description", type: "text", name: "material_description" },
    { label: "Number of pages", type: "number", name: "material_page" },
  ];

  const createMaterial = () => {
    setMaterial((prev) => [
      ...prev,
      {
        id: Date.now(),
        material_title: "",
        material_description: "",
        material_page: "",
        material_document: [],
        visible: true,
      },
    ]);
  };

  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id: number
  ) => {
    const { name, value } = e.target;
    setMaterial((prev) =>
      prev.map((mat) => (mat.id === id ? { ...mat, [name]: value } : mat))
    );
  };

  const handleMaterialShow = (id: number) => {
    setMaterial((prev) =>
      prev.map((mat) =>
        mat.id === id ? { ...mat, visible: !mat.visible } : mat
      )
    );
  };

  const deleteMaterial = (id: number) => {
    setMaterial((prev) => prev.filter((mat) => mat.id !== id));
  };

  const createDocument = (materialId: number) => {
    setMaterial((prev) =>
      prev.map((mat) =>
        mat.id === materialId
          ? {
              ...mat,
              material_document: [
                ...mat.material_document,
                { id: Date.now(), material_document: "", document_preview: null },
              ],
            }
          : mat
      )
    );
  };

  // ✅ FIXED: Handle document upload with file object
  const handleDocumentUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    materialId: number,
    documentId: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setMaterial((prev) =>
        prev.map((mat) =>
          mat.id === materialId
            ? {
                ...mat,
                material_document: mat.material_document.map((doc) =>
                  doc.id === documentId
                    ? {
                        ...doc,
                        material_document: previewURL, // For preview
                        document_preview: previewURL,  // For preview display
                        documentFile: file,           // For actual upload
                      }
                    : doc
                ),
              }
            : mat
        )
      );
    }
  };

  const handleRemoveDocument = (materialId: number, documentId: number) => {
    setMaterial((prev) =>
      prev.map((mat) =>
        mat.id === materialId
          ? {
              ...mat,
              material_document: mat.material_document.map((doc) =>
                doc.id === documentId
                  ? { 
                      ...doc, 
                      material_document: "", 
                      document_preview: null,
                      documentFile: undefined 
                    }
                  : doc
              ),
            }
          : mat
      )
    );
  };

  const deleteDocument = (materialId: number, documentId: number) => {
    setMaterial((prev) =>
      prev.map((mat) =>
        mat.id === materialId
          ? {
              ...mat,
              material_document: mat.material_document.filter(
                (doc) => doc.id !== documentId
              ),
            }
          : mat
      )
    );
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        <div key="module">
          <div className="flex justify-between items-center">
            <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
              Material
            </h1>
            <span
              className="flex items-center gap-2 cursor-pointer"
              onClick={createMaterial}
            >
              <BsPlus /> Add Material
            </span>
          </div>

          {material.length === 0 ? (
            <div className="flex justify-center items-center flex-col gap-1">
              <Image src={Pic} alt="pic" height={100} width={100} />
              <h1 className="text-textSlightDark-0 font-semibold text-[18px]">
                No Materials Found
              </h1>
              <p className="text-textGrey-0">Create a Material</p>
            </div>
          ) : (
            <div>
              {material.map((mat, i) => (
                <div key={mat.id} className="w-full my-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="h-[20px] w-[20px] bg-boldGreen-0 text-white flex justify-center items-center rounded-[2px]">
                        {i + 1}
                      </span>
                      <h1>Material</h1>
                      <div
                        className="flex flex-col text-[0.5em] cursor-pointer"
                        onClick={() => handleMaterialShow(mat.id)}
                      >
                        <FaChevronUp />
                        <FaChevronDown />
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMaterial(mat.id)}
                      className="text-red-500"
                    >
                      <IoTrashOutline />
                    </button>
                  </div>

                  {mat.visible && (
                    <motion.div
                      key="material-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="my-3 flex flex-col gap-3">
                        {materialForm.map((form, index) => (
                          <div
                            className="flex flex-col border border-[#D2D5DA] justify-between w-full py-[8px] px-[12px]"
                            key={index}
                          >
                            <label className="text-textGrey-0 text-[12px]">
                              {form.label}
                            </label>
                            {form.name === "material_description" ? (
                              <textarea
                                name={form.name}
                                value={mat.material_description}
                                onChange={(e) => handleMaterialChange(e, mat.id)}
                                className="resize-none h-[154px] outline-none border-none"
                              />
                            ) : (
                              <input
                                type={form.type}
                                name={form.name}
                                value={(mat as any)[form.name]}
                                onChange={(e) => handleMaterialChange(e, mat.id)}
                                className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px]"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="dashboard_hr my-3"></div>

                      <div className="my-3 w-full">
                        {mat.material_document.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-[12px] bg-shadyColor-0 flex flex-col gap-2 relative w-full my-5"
                          >
                            {!doc.document_preview ? (
                              <label
                                htmlFor={`document-${doc.id}`}
                                className="border-dashed border border-[#D2D5DA] bg-white py-[8px] px-[12px] h-[88px] flex flex-col items-center justify-center gap-[3px] cursor-pointer"
                              >
                                <h1 className="font-[500] text-[14px] text-textSlightDark-0">
                                  Upload Document
                                </h1>
                                <p className="text-textGrey-0 text-[12px]">
                                  Supports PDF, DOC, DOCX
                                </p>
                                <input
                                  id={`document-${doc.id}`}
                                  type="file"
                                  accept=".pdf,.doc,.docx,.txt"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleDocumentUpload(e, mat.id, doc.id)
                                  }
                                />
                              </label>
                            ) : (
                              <div className="relative w-full h-[200px] border border-[#D2D5DA] overflow-hidden rounded-md">
                                <iframe
                                  src={doc.document_preview}
                                  className="object-cover w-full h-full"
                                  title="Document preview"
                                ></iframe>
                                <div className="flex justify-center items-center gap-2 w-full h-full text-white absolute top-0 left bg-[#0000004D]">
                                  <button
                                    onClick={() =>
                                      handleRemoveDocument(mat.id, doc.id)
                                    }
                                    className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66]"
                                  >
                                    <MdDelete /> Remove
                                  </button>
                                  <label
                                    htmlFor={`document-replace-${doc.id}`}
                                    className="h-[30px] w-[113px] flex items-center justify-center gap-2 bg-[#FFFFFF66] cursor-pointer"
                                  >
                                    <IoIosRefresh /> Retake
                                  </label>
                                  <input
                                    id={`document-replace-${doc.id}`}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleDocumentUpload(e, mat.id, doc.id)
                                    }
                                  />
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => deleteDocument(mat.id, doc.id)}
                              className="form_more bg-[#DA0E290D] text-[#DA0E29] text-[15px] font-[600] w-full flex items-center justify-center gap-2"
                            >
                              <IoTrashOutline /> Delete
                            </button>
                          </div>
                        ))}
                      </div>

                      <span
                        onClick={() => createDocument(mat.id)}
                        className="h-[48px] bg-boldShadyColor-0 text-primaryColors-0 text-[15px] font-semibold flex justify-center items-center gap-2 w-full"
                      >
                        <BsPlus /> Add Document
                      </span>
                    </motion.div>
                  )}

                  <div className="dashboard_hr my-5"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}