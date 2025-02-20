import React from 'react';

interface OptionButtonsProps {
  onSelect: (option: 'generate' | 'optimize') => void;
}

const OptionButtons: React.FC<OptionButtonsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-3 w-full mt-3">
      <button
        onClick={() => onSelect('generate')}
        className="flex items-center justify-between px-4 py-3 bg-white hover:bg-blue-50 text-left rounded-lg border border-blue-100 hover:border-blue-500 transition-all duration-200 group"
      >
        <div className="flex items-center">
          <span className="text-xl mr-3">🎯</span>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-700">Generate Campaign</h3>
            <p className="text-sm text-gray-500">Create a new marketing campaign</p>
          </div>
        </div>
        <span className="text-blue-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200">
          →
        </span>
      </button>

      <button
        onClick={() => onSelect('optimize')}
        className="flex items-center justify-between px-4 py-3 bg-white hover:bg-purple-50 text-left rounded-lg border border-purple-100 hover:border-purple-500 transition-all duration-200 group"
      >
        <div className="flex items-center">
          <span className="text-xl mr-3">📈</span>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-purple-700">Optimize Campaign</h3>
            <p className="text-sm text-gray-500">Improve your existing campaign</p>
          </div>
        </div>
        <span className="text-purple-500 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-200">
          →
        </span>
      </button>
    </div>
  );
};

export default OptionButtons; 