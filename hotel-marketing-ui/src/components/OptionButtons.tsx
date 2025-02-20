import React from 'react';

interface OptionButtonsProps {
  onSelect: (option: 'generate' | 'optimize') => void;
}

const OptionButtons: React.FC<OptionButtonsProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onSelect('generate')}
        className="flex items-center justify-between w-full p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-200 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors duration-200">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">Generate Campaign</h3>
            <p className="text-sm text-gray-500">Create a new marketing campaign</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <button
        onClick={() => onSelect('optimize')}
        className="flex items-center justify-between w-full p-4 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-200 rounded-xl transition-all duration-200 group"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors duration-200">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors duration-200">Optimize Campaign</h3>
            <p className="text-sm text-gray-500">Improve your existing campaign</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transform group-hover:translate-x-1 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default OptionButtons; 