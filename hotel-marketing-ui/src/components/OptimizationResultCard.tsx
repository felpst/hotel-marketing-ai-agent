import React from 'react';

interface OptimizationResultProps {
  currentMetrics: {
    CTR: number;
    ROAS: number;
  };
  recommendations: {
    action: 'increase' | 'decrease' | 'maintain';
    budget: number;
    message: string;
  };
  timestamp?: string;
}

const OptimizationResultCard: React.FC<OptimizationResultProps> = ({
  currentMetrics,
  recommendations,
  timestamp
}) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getActionBgColor = (action: string) => {
    switch (action) {
      case 'increase':
        return 'bg-green-50';
      case 'decrease':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'increase':
        return '📈';
      case 'decrease':
        return '📉';
      default:
        return '📊';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <span className="text-xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Optimization Results</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Current Metrics Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Current Metrics</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Click-Through Rate</p>
              <div className="flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {currentMetrics.CTR}%
                </span>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Return on Ad Spend</p>
              <div className="flex items-baseline">
                <span className="text-xl font-semibold text-gray-900">
                  {currentMetrics.ROAS}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <span className="text-xl">💡</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800">Recommendations</h4>
          </div>
          
          <div className={`p-4 rounded-xl ${getActionBgColor(recommendations.action)} border border-gray-100`}>
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <span className="text-2xl">{getActionIcon(recommendations.action)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-2">
                  <h5 className={`text-base font-medium ${getActionColor(recommendations.action)}`}>
                    {recommendations.action === 'increase' ? 'Increase Budget' : 
                     recommendations.action === 'decrease' ? 'Decrease Budget' : 'Maintain Budget'}
                  </h5>
                  <span className="text-lg font-semibold text-gray-900">
                    ${recommendations.budget}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {recommendations.message}
                </p>
              </div>
            </div>
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

export default OptimizationResultCard; 