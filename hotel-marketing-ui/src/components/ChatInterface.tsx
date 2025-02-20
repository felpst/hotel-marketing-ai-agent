import { useState, useRef, useEffect, ReactNode } from 'react';
import Message from './Message';
import { processUserMessage } from '../services/api';

interface ChatMessage {
  content: string | ReactNode;
  isUser: boolean;
  timestamp: string;
  isInitialMessage?: boolean;
  showOptions?: boolean;
}

interface ConversationState {
  flow: 'initial' | 'generate' | 'optimize';
  collectedData: {
    hotelName?: string;
    hotelUrl?: string;
    metrics?: {
      CTR?: number;
      ROAS?: number;
      currentBudget?: number;
    };
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    flow: 'initial',
    collectedData: {}
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    const initialMessage: ChatMessage = {
      content: "👋 Hi! I'm your Hotel Marketing Assistant. What would you like to do?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isInitialMessage: true
    };
    setMessages([initialMessage]);
  }, []);

  const addOptionsMessage = () => {
    const optionsMessage: ChatMessage = {
      content: "Would you like to generate another campaign or optimize this one?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
      isInitialMessage: true
    };
    setMessages(prev => [...prev, optionsMessage]);
  };

  const handleOptionSelect = async (option: 'generate' | 'optimize') => {
    const userMessage: ChatMessage = {
      content: option === 'generate' ? 'Generate a new campaign' : 'Optimize existing campaign',
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { response, nextState } = await processUserMessage(
        option === 'generate' ? 'generate' : 'optimize',
        conversationState
      );
      
      const botMessage: ChatMessage = {
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationState(nextState);
      
      // Only add options message if we're not starting a new flow
      if (nextState.flow === 'initial') {
        setTimeout(addOptionsMessage, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message || 'Something went wrong. Please try again.');
      
      const errorMessage: ChatMessage = {
        content: (error as Error).message || 'Something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationState({ flow: 'initial', collectedData: {} });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const { response, nextState } = await processUserMessage(inputValue, conversationState);
      
      const botMessage: ChatMessage = {
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setConversationState(nextState);
      
      // Only add options message if we've completed a flow and received results
      if (nextState.flow === 'initial' && response && typeof response !== 'string') {
        setTimeout(addOptionsMessage, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setError((error as Error).message || 'Something went wrong. Please try again.');
      
      const errorMessage: ChatMessage = {
        content: (error as Error).message || 'Something went wrong. Please try again.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setConversationState({ flow: 'initial', collectedData: {} });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new function to check if options are being shown
  const isShowingOptions = () => {
    const lastMessage = messages[messages.length - 1];
    return lastMessage && (lastMessage.isInitialMessage || lastMessage.showOptions);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex-none p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 rounded-xl p-2.5">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Hotel Marketing Assistant</h2>
            <p className="text-sm text-gray-500">AI-powered campaign optimization</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((message, index) => (
          <Message
            key={index}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
            isInitialMessage={message.isInitialMessage}
            onOptionSelect={message.isInitialMessage || message.showOptions ? handleOptionSelect : undefined}
          />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400 pl-4">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        {error && (
          <div className="mx-4 p-4 rounded-lg bg-red-50 border border-red-100">
            <div className="flex items-center text-red-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex-none p-6 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isShowingOptions()
                  ? "Please select an option above..."
                  : conversationState.flow === 'generate'
                  ? !conversationState.collectedData.hotelName
                    ? "Enter your hotel name..."
                    : "Enter your hotel website URL..."
                  : "Enter the requested metric..."
              }
              className={`w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
                ${(isLoading || isShowingOptions()) ? 'cursor-not-allowed opacity-60' : 'text-gray-700'}`}
              disabled={isLoading || isShowingOptions()}
            />
            {inputValue.trim() && !isLoading && !isShowingOptions() && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 