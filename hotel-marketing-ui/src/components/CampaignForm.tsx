'use client';

import { useState } from 'react';

interface FormData {
  hotelName: string;
  hotelUrl: string;
}

interface CampaignFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export default function CampaignForm({ onSubmit, isLoading }: CampaignFormProps) {
  const [formData, setFormData] = useState<FormData>({
    hotelName: '',
    hotelUrl: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.hotelName.trim()) {
      newErrors.hotelName = 'Hotel name is required';
    }
    
    if (!formData.hotelUrl.trim()) {
      newErrors.hotelUrl = 'Hotel URL is required';
    } else {
      try {
        new URL(formData.hotelUrl);
      } catch {
        newErrors.hotelUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div>
        <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700">
          Hotel Name
        </label>
        <input
          type="text"
          id="hotelName"
          value={formData.hotelName}
          onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter hotel name"
        />
        {errors.hotelName && (
          <p className="mt-1 text-sm text-red-600">{errors.hotelName}</p>
        )}
      </div>

      <div>
        <label htmlFor="hotelUrl" className="block text-sm font-medium text-gray-700">
          Hotel Website URL
        </label>
        <input
          type="url"
          id="hotelUrl"
          value={formData.hotelUrl}
          onChange={(e) => setFormData({ ...formData, hotelUrl: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="https://www.example.com"
        />
        {errors.hotelUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.hotelUrl}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Generating Campaign...' : 'Generate Campaign'}
      </button>
    </form>
  );
} 