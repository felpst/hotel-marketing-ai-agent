import React, { FC, ReactNode } from 'react';
import OptionButtons from './OptionButtons';

interface MessageProps {
  content: string | ReactNode;
  isUser: boolean;
  timestamp?: string;
  isInitialMessage?: boolean;
  onOptionSelect?: (option: 'generate' | 'optimize') => void;
}

const Message: FC<MessageProps> = ({ content, isUser, timestamp, isInitialMessage, onOptionSelect }) => {
  // Check if content is a result card (either campaign or optimization)
  const isResultCard = typeof content === 'object' && React.isValidElement(content);

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : typeof content === 'string'
              ? 'bg-gray-100 text-gray-800 rounded-bl-none'
              : 'bg-transparent'
        }`}
      >
        {typeof content === 'string' ? (
          <div className="px-4 py-2">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            {isInitialMessage && onOptionSelect && (
              <OptionButtons onSelect={onOptionSelect} />
            )}
            {timestamp && !isResultCard && (
              <p className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {timestamp}
              </p>
            )}
          </div>
        ) : (
          <div className="w-full">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message; 