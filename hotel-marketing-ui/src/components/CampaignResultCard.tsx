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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <span className="text-xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Campaign Summary</h3>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {/* Budget Section */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Daily Budget</h4>
                <p className="text-xl font-semibold text-gray-900">${dailyBudget}</p>
              </div>
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
          </div>
        </div>

        {/* Keywords Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Target Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Ad Copies Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Ad Copies</h4>
          </div>
          <div className="space-y-3">
            {adCopies.map((ad, index) => (
              <div 
                key={index} 
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <h5 className="font-medium text-gray-900 mb-1">{ad.headline}</h5>
                <p className="text-sm text-gray-600 leading-relaxed">{ad.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locations Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">📍</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Target Locations</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {audienceLocations.map((location, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <span className="text-sm text-gray-600">{location}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {timestamp && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">{formatTimestamp(timestamp)}</p>
        </div>
      )}
    </div>
  );
};

const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date();
  const [time, period] = timestamp.split(' ');
  const [hours, minutes, seconds] = time.split(':');
  
  messageTime.setHours(
    period === 'PM' ? parseInt(hours) + 12 : parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  );

  const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`;
  }

  return messageTime.toLocaleDateString();
};

export default CampaignResultCard; 