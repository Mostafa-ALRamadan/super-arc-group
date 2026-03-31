'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../../../../../components/admin/layout/AdminLayout';
import { useTranslations } from '../../../../../../contexts/TranslationContext';
import { leadershipService, type Leadership, type LeadershipFormData } from '../../../../../../services/entities/leadership.service';
import LoadingSpinner from '../../../../../../../components/ui/admin/LoadingSpinner';
import Alert from '../../../../../../../components/ui/admin/Alert';
import { useAuthCheck } from '../../../../../../hooks/useAuthCheck';
import { useAuth } from '../../../../../../contexts/AuthContext';

interface EditLeadershipMemberProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditLeadershipMember({ params }: EditLeadershipMemberProps) {
  // Check authentication on component mount
  useAuthCheck();
  const { isAuthenticated } = useAuth();
  const unwrappedParams = React.use(params);
  const leadershipId = parseInt(unwrappedParams.id);
  
  useEffect(() => {
    document.body.classList.add('admin-page');
    
    const hideElements = () => {
      const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
      const publicFooter = document.querySelector('footer') as HTMLElement;
      const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
      
      if (publicHeader) publicHeader.style.display = 'none';
      if (headerSpacer) headerSpacer.style.display = 'none';
      if (publicFooter) publicFooter.style.display = 'none';
    };

    hideElements();
    const timeoutId = setTimeout(hideElements, 100);
    
    return () => {
      document.body.classList.remove('admin-page');
      clearTimeout(timeoutId);
      
      const publicHeader = document.querySelector('header.fixed.top-0.left-0.right-0') as HTMLElement;
      const publicFooter = document.querySelector('footer') as HTMLElement;
      const headerSpacer = document.querySelector('div[style*="height: 80px"]') as HTMLElement;
      
      if (publicHeader) publicHeader.style.display = '';
      if (headerSpacer) headerSpacer.style.display = '';
      if (publicFooter) publicFooter.style.display = '';
    };
  }, []);

  const { t } = useTranslations();
  const router = useRouter();
  
  // State management
  const [formData, setFormData] = useState<LeadershipFormData>({
    name: {
      en: '',
      ar: ''
    },
    position: {
      en: '',
      ar: ''
    },
    description: {
      en: '',
      ar: ''
    },
    image_id: null
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [existingImage, setExistingImage] = useState<{ id: number; url: string } | null>(null);

  // Fetch leadership member data
  const fetchLeadershipMember = async () => {
    try {
      const member = await leadershipService.getById(leadershipId);
      setFormData({
        name: member.name,
        position: member.position,
        description: member.description,
        image_id: member.image_id || null
      });
      if (member.image) {
        setExistingImage(member.image);
        setImagePreview(member.image.url);
      }
    } catch (err) {
      console.error('Error fetching leadership member:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leadership member';
      
      // Check if it's a backend not available error
      if (errorMessage.includes('Backend is not available yet')) {
        setError('Backend API is not available yet. Please contact the development team to set up the leadership management endpoints.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeadershipMember();
    }
  }, [isAuthenticated, leadershipId]);

  // Handle form field changes
  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev: LeadershipFormData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof LeadershipFormData] as Record<string, any>),
          [child]: value
        }
      }));
    } else {
      setFormData((prev: LeadershipFormData) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    setFormData((prev: LeadershipFormData) => ({
      ...prev,
      image_id: null
    }));
  };

  // Upload image
  const handleUploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const result = await leadershipService.uploadImage(imageFile);
      return result.id;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.en || !formData.name.ar || !formData.position.en || !formData.position.ar) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Upload image if selected
      let imageId = formData.image_id;
      if (imageFile) {
        imageId = await handleUploadImage();
        if (imageId === null) {
          return; // Image upload failed
        }
      }
      
      // Update leadership member
      await leadershipService.update(leadershipId, {
        ...formData,
        image_id: imageId
      });
      
      setSuccess('Leadership member updated successfully');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/leadership');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating leadership member:', err);
      setError(err instanceof Error ? err.message : 'Failed to update leadership member');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLayout title="Edit Leadership Member">
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout title="Edit Leadership Member">
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Edit Leadership Member">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Leadership Member</h1>
          <p className="text-gray-600 mt-1">Update leadership team member information</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess(null)}
          />
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.name.en}
                  onChange={(e) => handleInputChange('name.en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.name.ar}
                  onChange={(e) => handleInputChange('name.ar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Position Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position (English) *
                </label>
                <input
                  type="text"
                  value={formData.position.en}
                  onChange={(e) => handleInputChange('position.en', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position (Arabic) *
                </label>
                <input
                  type="text"
                  value={formData.position.ar}
                  onChange={(e) => handleInputChange('position.ar', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Description Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description.en}
                  onChange={(e) => handleInputChange('description.en', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={formData.description.ar}
                  onChange={(e) => handleInputChange('description.ar', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo
              </label>
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-24 w-24 rounded-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a professional headshot. Recommended size: 200x200px.
                  </p>
                  {existingImage && (
                    <p className="text-xs text-green-600 mt-1">
                      Current image will be replaced when new image is uploaded.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.push('/admin/leadership')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting || uploadingImage ? 'Updating...' : 'Update Leadership Member'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
