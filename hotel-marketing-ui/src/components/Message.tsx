import React, { FC, ReactNode } from 'react';
import OptionButtons from './OptionButtons';

interface MessageProps {
  content: string | ReactNode;
  isUser: boolean;
  timestamp?: string;
  isInitialMessage?: boolean;
  onOptionSelect?: (option: 'generate' | 'optimize') => void;
}

const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const messageTime = new Date();
  const [time, period] = timestamp.split(' ');
  const [hours, minutes, seconds] = time.split(':');
  
  // Set the message time
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

const Message: FC<MessageProps> = ({ content, isUser, timestamp, isInitialMessage, onOptionSelect }) => {
  // Check if content is a result card (either campaign or optimization)
  const isResultCard = typeof content === 'object' && React.isValidElement(content);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      {/* Avatar for assistant */}
      {!isUser && !isResultCard && (
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      <div className={`max-w-[85%] ${isResultCard ? 'w-full' : ''}`}>
        {typeof content === 'string' ? (
          <div className={`
            relative p-4 rounded-2xl shadow-sm
            ${isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-100'
            }
          `}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
            
            {isInitialMessage && onOptionSelect && (
              <div className="mt-4">
                <OptionButtons onSelect={onOptionSelect} />
              </div>
            )}

            {timestamp && !isResultCard && (
              <p className={`
                text-xs mt-2
                ${isUser ? 'text-blue-100' : 'text-gray-400'}
              `}>
                {formatTimestamp(timestamp)}
              </p>
            )}
          </div>
        ) : (
          <div className={`
            relative rounded-2xl overflow-hidden
            ${isResultCard ? 'shadow-lg' : ''}
          `}>
            {content}
          </div>
        )}
      </div>

      {/* Avatar for user */}
      {isUser && !isResultCard && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message; 