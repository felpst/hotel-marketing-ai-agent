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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="mr-2">🎯</span> Optimization Results
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Metrics Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">📊</span>
            <h4 className="text-lg font-semibold text-gray-800">Current Metrics</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">CTR</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-blue-700">
                  {currentMetrics.CTR}%
                </span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500">ROAS</p>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-green-700">
                  {currentMetrics.ROAS}x
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-xl mr-2">💡</span>
            <h4 className="text-lg font-semibold text-gray-800">Recommendations</h4>
          </div>
          
          <div className="space-y-4">
            {/* Action and Budget */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {getActionIcon(recommendations.action)}
                </span>
                <div>
                  <p className="text-sm text-gray-500">Recommended Action</p>
                  <p className={`text-lg font-bold capitalize ${getActionColor(recommendations.action)}`}>
                    {recommendations.action} budget
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">New Budget</p>
                <p className="text-lg font-bold text-gray-900">
                  ${recommendations.budget}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">ℹ️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {recommendations.message}
                  </p>
                </div>
              </div>
            </div>
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

export default OptimizationResultCard; 