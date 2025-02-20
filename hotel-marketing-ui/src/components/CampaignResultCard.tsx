import React from 'react';

interface CampaignResultProps {
  dailyBudget: number;
  keywords: string[];
  adCopies: Array<{
    headline: string;
    body: string;
  }>;
  audienceLocations: string[];
  timestamp?: string;
}

const CampaignResultCard: React.FC<CampaignResultProps> = ({
  dailyBudget,
  keywords,
  adCopies,
  audienceLocations,
  timestamp
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">📊</span> Campaign Summary
        </h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Budget Section */}
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-500">Daily Budget</h4>
              <p className="text-2xl font-bold text-green-600">${dailyBudget}</p>
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">🎯</span>
            <h4 className="text-lg font-semibold text-gray-800">Target Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Ad Copies Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">📝</span>
            <h4 className="text-lg font-semibold text-gray-800">Ad Copies</h4>
          </div>
          <div className="space-y-3">
            {adCopies.map((ad, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-1">{ad.headline}</h5>
                <p className="text-gray-600">{ad.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locations Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-xl mr-2">📍</span>
            <h4 className="text-lg font-semibold text-gray-800">Target Locations</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {audienceLocations.map((location, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-700">{location}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {timestamp && (
        <div className="px-6 py-3 bg-white border-t">
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default CampaignResultCard; 