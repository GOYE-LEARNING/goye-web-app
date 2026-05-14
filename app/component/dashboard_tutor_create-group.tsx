"use client";

import React, { useEffect, useState, useRef } from "react";
import { FaUpload, FaTrash, FaImage } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import Image from "next/image";
import Loader from "./loader";

interface Props {
  cancel: () => void;
  groupId?: string;
  onAddGroup?: (addGroup?: any) => void;
  onEditGroup?: (editGroup?: any) => void;
}

interface FormData {
  group_title: string;
  group_description: string;
  group_short_description: string;
  group_image: string;
  group_image_file?: File | null;
}

export default function DashboardTutorCreateGroup({
  cancel,
  groupId,
  onAddGroup,
  onEditGroup,
}: Props) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    group_title: "",
    group_description: "",
    group_short_description: "",
    group_image: "",
    group_image_file: null,
  });

  // Fetch group data if groupId is provided (edit mode)
  const fetchGroupData = async () => {
    if (!groupId) {
      setIsEditMode(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/socials/get-group/${groupId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Error fetching group data");
        setIsEditMode(false);
        setIsLoading(false);
        return;
      }

      if (data.data) {
        setFormData({
          group_title: data.data.group_title || "",
          group_description: data.data.group_description || "",
          group_short_description: data.data.group_short_description || "",
          group_image: data.data.group_image || "",
          group_image_file: null,
        });
        
        if (data.data.group_image) {
          setImagePreview(data.data.group_image);
        }
        setIsEditMode(true);
      }
    } catch (error) {
      console.error("Error fetching group:", error);
      setIsEditMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const validateAndSetImage = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setFormData({ ...formData, group_image_file: file });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData({ ...formData, group_image_file: null, group_image: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (groupId: string, file: File): Promise<string> => {
    setIsUploading(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        try {
          const res = await fetch(`${API_URL}/api/socials/upload-group-image/${groupId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              file: base64String,
              fileName: file.name,
              mimeType: file.type,
            }),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            reject(new Error(data.message || "Failed to upload image"));
            return;
          }
          
          resolve(data.data?.url || data.data || "");
        } catch (error) {
          reject(error);
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isEditMode && groupId) {
      await handleUpdateGroup();
    } else {
      await handleCreateGroup();
    }
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Create the group without image first
      const createRes = await fetch(`${API_URL}/api/socials/create-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          group_title: formData.group_title,
          group_description: formData.group_description,
          group_short_description: formData.group_short_description,
          group_image: "", // Empty initially
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        console.error("Error creating group:", createData);
        alert("Failed to create group. Please try again.");
        setIsLoading(false);
        return;
      }

      const newGroupId = createData.group?.id;
      
      // Step 2: If there's an image, upload it
      let uploadedImageUrl = "";
      if (formData.group_image_file && newGroupId) {
        try {
          uploadedImageUrl = await uploadImage(newGroupId, formData.group_image_file);
          
          // Step 3: Update the group with the uploaded image URL
          if (uploadedImageUrl) {
            await fetch(`${API_URL}/api/socials/update-group/${newGroupId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                group_title: formData.group_title,
                group_description: formData.group_description,
                group_short_description: formData.group_short_description,
                group_image: uploadedImageUrl,
              }),
            });
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert("Group created but image upload failed. You can add it later.");
        }
      }

      if (onAddGroup) {
        onAddGroup({
          ...createData.group,
          group_image: uploadedImageUrl || createData.group?.group_image
        });
      }

      resetForm();
      cancel();
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Failed to create group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Update group basic info
      const updateRes = await fetch(`${API_URL}/api/socials/update-group/${groupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          group_title: formData.group_title,
          group_description: formData.group_description,
          group_short_description: formData.group_short_description,
          group_image: formData.group_image,
        }),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        console.error("Error updating group:", updateData);
        alert("Failed to update group. Please try again.");
        setIsLoading(false);
        return;
      }

      // Step 2: If there's a new image to upload
      let uploadedImageUrl = formData.group_image;
      if (formData.group_image_file && groupId) {
        try {
          uploadedImageUrl = await uploadImage(groupId, formData.group_image_file);
          
          // Update the group with the new image URL
          await fetch(`${API_URL}/api/socials/update-group/${groupId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              group_title: formData.group_title,
              group_description: formData.group_description,
              group_short_description: formData.group_short_description,
              group_image: uploadedImageUrl,
            }),
          });
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          alert("Group updated but image upload failed.");
        }
      }

      if (onEditGroup) {
        onEditGroup({
          ...updateData.data,
          group_image: uploadedImageUrl
        });
      }

      resetForm();
      cancel();
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      group_title: "",
      group_description: "",
      group_short_description: "",
      group_image: "",
      group_image_file: null,
    });
    setImagePreview("");
    setIsEditMode(false);
  };

  return (
    <>
      <div className="w-[390px] fixed top-0 right-0 h-full bg-white drop-shadow-2xl p-[32px] border border-[#E3E3E833] transition-all duration-300 ease-in-out scrollbar2 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-textSlightDark-0 font-bold text-[24px]">
            {isEditMode ? "Edit Group" : "Create Group"}
          </h1>
          <span onClick={cancel} className="cursor-pointer">
            <MdOutlineCancel size={20} className="text-[18px]" />
          </span>
        </div>

        <div className="dashboard_hr my-5"></div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* Group Title */}
          <div className="border border-[#D2D5DA] rounded-lg flex flex-col w-full py-[8px] px-[12px] hover:border-primaryColors-0 transition-colors">
            <label className="text-textGrey-0 text-[12px] font-medium">Group Title *</label>
            <input
              type="text"
              name="group_title"
              value={formData.group_title}
              onChange={handleChange}
              placeholder="Enter group name"
              className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px] placeholder:text-gray-400"
              required
            />
          </div>

          {/* Short Description */}
          <div className="border border-[#D2D5DA] rounded-lg flex flex-col w-full py-[8px] px-[12px] hover:border-primaryColors-0 transition-colors">
            <label className="text-textGrey-0 text-[12px] font-medium">Short Description *</label>
            <input
              type="text"
              name="group_short_description"
              value={formData.group_short_description}
              onChange={handleChange}
              placeholder="Brief description (max 100 chars)"
              maxLength={100}
              className="border-none outline-none w-full text-textSlightDark-0 font-[500] text-[16px] placeholder:text-gray-400"
              required
            />
          </div>

          {/* Full Description */}
          <div className="border border-[#D2D5DA] rounded-lg flex flex-col w-full py-[8px] px-[12px] hover:border-primaryColors-0 transition-colors">
            <label className="text-textGrey-0 text-[12px] font-medium">Full Description *</label>
            <textarea
              name="group_description"
              value={formData.group_description}
              onChange={handleChange}
              placeholder="Detailed description of your group..."
              rows={4}
              className="border-none outline-none text-textSlightDark-0 font-[500] resize-none placeholder:text-gray-400"
              required
            />
          </div>

          {/* Group Image Upload Section - PLACED HERE */}
          <div className="mt-2">
            <label className="text-textGrey-0 text-[12px] font-medium mb-2 block">
              Group Image
            </label>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                <div className="relative w-full h-[180px] bg-gray-100">
                  <Image
                    src={imagePreview}
                    alt="Group preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            )}
            
            {/* Drag & Drop Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                ${dragActive 
                  ? 'border-primaryColors-0 bg-primaryColors-0/5' 
                  : 'border-gray-300 hover:border-primaryColors-0 bg-gray-50 hover:bg-gray-100'
                }
                ${imagePreview ? 'mt-0' : 'mt-0'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader height={32} width={32} full_border_color="#E5E7EB" small_border_color="#3B82F6" border_width={3} />
                  <p className="text-sm text-gray-600">Uploading image...</p>
                </div>
              ) : (
                <>
                  <FaImage className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold text-primaryColors-0">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  {!imagePreview && (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <FaUpload size={12} />
                      Browse Files
                    </button>
                  )}
                </>
              )}
            </div>
            
            {!imagePreview && (
              <p className="text-xs text-gray-400 mt-2">
                Recommended: Square image, at least 200x200px
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-6">
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="form_more bg-primaryColors-0 text-white flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader
                  height={20}
                  width={20}
                  full_border_color="white"
                  small_border_color="transparent"
                  border_width={2}
                />
              ) : null}
              {isEditMode ? "Update Group" : "Create Group"}
            </button>

            <button
              type="button"
              onClick={cancel}
              className="form_more bg-[#F5F5F5] text-primaryColors-0 flex items-center gap-2 justify-center hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}