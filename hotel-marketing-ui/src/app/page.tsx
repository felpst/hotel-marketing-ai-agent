'use client';

import { useState } from 'react';
import CampaignForm from '@/components/CampaignForm';
import CampaignResults from '@/components/CampaignResults';
import { generateCampaign, CampaignResponse } from '@/services/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState<CampaignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: { hotelName: string; hotelUrl: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateCampaign(formData);
      setCampaignData(data);
    } catch (err) {
      setError('Failed to generate campaign. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotel Marketing Campaign Generator
          </h1>
          <p className="text-lg text-gray-600">
            Generate optimized marketing campaigns for your hotel with AI
          </p>
        </div>

        <CampaignForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {campaignData && <CampaignResults data={campaignData} />}
      </div>
    </main>
  );
}
