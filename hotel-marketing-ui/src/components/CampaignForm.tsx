'use client';

import { useState } from 'react';
import api, { HotelDetails, Campaign } from '../services/api';

export default function CampaignForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState<HotelDetails>({
    hotelName: '',
    hotelUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await api.generateCampaign(formData);
      setCampaign(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Hotel Marketing Campaign Generator</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Hotel Name</label>
          <input
            type="text"
            name="hotelName"
            value={formData.hotelName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. Lily Hall"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hotel Website URL</label>
          <input
            type="url"
            name="hotelUrl"
            value={formData.hotelUrl}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="e.g. https://www.lilyhall.com"
            pattern="https?://.*"
            title="Please enter a valid URL starting with http:// or https://"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !validateUrl(formData.hotelUrl)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Campaign'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {campaign && (
        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Campaign Output</h2>
            
            <div className="space-y-6">
              {/* Keywords Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Keywords to Bid On</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.keywords.map((keyword, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ad Copy Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Ad Copy</h3>
                <div className="space-y-4">
                  {campaign.adCopies.map((ad, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded">
                      <h4 className="font-medium text-blue-700">{ad.headline}</h4>
                      <p className="mt-1 text-gray-600">{ad.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Locations Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Audience Locations to Bid On</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.audienceLocations.map((location, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                      {location}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Budget Section */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="text-lg font-medium mb-2">Recommended Daily Budget</h3>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-blue-700">${campaign.dailyBudget.toFixed(2)}</span>
                  <span className="ml-2 text-blue-600">per day</span>
                </div>
                <p className="mt-1 text-sm text-blue-600">
                  Optimized budget for maximum ROAS
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 